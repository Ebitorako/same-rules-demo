"""Prepare the supplied AAC music without re-encoding, and three original cues.

Source masters stay local in docs/reference/audio. The shipped catalogue records
provenance and hashes; a fresh clone needs those masters to repeat preparation.
Uses only Python's standard library.
"""
from pathlib import Path
import hashlib, json, math, random, struct, wave

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/assets/audio'
MASTERS = ROOT / 'docs/reference/audio'
RATE = 44100
SOURCES = [
 ('全程游戏音乐bgm.m4a', 'music/main.m4a', 'bgm_main', 120, '普通棋盘和场景的背景循环'),
 ('放背景介绍bgm.m4a', 'music/introduction.m4a', 'bgm_intro', None, '标题、章节开场、Creative Director晋升与终章'),
 ('Chapter2—03—酒吧情节bgm.m4a', 'music/ch2_bar.m4a', 'bgm_bar', 90, 'C2-03酒吧场景及其选择结果'),
 ('Chapter3—05—圣诞派对bgm.m4a', 'music/ch3_party.m4a', 'bgm_party', 90, 'C3-05圣诞聚会场景及其选择结果'),
 ('玩家走格子音效.m4a', 'effects/move.m4a', 'sfx_move', 0.65, '棋子开始移动'),
 ('玩家落地格子音效.m4a', 'effects/land.m4a', 'sfx_land', 1.1, '棋子移动完成落地'),
 ('抽跳出卡牌-触发音.m4a', 'effects/card.m4a', 'sfx_card', 0.35, '打开剧情卡或历史卡'),
 ('应用游戏全局-选项确认时音效.m4a', 'effects/choose.m4a', 'sfx_choose', 0.4, '确认有效选项；锁定项和普通导航不触发'),
 ('Chapter1-结局-成功入职触发音效.m4a', 'effects/ch1_hired.m4a', 'sfx_hired', None, '第一章CH1-E01或E02录用；拒绝/Burnout不触发'),
]

def boxes(data):
    pos = 0
    while pos + 8 <= len(data):
        size, kind = struct.unpack_from('>I4s', data, pos)
        header = 8
        if size == 1:
            size = struct.unpack_from('>Q', data, pos + 8)[0]
            header = 16
        if size == 0: size = len(data) - pos
        if size < header or pos + size > len(data): raise ValueError('Invalid MP4 box')
        yield kind.decode('latin1'), data[pos+header:pos+size]
        pos += size

def box(kind, data): return struct.pack('>I4s', len(data)+8, kind.encode()) + data
def child(data, name): return next(payload for kind, payload in boxes(data) if kind == name)
def path(data, *names):
    for name in names: data = child(data, name)
    return data
def timing(data):
    version = data[0]
    return struct.unpack_from('>IQ' if version else '>II', data, 20 if version else 12)
def seconds(data):
    scale, duration = timing(path(data,'moov','mvhd'))
    return duration/scale
def digest(data): return hashlib.sha256(data).hexdigest()

def prefix_aac(data, limit):
    """Copy the first complete AAC packets and rebuild their MP4 sample tables."""
    moov = child(data,'moov')
    tracks = [p for k,p in boxes(moov) if k == 'trak']
    if len(tracks) != 1: raise ValueError('Only single-track audio is supported')
    track = tracks[0]
    if b'edts' in [k.encode() for k,_ in boxes(track)]: raise ValueError('Edit-list source needs explicit review')
    stbl = path(track,'mdia','minf','stbl')
    scale, _ = timing(path(track,'mdia','mdhd'))
    movie_scale, _ = timing(child(moov,'mvhd'))
    stsz = child(stbl,'stsz')
    fixed, count = struct.unpack_from('>II',stsz,4)
    sizes = [fixed]*count if fixed else list(struct.unpack_from('>'+str(count)+'I',stsz,12))
    stts = child(stbl,'stts')
    entries = [struct.unpack_from('>II',stts,8+i*8) for i in range(struct.unpack_from('>I',stts,4)[0])]
    ticks, kept, new_times = 0, 0, []
    for amount, duration in entries:
        take = min(amount, max(0, int(limit*scale-ticks)//duration))
        if take: new_times.append((take,duration)); kept += take; ticks += take*duration
        if take < amount: break
    if not kept: raise ValueError('Excerpt is empty')
    offsets_data = child(stbl,'stco')
    offsets = struct.unpack_from('>'+str(struct.unpack_from('>I',offsets_data,4)[0])+'I',offsets_data,8)
    stsc = child(stbl,'stsc')
    chunks = [struct.unpack_from('>III',stsc,8+i*12) for i in range(struct.unpack_from('>I',stsc,4)[0])]
    sample_index, chunk_rule, packets = 0, 0, []
    for chunk_index, offset in enumerate(offsets,1):
        while chunk_rule+1 < len(chunks) and chunk_index >= chunks[chunk_rule+1][0]: chunk_rule+=1
        _, per_chunk, desc = chunks[chunk_rule]
        if desc != 1: raise ValueError('Multiple sample descriptions are unsupported')
        for _ in range(per_chunk):
            if sample_index >= kept: break
            length = sizes[sample_index]
            packets.append(data[offset:offset+length])
            offset += length; sample_index += 1
        if sample_index >= kept: break
    if sample_index != kept or any(len(p)!=size for p,size in zip(packets,sizes)): raise ValueError('Sample extraction failed')
    ftyp = box('ftyp', child(data,'ftyp'))
    mdat = box('mdat', b''.join(packets))
    movie_ticks = round(ticks/scale*movie_scale)
    def rewrite(payload):
        result=[]
        for kind, body in boxes(payload):
            if kind in ('trak','mdia','minf','stbl'): body=rewrite(body)
            elif kind in ('mvhd','mdhd','tkhd'):
                body=bytearray(body); version=body[0]
                offset=(28 if version else 20) if kind=='tkhd' else (24 if version else 16)
                struct.pack_into('>Q' if version else '>I',body,offset,ticks if kind=='mdhd' else movie_ticks)
                body=bytes(body)
            elif kind=='stts': body=b'\0'*4+struct.pack('>I',len(new_times))+b''.join(struct.pack('>II',*x) for x in new_times)
            elif kind=='stsc': body=b'\0'*4+struct.pack('>IIII',1,1,kept,1)
            elif kind=='stsz': body=b'\0'*4+struct.pack('>II',0,kept)+struct.pack('>'+str(kept)+'I',*sizes[:kept])
            elif kind=='stco': body=b'\0'*4+struct.pack('>II',1,len(ftyp)+8)
            elif kind in ('udta','tgas'): continue
            result.append(box(kind,body))
        return b''.join(result)
    prepared=ftyp+mdat+box('moov',rewrite(moov))
    assert abs(seconds(prepared)-ticks/scale)<1/movie_scale
    return prepared

def cue(kind, duration):
    rng=random.Random(5369)
    samples=[]
    previous=0.0
    for i in range(round(RATE*duration)):
        t=i/RATE
        if kind=='flip':
            envelope=math.sin(math.pi*t/duration)**2
            noise=rng.uniform(-1,1)
            value=(noise-previous)*0.12*envelope
            previous=noise
        elif kind=='boss':
            value=sum(0.12*math.sin(2*math.pi*f*(t-delay))*math.exp(-12*(t-delay)) for f,delay in [(164.81,0),(220,0.16)] if t>=delay)
        else:
            value=sum(0.095*math.sin(2*math.pi*f*(t-delay))*math.exp(-3.8*(t-delay)) for f,delay in [(392,0),(440,0.17),(523.25,0.34)] if t>=delay)
        edge=min(1,t/0.008,(duration-t)/0.04)
        samples.append(max(-32767,min(32767,round(value*max(0,edge)*32767))))
    return samples

def prepare():
    MASTERS.mkdir(parents=True,exist_ok=True)
    catalogue=[]
    for original, destination, key, limit, context in SOURCES:
        master=MASTERS/original
        incoming=OUT/original
        if not master.exists() and not incoming.exists(): raise FileNotFoundError(original)
        source=master if master.exists() else incoming
        payload=source.read_bytes()
        prepared=prefix_aac(payload,limit) if limit else payload
        target=OUT/destination
        target.parent.mkdir(parents=True,exist_ok=True)
        target.write_bytes(prepared)
        if not master.exists():
            assert source.resolve().is_relative_to(OUT.resolve()) and master.resolve().is_relative_to(MASTERS.resolve())
            source.rename(master)
        processing = '保持原始音频数据'
        if limit: processing = f'原AAC数据前{limit}秒，不重编码；' + ('播放端淡入淡出' if key.startswith('bgm') else '仅裁掉有效声音之后的静音尾部')
        if key=='bgm_party': processing += '；播放从3.0秒开始，跳过前导静音'
        catalogue.append({'key':'audio/'+key,'path':'assets/audio/'+destination,'originalFile':original,'originalSeconds':round(seconds(payload),3),'seconds':round(seconds(prepared),3),'sourceSha256':digest(payload),'outputSha256':digest(prepared),'bytes':len(prepared),'context':context,'provenance':'用户提供；原始文件本地保留，未补造授权信息','processing':processing})
    for kind,duration,context in [('boss',0.64,'Boss卡首次打开，短促低音提示'),('ending',1.25,'终局首次出现；全部结局同一中性提示'),('flip',0.22,'结局/收藏卡翻面，轻微纸张声')]:
        samples=cue(kind,duration)
        target=OUT/'effects'/f'{kind}.wav'
        with wave.open(str(target),'wb') as f:
            f.setparams((1,2,RATE,len(samples),'NONE','not compressed')); f.writeframes(struct.pack('<'+str(len(samples))+'h',*samples))
        payload=target.read_bytes()
        rms=math.sqrt(sum((s/32768)**2 for s in samples)/len(samples))
        catalogue.append({'key':'audio/sfx_'+kind,'path':'assets/audio/effects/'+kind+'.wav','seconds':duration,'bytes':len(payload),'outputSha256':digest(payload),'peakDbfs':round(20*math.log10(max(abs(s) for s in samples)/32768),2),'rmsDbfs':round(20*math.log10(rms),2),'context':context,'provenance':'本项目代码原创合成，无外部采样；scripts/prepare-audio.py','processing':'44.1kHz单声道16位PCM；固定种子、边缘渐变防爆音'})
    catalogue_path=OUT/'catalog.json'
    previous=json.loads(catalogue_path.read_text(encoding='utf-8')) if catalogue_path.exists() else {}
    old_assets={item['key']:item for item in previous.get('assets',[])}
    unchanged=len(old_assets)==len(catalogue) and all(old_assets.get(item['key'],{}).get('outputSha256')==item['outputSha256'] for item in catalogue)
    if unchanged:
        for item in catalogue:
            if 'browserDecode' in old_assets[item['key']]: item['browserDecode']=old_assets[item['key']]['browserDecode']
    record={'date':'2026-11-03','sourceMasters':'docs/reference/audio（本地原稿，不进入发布包）','listeningStatus':previous.get('listeningStatus','待浏览器解码与播放检查。') if unchanged else '文件已变化，需要重新进行浏览器解码与播放检查。','assets':catalogue}
    if unchanged and previous.get('verification'): record['verification']=previous['verification']
    catalogue_path.write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'assets':len(catalogue),'bytes':sum(x['bytes'] for x in catalogue)},ensure_ascii=False))

if __name__=='__main__': prepare()
