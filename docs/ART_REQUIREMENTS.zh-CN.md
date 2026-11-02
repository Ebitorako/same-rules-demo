# Genderpoly 美术与音频制作清单

**2026 年 11 月 3 日 · 按 CH1–4 正式剧本整理**

剧情来源：[组员工作表](https://docs.google.com/spreadsheets/d/1I28ChU7iAl6aHeJ9U5UPgOz2YptRXfwZ8VwOgwCg8Ow/edit)。本清单根据章节页的场景、NPC、表情与美术需求字段整理；原始快照保存在 `docs/source/2026-11-03-team-sheet.json`。人设中的发型、衣服与构图建议是制作方案，不是新增剧情设定。

你已经完成的 **2 枚棋子、4 位 Boss** 直接复用。你确认这些成品和音频还未放入项目，因此现在只需要按下表放入；不要重新生成六个角色。未收到文件前，无法确认透明度、裁切或音频格式。

## 先做哪些：明确数量

| 批次 | 新增图数 | 内容 |
| --- | --- | --- |
| 现有成品 | 6 张，复用 | 2 棋子 + 4 Boss |
| P0 首批完整基础视觉 | 25 张 | 11 张基础头像（含 Guide）+ 13 张真正结局图 + 1 张卡背 |
| P1 剧情表情补齐 | 再加 27 张 | 按真实表情字段补齐；基础头像与反应头像总计 38 张 |
| 可选 Boss 反应 | 再加 9 张 | Old Boys’ Network / Ideal Worker / System 各 3 张；基础图已可复用 |
| P2 晋升过渡图 | 再加 2 张 | CH1-E01 / CH2-E07 已有独立插槽，不计入13个终局 |

首批合计 **31 张上屏图（已有6 + 新25）**；补齐剧情表情后合计 **58 张**；如也补可选 Boss 表情则 **67 张**。另有 **P2 过渡插图2张**，已有独立插槽，可最后准备；全部条目合计 **69张**。这些是文件数，不是每张都要重新设计一个角色。无需为每个选项单独画一张。

**没有额外美术也能继续开发。** P0 是优先完成视觉的顺序，不是游戏运行的硬门槛。章节开场用文字；晋升过渡有独立图片插槽，列为P2可选；普通格子、金属格、翻面、悬停放大、位移由程序绘制，无需另做图片或动画帧。

## 已有文件放这里

项目根目录：

`D:\BaiduSyncdisk\NUS\ACE Y2S1\NMC5369 Gender and Global Communication\Assignments\Media Project\Game Demo`

| 你的成品 | 在 Game Demo 内的位置 |
| --- | --- |
| 女玩家棋子 | `public/assets/characters/pawn_female.png` |
| 男玩家棋子 | `public/assets/characters/pawn_male.png` |
| The Gatekeeper | `public/assets/bosses/gatekeeper.png` |
| The Old Boys’ Network | `public/assets/bosses/old_boys_network.png` |
| The Ideal Worker | `public/assets/bosses/ideal_worker.png` |
| The System | `public/assets/bosses/the_system.png` |

音频统一放 `public/assets/audio/`，见后文六个建议文件名。未分类的原始音频可先放 `docs/reference/audio/`；棋子设定稿放 `docs/reference/players/`，Boss设定稿放 `docs/reference/bosses/`。参考资料不会自动进入游戏，也不建议把完整多视图设定表直接当作游戏头像。

PNG / WebP 请导出真正透明背景；SVG 也可。**不要只是把扩展名改成 .png。** 原文件若已经是正确格式，可保留格式并调整 `public/assets/manifest.json` 的路径。相同文件名直接替换即可；你可以自行调整子文件夹，但要同步更新路径表右侧路径，固定资源名称不变。

## 统一画面要求

- 1930年代黑白 rubber-hose 卡通表现，现代伦敦创意制作行业背景，扁平填色、粗黑线。不要把故事改成1930年代职业服装或老式设备。
- 黑线 #141414、奶油白 #F4EFE3、纸底 #E6DFCF。玩家只保留已批准的挂绳识别色：女 #C7716B、男 #5B7FA6。
- 所有角色统一大白椭圆眼、黑瞳、简单眉嘴。NPC年龄、种族、具体穿着没有源表依据时，不写成剧情事实。
- 先做一张 neutral 标准像；后续表情上传这张作为参考，锁定人物、姿势、衣服、道具、裁切和大小，只改表情。
- 棋子/Boss 1024×1024透明；NPC 768×768透明；结局图1200×800横版；卡背900×1200竖版。建议以清晰度合格为前提压到角色每张约300KB、结局每张约500KB。
- 透明边留足，不裁头发、手套或鞋；不要在图里烘焙游戏卡框、金属底、分数、理论、对白或品牌文字。纸纹是全局效果，不必叠加到每张图。
- 简历、门牌、邮件等文字由游戏/后期排版处理；图像生成只留可排字的空白位置，避免错误英文。

## 角色、表情与人设

| 角色／文件前缀 | 基础+完整表情数 | 实际使用的表情 |
| --- | --- | --- |
| 招聘经理 / `hiring-manager` | 5 | 中性 `neutral`、满意 `pleased`、皱眉 `frowning`、尴尬 `awkward`、冷淡 `cold` |
| 资深制片人 / `senior-producer` | 2 | 中性 `neutral`、满意 `pleased` |
| 创意总监（第二章） / `creative-director` | 5 | 中性 `neutral`、满意 `pleased`、皱眉 `frowning`、尴尬 `awkward`、冷淡 `cold` |
| 同事 Sophie / `sophie` | 4 | 中性 `neutral`、满意 `pleased`、皱眉 `frowning`、冷淡 `cold` |
| 执行制片人 / `executive-producer` | 4 | 中性 `neutral`、满意 `pleased`、打量 `appraising`、皱眉 `frowning` |
| 伴侣 / `your-partner` | 4 | 中性 `neutral`、满意 `pleased`、打量 `appraising`、尴尬 `awkward` |
| 伴侣／委约人组合 / `your-partner-commissioner` | 3 | 中性 `neutral`、满意 `pleased`、尴尬 `awkward` |
| 人力资源经理 / `hr-manager` | 3 | 中性 `neutral`、满意 `pleased`、打量 `appraising` |
| 实习生 Mia / `intern-mia` | 4 | 中性 `neutral`、满意 `pleased`、尴尬 `awkward`、冷淡 `cold` |
| 公司 CEO / `ceo` | 3 | 中性 `neutral`、满意 `pleased`、打量 `appraising` |
| 规则书／常驻引导人 / `guide` | 1 | 中性 `neutral` |

合计 **38 张 NPC/Guide 文件**，其中 **11 张 neutral** 为首批，其余 **27 张** 为反应。表中的 neutral 包括选择前的正常头像；不是擅自增加剧情反应。Hiring Manager不需要appraising；Senior Producer只需neutral/pleased；普通Creative Director不需appraising（该反应属于第二章Boss）。

**Boss处理：** 四块棋盘和四章Boss卡共用 `bosses/` 人设。C2虽显示Creative Director姓名、C4显示Chair of the Board，Boss卡都用对应Boss图；不要因此多做一整套董事会主席头像。普通第二章剧情仍使用Creative Director人物头像。

**伴侣处理：** 为避免在两种玩家路线中画出与文字相反的伴侣性别，首批采用中性化共用形象。若你明确希望男女各一套，制作前先让开发加按棋子切换，不能只多放两个文件就自动切换。“Your partner / Commissioner”是一个双人共用头像位置，不是一个叫这个名字的新人物；用同一伴侣加委约人的组合图。

### 招聘经理

**剧情明确：** Ch1 C1-01—C1-03：剧情明确为女性，主持服装印象、作品集与面试。

**建议造型：** 建议：利落短发、简单西装外套、小夹板；以职业礼貌为基调。发型和服装属于设计建议。

**文件：** `public/assets/npc/hiring-manager_neutral.png`、`public/assets/npc/hiring-manager_pleased.png`、`public/assets/npc/hiring-manager_frowning.png`、`public/assets/npc/hiring-manager_awkward.png`、`public/assets/npc/hiring-manager_cold.png`

**角色描述 Prompt：**

> An adult female hiring manager at a London production company. A tidy short hairstyle, simple tailored blazer and a small interview clipboard. Professional, attentive and believable; do not make her an obvious villain.

### 资深制片人

**剧情明确：** Ch1 C1-04：试工结束给予反馈的男经理/资深制片人。

**建议造型：** 建议：稍宽的肩部轮廓、卷起袖口的衬衫、薄薄一叠制作文件；与执行制片人区分。

**文件：** `public/assets/npc/senior-producer_neutral.png`、`public/assets/npc/senior-producer_pleased.png`

**角色描述 Prompt：**

> An adult male senior producer giving feedback after an unpaid production trial. Broad rounded silhouette, plain shirt with neatly rolled sleeves, a thin stack of production schedules. Calm and matter-of-fact, not heroic or threatening.

### 创意总监（第二章）

**剧情明确：** Ch2 C2-01—C2-04A/D：男性，控制创意认可、社交与晋升；不是第四章的玩家，也不要与同事 Daniel 自动合并。

**建议造型：** 建议：窄而清楚的外套轮廓、侧分头发、咖啡杯；同一人物只换表情，不换身份。

**文件：** `public/assets/npc/creative-director_neutral.png`、`public/assets/npc/creative-director_pleased.png`、`public/assets/npc/creative-director_frowning.png`、`public/assets/npc/creative-director_awkward.png`、`public/assets/npc/creative-director_cold.png`

**角色描述 Prompt：**

> The adult male Creative Director from Chapter 2, an established decision-maker in a contemporary London creative company. Narrow tailored jacket silhouette, simple side-parted hair and a small coffee cup. Polished everyday workplace authority, outwardly ordinary and socially at ease. He is not Daniel and not the player character.

### 同事 Sophie

**剧情明确：** Ch2 C2-04B/C：同批入职的女性同事，也是酒吧谈话涉及的当事人。

**建议造型：** 建议：简洁及肩发、针织上衣、普通员工证；不要通过外貌把受害者性化。

**文件：** `public/assets/npc/sophie_neutral.png`、`public/assets/npc/sophie_pleased.png`、`public/assets/npc/sophie_frowning.png`、`public/assets/npc/sophie_cold.png`

**角色描述 Prompt：**

> Sophie, an adult female colleague who joined the production company in the same intake as the player. Simple shoulder-length hair, plain knit top and an unlettered employee badge. An equal professional colleague, never sexualised or reduced to a helpless stereotype.

### 执行制片人

**剧情明确：** Ch3 C3-01、C3-03b、C3-04a/b：男性，谈晋升、代班并安排深夜剪辑。

**建议造型：** 建议：较长脸部轮廓、保守外套、文件夹；与 Senior Producer 和第二章总监保留显著区别。

**文件：** `public/assets/npc/executive-producer_neutral.png`、`public/assets/npc/executive-producer_pleased.png`、`public/assets/npc/executive-producer_appraising.png`、`public/assets/npc/executive-producer_frowning.png`

**角色描述 Prompt：**

> An adult male Executive Producer in television, senior to the player. A longer face silhouette, conservative jacket and a closed production folder held low. Everyday managerial composure; a distinct design from the Senior Producer and Chapter 2 Creative Director.

### 伴侣

**剧情明确：** Ch3 C3-02、C3-03a：同样在电视行业工作。女玩家路线文字用 he，男玩家路线用 she。

**建议造型：** 首批建议用中性化外观的共用角色，避免在男女路线出现明显相反的视觉性别；不另加未接入的两套头像。若要男女两套，应先让开发接入按棋子切换。

**文件：** `public/assets/npc/your-partner_neutral.png`、`public/assets/npc/your-partner_pleased.png`、`public/assets/npc/your-partner_appraising.png`、`public/assets/npc/your-partner_awkward.png`

**角色描述 Prompt：**

> The player’s adult partner, also a television-production worker of a similar career level. Use deliberately androgynous styling so this shared role portrait works with either player route: short slightly tousled hair, a plain soft knit top and a small unlettered production notebook. No strongly gender-coded accessories. A normal working adult, not a domestic-service caricature.

### 伴侣／委约人组合

**剧情明确：** Ch3 C3-05a/b 的 NPC 栏是两个说话人共用，并非第三个新人物。剧情提及女性委约人。

**建议造型：** 当前单头像位置使用双人半身组合：左为同一伴侣，右为委约人；二者不融合。先锁定 neutral 版，再做另外两个表情。后续如拆说话人可直接裁用同一角色，不重新设计。

**文件：** `public/assets/npc/your-partner-commissioner_neutral.png`、`public/assets/npc/your-partner-commissioner_pleased.png`、`public/assets/npc/your-partner-commissioner_awkward.png`

**角色描述 Prompt：**

> A compact two-person chest-up composition for the shared Partner / Commissioner portrait slot. On the left, reuse the exact approved androgynous TV-worker partner design. On the right, an adult female television commissioner, simple distinctive blazer, a small unlettered proposal folder. Both are normal professionals, slightly angled inward. Two clearly separate figures, not a merged face; same scale and enough room around both heads.

### 人力资源经理

**剧情明确：** Ch4 C4-01：提供 Chloe/Josh 资料并评价招聘选择；剧本未规定性别、年龄、发型。

**建议造型：** 建议：中性化外观、圆框眼镜、平整开衫和两份无字简历；不与第一章招聘经理强行合并。

**文件：** `public/assets/npc/hr-manager_neutral.png`、`public/assets/npc/hr-manager_pleased.png`、`public/assets/npc/hr-manager_appraising.png`

**角色描述 Prompt：**

> The HR Manager reviewing two internship applications in Chapter 4. An adult with gender-neutral styling, round spectacles, a neat cardigan and two unlettered CV sheets. A clearly different character from the Chapter 1 hiring manager. Practical institutional politeness, not overt malice.

### 实习生 Mia

**剧情明确：** Ch4 C4-02：另一团队的成年女性实习生，向玩家求助；不是受聘的 Chloe。

**建议造型：** 建议：简洁束发、普通上衣、实习工作证；神态克制，保持尊严，不夸张哭泣。

**文件：** `public/assets/npc/intern-mia_neutral.png`、`public/assets/npc/intern-mia_pleased.png`、`public/assets/npc/intern-mia_awkward.png`、`public/assets/npc/intern-mia_cold.png`

**角色描述 Prompt：**

> Mia, an adult female intern from another team who seeks help from the player. Simple tied-back hair, ordinary workplace top and an unlettered intern badge. A distinct design from Sophie and Chloe. Professional and dignified, with restrained readable emotion; no sexualisation, no infantilisation, no theatrical tears.

### 公司 CEO

**剧情明确：** Ch4 C4-03：要求提出 DEI 政策、交董事会审议；剧本没有限定外貌或性别。

**建议造型：** 建议：中性化外观、干净而较宽的西装轮廓、两手放在文件夹上；避免与董事会主席同一形象。

**文件：** `public/assets/npc/ceo_neutral.png`、`public/assets/npc/ceo_pleased.png`、`public/assets/npc/ceo_appraising.png`

**角色描述 Prompt：**

> The company CEO asking for a DEI policy proposal. An adult with gender-neutral styling, a broad clean suit silhouette and hands resting on an unlettered folder. Controlled executive politeness, distinct from the Creative Director, Executive Producer and Board Chair. No crown, money symbols or villain props.

### 规则书／常驻引导人

**剧情明确：** 常驻棋盘边与选择前；台词轻快，像行业前辈的小贴士。其象征性是“行业常识”的化身。

**建议造型：** 建议：一本会说话的小手册，橡皮管手臂、白手套，亲切自信；只做 neutral 一张即可。若已有引导人定稿，沿用定稿替换此建议。

**文件：** `public/assets/npc/guide_neutral.png`

**角色描述 Prompt：**

> An original friendly living workplace handbook as the resident guide. A small cream book body, flexible rubber-hose arms, white gloves, large oval eyes and a modest confident smile. It acts like an upbeat industry insider offering optional advice. Keep its cover blank; no title or readable writing. Use this concept only if the team has not already approved a different guide character.

## 可直接复制的完整 Prompt

打开同目录的 **ART_REQUIREMENTS.zh-CN.html**：每个文件都有独立完整Prompt与复制按钮，已经合并人设、当前表情、尺寸、风格和一致性约束，不需要自己拼接。该网页不联网；完成勾选只保存在当前浏览器，不会同步给组员。

本文件下面保留全部Prompt，方便在编辑器里直接复制。先上传对应角色neutral图或已批准Boss图，再复制目标文件的Prompt。

### 女玩家棋子 · 现有

文件：`public/assets/characters/pawn_female.png` · 1024×1024 · 透明

复用你已完成的定稿；不用重新生成。保留相同轮廓、尺度与透明边距。

```text
Use the attached approved female player-pawn artwork. Prepare one clean game-ready export without redesigning it. Keep the approved landscape employee-badge body, clip, two lanyard straps, rubber-hose arms, white gloves and round black shoes. Preserve the exact approved face and silhouette. The lanyard and small cheek gender marks retain #C7716B; all other styling matches the companion pawn. Full body centred, 1024 by 1024 pixels, real transparent background, all extremities inside the frame, no extra text or background. This is an export or cleanup task only, not a new character concept.
```

### 男玩家棋子 · 现有

文件：`public/assets/characters/pawn_male.png` · 1024×1024 · 透明

复用你已完成的定稿；不用重新生成。保留相同轮廓、尺度与透明边距。

```text
Use the attached approved male player-pawn artwork. Prepare one clean game-ready export without redesigning it. Keep the approved landscape employee-badge body, clip, two lanyard straps, rubber-hose arms, white gloves and round black shoes. Preserve the exact approved face and silhouette. The lanyard and small cheek gender marks retain #5B7FA6; all other styling matches the companion pawn. Full body centred, 1024 by 1024 pixels, real transparent background, all extremities inside the frame, no extra text or background. This is an export or cleanup task only, not a new character concept.
```

### The Gatekeeper · 现有

文件：`public/assets/bosses/gatekeeper.png` · 1024×1024 · 透明

复用已有人设。棋盘和Boss卡共用；金属红背景由程序生成，不能烘焙到角色图片。

```text
Use the attached already-approved The Gatekeeper artwork, preserving its exact character concept, silhouette, props, face construction and line quality. Do not replace it with a new human manager or a different symbolic object. Prepare one complete centred game-ready figure on a real transparent background, 1024 by 1024 pixels, with generous consistent margins and no cropped extremities. Remove any surrounding reference-sheet labels or backdrop. Do not include the 金属红 tile background: that is drawn by the game. No added text, watermark, animation strip or redesign.
```

### The Old Boys’ Network · 现有

文件：`public/assets/bosses/old_boys_network.png` · 1024×1024 · 透明

复用已有人设。棋盘和Boss卡共用；金属绿背景由程序生成，不能烘焙到角色图片。

```text
Use the attached already-approved The Old Boys’ Network artwork, preserving its exact character concept, silhouette, props, face construction and line quality. Do not replace it with a new human manager or a different symbolic object. Prepare one complete centred game-ready figure on a real transparent background, 1024 by 1024 pixels, with generous consistent margins and no cropped extremities. Remove any surrounding reference-sheet labels or backdrop. Do not include the 金属绿 tile background: that is drawn by the game. No added text, watermark, animation strip or redesign.
```

### The Ideal Worker · 现有

文件：`public/assets/bosses/ideal_worker.png` · 1024×1024 · 透明

复用已有人设。棋盘和Boss卡共用；金属蓝背景由程序生成，不能烘焙到角色图片。

```text
Use the attached already-approved The Ideal Worker artwork, preserving its exact character concept, silhouette, props, face construction and line quality. Do not replace it with a new human manager or a different symbolic object. Prepare one complete centred game-ready figure on a real transparent background, 1024 by 1024 pixels, with generous consistent margins and no cropped extremities. Remove any surrounding reference-sheet labels or backdrop. Do not include the 金属蓝 tile background: that is drawn by the game. No added text, watermark, animation strip or redesign.
```

### The System · 现有

文件：`public/assets/bosses/the_system.png` · 1024×1024 · 透明

复用已有人设。棋盘和Boss卡共用；金属紫背景由程序生成，不能烘焙到角色图片。

```text
Use the attached already-approved The System artwork, preserving its exact character concept, silhouette, props, face construction and line quality. Do not replace it with a new human manager or a different symbolic object. Prepare one complete centred game-ready figure on a real transparent background, 1024 by 1024 pixels, with generous consistent margins and no cropped extremities. Remove any surrounding reference-sheet labels or backdrop. Do not include the 金属紫 tile background: that is drawn by the game. No added text, watermark, animation strip or redesign.
```

### 招聘经理 · 中性 · P0

文件：`public/assets/npc/hiring-manager_neutral.png` · 768×768 · 透明

Ch1 C1-01—C1-03：剧情明确为女性，主持服装印象、作品集与面试。 先完成这一张，并把它作为该角色后续表情的参考。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

An adult female hiring manager at a London production company. A tidy short hairstyle, simple tailored blazer and a small interview clipboard. Professional, attentive and believable; do not make her an obvious villain.

Create this neutral master portrait and use the supplied approved cast as style references.
A composed, attentive neutral expression: relaxed brows, open eyes, a small closed mouth. Keep the expression legible at thumbnail size.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 招聘经理 · 满意 · P1

文件：`public/assets/npc/hiring-manager_pleased.png` · 768×768 · 透明

Ch1 C1-01—C1-03：剧情明确为女性，主持服装印象、作品集与面试。 只变化眉、眼、嘴，沿用该角色neutral定稿。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

An adult female hiring manager at a London production company. A tidy short hairstyle, simple tailored blazer and a small interview clipboard. Professional, attentive and believable; do not make her an obvious villain.

Use the attached approved hiring-manager_neutral.png as the exact identity reference. Do not change the hairstyle, face proportions, costume, prop, pose, crop or scale.
A restrained approving smile, gently lifted brows and relaxed open eyes. Communicate polite approval, not a huge grin.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 招聘经理 · 皱眉 · P1

文件：`public/assets/npc/hiring-manager_frowning.png` · 768×768 · 透明

Ch1 C1-01—C1-03：剧情明确为女性，主持服装印象、作品集与面试。 只变化眉、眼、嘴，沿用该角色neutral定稿。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

An adult female hiring manager at a London production company. A tidy short hairstyle, simple tailored blazer and a small interview clipboard. Professional, attentive and believable; do not make her an obvious villain.

Use the attached approved hiring-manager_neutral.png as the exact identity reference. Do not change the hairstyle, face proportions, costume, prop, pose, crop or scale.
Brows drawn together and a slight downward mouth, clearly showing disapproval or concern. No rage, shouting or exaggerated villain expression.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 招聘经理 · 尴尬 · P1

文件：`public/assets/npc/hiring-manager_awkward.png` · 768×768 · 透明

Ch1 C1-01—C1-03：剧情明确为女性，主持服装印象、作品集与面试。 只变化眉、眼、嘴，沿用该角色neutral定稿。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

An adult female hiring manager at a London production company. A tidy short hairstyle, simple tailored blazer and a small interview clipboard. Professional, attentive and believable; do not make her an obvious villain.

Use the attached approved hiring-manager_neutral.png as the exact identity reference. Do not change the hairstyle, face proportions, costume, prop, pose, crop or scale.
A hesitant uneven mouth and mildly uneasy brows, gaze slightly aside. Show an uncomfortable social pause, not comic panic.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 招聘经理 · 冷淡 · P1

文件：`public/assets/npc/hiring-manager_cold.png` · 768×768 · 透明

Ch1 C1-01—C1-03：剧情明确为女性，主持服装印象、作品集与面试。 只变化眉、眼、嘴，沿用该角色neutral定稿。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

An adult female hiring manager at a London production company. A tidy short hairstyle, simple tailored blazer and a small interview clipboard. Professional, attentive and believable; do not make her an obvious villain.

Use the attached approved hiring-manager_neutral.png as the exact identity reference. Do not change the hairstyle, face proportions, costume, prop, pose, crop or scale.
A flat closed mouth, level brows and a reserved distant gaze. Show professional distance, not anger or cruelty.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 资深制片人 · 中性 · P0

文件：`public/assets/npc/senior-producer_neutral.png` · 768×768 · 透明

Ch1 C1-04：试工结束给予反馈的男经理/资深制片人。 先完成这一张，并把它作为该角色后续表情的参考。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

An adult male senior producer giving feedback after an unpaid production trial. Broad rounded silhouette, plain shirt with neatly rolled sleeves, a thin stack of production schedules. Calm and matter-of-fact, not heroic or threatening.

Create this neutral master portrait and use the supplied approved cast as style references.
A composed, attentive neutral expression: relaxed brows, open eyes, a small closed mouth. Keep the expression legible at thumbnail size.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 资深制片人 · 满意 · P1

文件：`public/assets/npc/senior-producer_pleased.png` · 768×768 · 透明

Ch1 C1-04：试工结束给予反馈的男经理/资深制片人。 只变化眉、眼、嘴，沿用该角色neutral定稿。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

An adult male senior producer giving feedback after an unpaid production trial. Broad rounded silhouette, plain shirt with neatly rolled sleeves, a thin stack of production schedules. Calm and matter-of-fact, not heroic or threatening.

Use the attached approved senior-producer_neutral.png as the exact identity reference. Do not change the hairstyle, face proportions, costume, prop, pose, crop or scale.
A restrained approving smile, gently lifted brows and relaxed open eyes. Communicate polite approval, not a huge grin.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 创意总监（第二章） · 中性 · P0

文件：`public/assets/npc/creative-director_neutral.png` · 768×768 · 透明

Ch2 C2-01—C2-04A/D：男性，控制创意认可、社交与晋升；不是第四章的玩家，也不要与同事 Daniel 自动合并。 先完成这一张，并把它作为该角色后续表情的参考。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

The adult male Creative Director from Chapter 2, an established decision-maker in a contemporary London creative company. Narrow tailored jacket silhouette, simple side-parted hair and a small coffee cup. Polished everyday workplace authority, outwardly ordinary and socially at ease. He is not Daniel and not the player character.

Create this neutral master portrait and use the supplied approved cast as style references.
A composed, attentive neutral expression: relaxed brows, open eyes, a small closed mouth. Keep the expression legible at thumbnail size.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 创意总监（第二章） · 满意 · P1

文件：`public/assets/npc/creative-director_pleased.png` · 768×768 · 透明

Ch2 C2-01—C2-04A/D：男性，控制创意认可、社交与晋升；不是第四章的玩家，也不要与同事 Daniel 自动合并。 只变化眉、眼、嘴，沿用该角色neutral定稿。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

The adult male Creative Director from Chapter 2, an established decision-maker in a contemporary London creative company. Narrow tailored jacket silhouette, simple side-parted hair and a small coffee cup. Polished everyday workplace authority, outwardly ordinary and socially at ease. He is not Daniel and not the player character.

Use the attached approved creative-director_neutral.png as the exact identity reference. Do not change the hairstyle, face proportions, costume, prop, pose, crop or scale.
A restrained approving smile, gently lifted brows and relaxed open eyes. Communicate polite approval, not a huge grin.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 创意总监（第二章） · 皱眉 · P1

文件：`public/assets/npc/creative-director_frowning.png` · 768×768 · 透明

Ch2 C2-01—C2-04A/D：男性，控制创意认可、社交与晋升；不是第四章的玩家，也不要与同事 Daniel 自动合并。 只变化眉、眼、嘴，沿用该角色neutral定稿。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

The adult male Creative Director from Chapter 2, an established decision-maker in a contemporary London creative company. Narrow tailored jacket silhouette, simple side-parted hair and a small coffee cup. Polished everyday workplace authority, outwardly ordinary and socially at ease. He is not Daniel and not the player character.

Use the attached approved creative-director_neutral.png as the exact identity reference. Do not change the hairstyle, face proportions, costume, prop, pose, crop or scale.
Brows drawn together and a slight downward mouth, clearly showing disapproval or concern. No rage, shouting or exaggerated villain expression.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 创意总监（第二章） · 尴尬 · P1

文件：`public/assets/npc/creative-director_awkward.png` · 768×768 · 透明

Ch2 C2-01—C2-04A/D：男性，控制创意认可、社交与晋升；不是第四章的玩家，也不要与同事 Daniel 自动合并。 只变化眉、眼、嘴，沿用该角色neutral定稿。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

The adult male Creative Director from Chapter 2, an established decision-maker in a contemporary London creative company. Narrow tailored jacket silhouette, simple side-parted hair and a small coffee cup. Polished everyday workplace authority, outwardly ordinary and socially at ease. He is not Daniel and not the player character.

Use the attached approved creative-director_neutral.png as the exact identity reference. Do not change the hairstyle, face proportions, costume, prop, pose, crop or scale.
A hesitant uneven mouth and mildly uneasy brows, gaze slightly aside. Show an uncomfortable social pause, not comic panic.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 创意总监（第二章） · 冷淡 · P1

文件：`public/assets/npc/creative-director_cold.png` · 768×768 · 透明

Ch2 C2-01—C2-04A/D：男性，控制创意认可、社交与晋升；不是第四章的玩家，也不要与同事 Daniel 自动合并。 只变化眉、眼、嘴，沿用该角色neutral定稿。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

The adult male Creative Director from Chapter 2, an established decision-maker in a contemporary London creative company. Narrow tailored jacket silhouette, simple side-parted hair and a small coffee cup. Polished everyday workplace authority, outwardly ordinary and socially at ease. He is not Daniel and not the player character.

Use the attached approved creative-director_neutral.png as the exact identity reference. Do not change the hairstyle, face proportions, costume, prop, pose, crop or scale.
A flat closed mouth, level brows and a reserved distant gaze. Show professional distance, not anger or cruelty.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 同事 Sophie · 中性 · P0

文件：`public/assets/npc/sophie_neutral.png` · 768×768 · 透明

Ch2 C2-04B/C：同批入职的女性同事，也是酒吧谈话涉及的当事人。 先完成这一张，并把它作为该角色后续表情的参考。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

Sophie, an adult female colleague who joined the production company in the same intake as the player. Simple shoulder-length hair, plain knit top and an unlettered employee badge. An equal professional colleague, never sexualised or reduced to a helpless stereotype.

Create this neutral master portrait and use the supplied approved cast as style references.
A composed, attentive neutral expression: relaxed brows, open eyes, a small closed mouth. Keep the expression legible at thumbnail size.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 同事 Sophie · 满意 · P1

文件：`public/assets/npc/sophie_pleased.png` · 768×768 · 透明

Ch2 C2-04B/C：同批入职的女性同事，也是酒吧谈话涉及的当事人。 只变化眉、眼、嘴，沿用该角色neutral定稿。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

Sophie, an adult female colleague who joined the production company in the same intake as the player. Simple shoulder-length hair, plain knit top and an unlettered employee badge. An equal professional colleague, never sexualised or reduced to a helpless stereotype.

Use the attached approved sophie_neutral.png as the exact identity reference. Do not change the hairstyle, face proportions, costume, prop, pose, crop or scale.
A restrained approving smile, gently lifted brows and relaxed open eyes. Communicate polite approval, not a huge grin.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 同事 Sophie · 皱眉 · P1

文件：`public/assets/npc/sophie_frowning.png` · 768×768 · 透明

Ch2 C2-04B/C：同批入职的女性同事，也是酒吧谈话涉及的当事人。 只变化眉、眼、嘴，沿用该角色neutral定稿。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

Sophie, an adult female colleague who joined the production company in the same intake as the player. Simple shoulder-length hair, plain knit top and an unlettered employee badge. An equal professional colleague, never sexualised or reduced to a helpless stereotype.

Use the attached approved sophie_neutral.png as the exact identity reference. Do not change the hairstyle, face proportions, costume, prop, pose, crop or scale.
Brows drawn together and a slight downward mouth, clearly showing disapproval or concern. No rage, shouting or exaggerated villain expression.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 同事 Sophie · 冷淡 · P1

文件：`public/assets/npc/sophie_cold.png` · 768×768 · 透明

Ch2 C2-04B/C：同批入职的女性同事，也是酒吧谈话涉及的当事人。 只变化眉、眼、嘴，沿用该角色neutral定稿。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

Sophie, an adult female colleague who joined the production company in the same intake as the player. Simple shoulder-length hair, plain knit top and an unlettered employee badge. An equal professional colleague, never sexualised or reduced to a helpless stereotype.

Use the attached approved sophie_neutral.png as the exact identity reference. Do not change the hairstyle, face proportions, costume, prop, pose, crop or scale.
A flat closed mouth, level brows and a reserved distant gaze. Show professional distance, not anger or cruelty.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 执行制片人 · 中性 · P0

文件：`public/assets/npc/executive-producer_neutral.png` · 768×768 · 透明

Ch3 C3-01、C3-03b、C3-04a/b：男性，谈晋升、代班并安排深夜剪辑。 先完成这一张，并把它作为该角色后续表情的参考。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

An adult male Executive Producer in television, senior to the player. A longer face silhouette, conservative jacket and a closed production folder held low. Everyday managerial composure; a distinct design from the Senior Producer and Chapter 2 Creative Director.

Create this neutral master portrait and use the supplied approved cast as style references.
A composed, attentive neutral expression: relaxed brows, open eyes, a small closed mouth. Keep the expression legible at thumbnail size.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 执行制片人 · 满意 · P1

文件：`public/assets/npc/executive-producer_pleased.png` · 768×768 · 透明

Ch3 C3-01、C3-03b、C3-04a/b：男性，谈晋升、代班并安排深夜剪辑。 只变化眉、眼、嘴，沿用该角色neutral定稿。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

An adult male Executive Producer in television, senior to the player. A longer face silhouette, conservative jacket and a closed production folder held low. Everyday managerial composure; a distinct design from the Senior Producer and Chapter 2 Creative Director.

Use the attached approved executive-producer_neutral.png as the exact identity reference. Do not change the hairstyle, face proportions, costume, prop, pose, crop or scale.
A restrained approving smile, gently lifted brows and relaxed open eyes. Communicate polite approval, not a huge grin.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 执行制片人 · 打量 · P1

文件：`public/assets/npc/executive-producer_appraising.png` · 768×768 · 透明

Ch3 C3-01、C3-03b、C3-04a/b：男性，谈晋升、代班并安排深夜剪辑。 只变化眉、眼、嘴，沿用该角色neutral定稿。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

An adult male Executive Producer in television, senior to the player. A longer face silhouette, conservative jacket and a closed production folder held low. Everyday managerial composure; a distinct design from the Senior Producer and Chapter 2 Creative Director.

Use the attached approved executive-producer_neutral.png as the exact identity reference. Do not change the hairstyle, face proportions, costume, prop, pose, crop or scale.
An assessing look: one brow slightly raised, eyes focused, lips held in a small thoughtful line. Communicate scrutiny without making the character monstrous.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 执行制片人 · 皱眉 · P1

文件：`public/assets/npc/executive-producer_frowning.png` · 768×768 · 透明

Ch3 C3-01、C3-03b、C3-04a/b：男性，谈晋升、代班并安排深夜剪辑。 只变化眉、眼、嘴，沿用该角色neutral定稿。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

An adult male Executive Producer in television, senior to the player. A longer face silhouette, conservative jacket and a closed production folder held low. Everyday managerial composure; a distinct design from the Senior Producer and Chapter 2 Creative Director.

Use the attached approved executive-producer_neutral.png as the exact identity reference. Do not change the hairstyle, face proportions, costume, prop, pose, crop or scale.
Brows drawn together and a slight downward mouth, clearly showing disapproval or concern. No rage, shouting or exaggerated villain expression.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 伴侣 · 中性 · P0

文件：`public/assets/npc/your-partner_neutral.png` · 768×768 · 透明

Ch3 C3-02、C3-03a：同样在电视行业工作。女玩家路线文字用 he，男玩家路线用 she。 先完成这一张，并把它作为该角色后续表情的参考。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

The player’s adult partner, also a television-production worker of a similar career level. Use deliberately androgynous styling so this shared role portrait works with either player route: short slightly tousled hair, a plain soft knit top and a small unlettered production notebook. No strongly gender-coded accessories. A normal working adult, not a domestic-service caricature.

Create this neutral master portrait and use the supplied approved cast as style references.
A composed, attentive neutral expression: relaxed brows, open eyes, a small closed mouth. Keep the expression legible at thumbnail size.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 伴侣 · 满意 · P1

文件：`public/assets/npc/your-partner_pleased.png` · 768×768 · 透明

Ch3 C3-02、C3-03a：同样在电视行业工作。女玩家路线文字用 he，男玩家路线用 she。 只变化眉、眼、嘴，沿用该角色neutral定稿。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

The player’s adult partner, also a television-production worker of a similar career level. Use deliberately androgynous styling so this shared role portrait works with either player route: short slightly tousled hair, a plain soft knit top and a small unlettered production notebook. No strongly gender-coded accessories. A normal working adult, not a domestic-service caricature.

Use the attached approved your-partner_neutral.png as the exact identity reference. Do not change the hairstyle, face proportions, costume, prop, pose, crop or scale.
A restrained approving smile, gently lifted brows and relaxed open eyes. Communicate polite approval, not a huge grin.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 伴侣 · 打量 · P1

文件：`public/assets/npc/your-partner_appraising.png` · 768×768 · 透明

Ch3 C3-02、C3-03a：同样在电视行业工作。女玩家路线文字用 he，男玩家路线用 she。 只变化眉、眼、嘴，沿用该角色neutral定稿。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

The player’s adult partner, also a television-production worker of a similar career level. Use deliberately androgynous styling so this shared role portrait works with either player route: short slightly tousled hair, a plain soft knit top and a small unlettered production notebook. No strongly gender-coded accessories. A normal working adult, not a domestic-service caricature.

Use the attached approved your-partner_neutral.png as the exact identity reference. Do not change the hairstyle, face proportions, costume, prop, pose, crop or scale.
An assessing look: one brow slightly raised, eyes focused, lips held in a small thoughtful line. Communicate scrutiny without making the character monstrous.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 伴侣 · 尴尬 · P1

文件：`public/assets/npc/your-partner_awkward.png` · 768×768 · 透明

Ch3 C3-02、C3-03a：同样在电视行业工作。女玩家路线文字用 he，男玩家路线用 she。 只变化眉、眼、嘴，沿用该角色neutral定稿。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

The player’s adult partner, also a television-production worker of a similar career level. Use deliberately androgynous styling so this shared role portrait works with either player route: short slightly tousled hair, a plain soft knit top and a small unlettered production notebook. No strongly gender-coded accessories. A normal working adult, not a domestic-service caricature.

Use the attached approved your-partner_neutral.png as the exact identity reference. Do not change the hairstyle, face proportions, costume, prop, pose, crop or scale.
A hesitant uneven mouth and mildly uneasy brows, gaze slightly aside. Show an uncomfortable social pause, not comic panic.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 伴侣／委约人组合 · 中性 · P0

文件：`public/assets/npc/your-partner-commissioner_neutral.png` · 768×768 · 透明

Ch3 C3-05a/b 的 NPC 栏是两个说话人共用，并非第三个新人物。剧情提及女性委约人。 先完成这一张，并把它作为该角色后续表情的参考。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

A compact two-person chest-up composition for the shared Partner / Commissioner portrait slot. On the left, reuse the exact approved androgynous TV-worker partner design. On the right, an adult female television commissioner, simple distinctive blazer, a small unlettered proposal folder. Both are normal professionals, slightly angled inward. Two clearly separate figures, not a merged face; same scale and enough room around both heads.

Create this neutral master portrait and use the supplied approved cast as style references.
A composed, attentive neutral expression: relaxed brows, open eyes, a small closed mouth. Keep the expression legible at thumbnail size.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 伴侣／委约人组合 · 满意 · P1

文件：`public/assets/npc/your-partner-commissioner_pleased.png` · 768×768 · 透明

Ch3 C3-05a/b 的 NPC 栏是两个说话人共用，并非第三个新人物。剧情提及女性委约人。 只变化眉、眼、嘴，沿用该角色neutral定稿。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

A compact two-person chest-up composition for the shared Partner / Commissioner portrait slot. On the left, reuse the exact approved androgynous TV-worker partner design. On the right, an adult female television commissioner, simple distinctive blazer, a small unlettered proposal folder. Both are normal professionals, slightly angled inward. Two clearly separate figures, not a merged face; same scale and enough room around both heads.

Use the attached approved your-partner-commissioner_neutral.png as the exact identity reference. Do not change the hairstyle, face proportions, costume, prop, pose, crop or scale.
A restrained approving smile, gently lifted brows and relaxed open eyes. Communicate polite approval, not a huge grin.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 伴侣／委约人组合 · 尴尬 · P1

文件：`public/assets/npc/your-partner-commissioner_awkward.png` · 768×768 · 透明

Ch3 C3-05a/b 的 NPC 栏是两个说话人共用，并非第三个新人物。剧情提及女性委约人。 只变化眉、眼、嘴，沿用该角色neutral定稿。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

A compact two-person chest-up composition for the shared Partner / Commissioner portrait slot. On the left, reuse the exact approved androgynous TV-worker partner design. On the right, an adult female television commissioner, simple distinctive blazer, a small unlettered proposal folder. Both are normal professionals, slightly angled inward. Two clearly separate figures, not a merged face; same scale and enough room around both heads.

Use the attached approved your-partner-commissioner_neutral.png as the exact identity reference. Do not change the hairstyle, face proportions, costume, prop, pose, crop or scale.
A hesitant uneven mouth and mildly uneasy brows, gaze slightly aside. Show an uncomfortable social pause, not comic panic.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 人力资源经理 · 中性 · P0

文件：`public/assets/npc/hr-manager_neutral.png` · 768×768 · 透明

Ch4 C4-01：提供 Chloe/Josh 资料并评价招聘选择；剧本未规定性别、年龄、发型。 先完成这一张，并把它作为该角色后续表情的参考。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

The HR Manager reviewing two internship applications in Chapter 4. An adult with gender-neutral styling, round spectacles, a neat cardigan and two unlettered CV sheets. A clearly different character from the Chapter 1 hiring manager. Practical institutional politeness, not overt malice.

Create this neutral master portrait and use the supplied approved cast as style references.
A composed, attentive neutral expression: relaxed brows, open eyes, a small closed mouth. Keep the expression legible at thumbnail size.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 人力资源经理 · 满意 · P1

文件：`public/assets/npc/hr-manager_pleased.png` · 768×768 · 透明

Ch4 C4-01：提供 Chloe/Josh 资料并评价招聘选择；剧本未规定性别、年龄、发型。 只变化眉、眼、嘴，沿用该角色neutral定稿。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

The HR Manager reviewing two internship applications in Chapter 4. An adult with gender-neutral styling, round spectacles, a neat cardigan and two unlettered CV sheets. A clearly different character from the Chapter 1 hiring manager. Practical institutional politeness, not overt malice.

Use the attached approved hr-manager_neutral.png as the exact identity reference. Do not change the hairstyle, face proportions, costume, prop, pose, crop or scale.
A restrained approving smile, gently lifted brows and relaxed open eyes. Communicate polite approval, not a huge grin.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 人力资源经理 · 打量 · P1

文件：`public/assets/npc/hr-manager_appraising.png` · 768×768 · 透明

Ch4 C4-01：提供 Chloe/Josh 资料并评价招聘选择；剧本未规定性别、年龄、发型。 只变化眉、眼、嘴，沿用该角色neutral定稿。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

The HR Manager reviewing two internship applications in Chapter 4. An adult with gender-neutral styling, round spectacles, a neat cardigan and two unlettered CV sheets. A clearly different character from the Chapter 1 hiring manager. Practical institutional politeness, not overt malice.

Use the attached approved hr-manager_neutral.png as the exact identity reference. Do not change the hairstyle, face proportions, costume, prop, pose, crop or scale.
An assessing look: one brow slightly raised, eyes focused, lips held in a small thoughtful line. Communicate scrutiny without making the character monstrous.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 实习生 Mia · 中性 · P0

文件：`public/assets/npc/intern-mia_neutral.png` · 768×768 · 透明

Ch4 C4-02：另一团队的成年女性实习生，向玩家求助；不是受聘的 Chloe。 先完成这一张，并把它作为该角色后续表情的参考。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

Mia, an adult female intern from another team who seeks help from the player. Simple tied-back hair, ordinary workplace top and an unlettered intern badge. A distinct design from Sophie and Chloe. Professional and dignified, with restrained readable emotion; no sexualisation, no infantilisation, no theatrical tears.

Create this neutral master portrait and use the supplied approved cast as style references.
A composed, attentive neutral expression: relaxed brows, open eyes, a small closed mouth. Keep the expression legible at thumbnail size.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 实习生 Mia · 满意 · P1

文件：`public/assets/npc/intern-mia_pleased.png` · 768×768 · 透明

Ch4 C4-02：另一团队的成年女性实习生，向玩家求助；不是受聘的 Chloe。 只变化眉、眼、嘴，沿用该角色neutral定稿。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

Mia, an adult female intern from another team who seeks help from the player. Simple tied-back hair, ordinary workplace top and an unlettered intern badge. A distinct design from Sophie and Chloe. Professional and dignified, with restrained readable emotion; no sexualisation, no infantilisation, no theatrical tears.

Use the attached approved intern-mia_neutral.png as the exact identity reference. Do not change the hairstyle, face proportions, costume, prop, pose, crop or scale.
A restrained approving smile, gently lifted brows and relaxed open eyes. Communicate polite approval, not a huge grin.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 实习生 Mia · 尴尬 · P1

文件：`public/assets/npc/intern-mia_awkward.png` · 768×768 · 透明

Ch4 C4-02：另一团队的成年女性实习生，向玩家求助；不是受聘的 Chloe。 只变化眉、眼、嘴，沿用该角色neutral定稿。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

Mia, an adult female intern from another team who seeks help from the player. Simple tied-back hair, ordinary workplace top and an unlettered intern badge. A distinct design from Sophie and Chloe. Professional and dignified, with restrained readable emotion; no sexualisation, no infantilisation, no theatrical tears.

Use the attached approved intern-mia_neutral.png as the exact identity reference. Do not change the hairstyle, face proportions, costume, prop, pose, crop or scale.
A hesitant uneven mouth and mildly uneasy brows, gaze slightly aside. Show an uncomfortable social pause, not comic panic.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 实习生 Mia · 冷淡 · P1

文件：`public/assets/npc/intern-mia_cold.png` · 768×768 · 透明

Ch4 C4-02：另一团队的成年女性实习生，向玩家求助；不是受聘的 Chloe。 只变化眉、眼、嘴，沿用该角色neutral定稿。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

Mia, an adult female intern from another team who seeks help from the player. Simple tied-back hair, ordinary workplace top and an unlettered intern badge. A distinct design from Sophie and Chloe. Professional and dignified, with restrained readable emotion; no sexualisation, no infantilisation, no theatrical tears.

Use the attached approved intern-mia_neutral.png as the exact identity reference. Do not change the hairstyle, face proportions, costume, prop, pose, crop or scale.
A flat closed mouth, level brows and a reserved distant gaze. Show professional distance, not anger or cruelty.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 公司 CEO · 中性 · P0

文件：`public/assets/npc/ceo_neutral.png` · 768×768 · 透明

Ch4 C4-03：要求提出 DEI 政策、交董事会审议；剧本没有限定外貌或性别。 先完成这一张，并把它作为该角色后续表情的参考。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

The company CEO asking for a DEI policy proposal. An adult with gender-neutral styling, a broad clean suit silhouette and hands resting on an unlettered folder. Controlled executive politeness, distinct from the Creative Director, Executive Producer and Board Chair. No crown, money symbols or villain props.

Create this neutral master portrait and use the supplied approved cast as style references.
A composed, attentive neutral expression: relaxed brows, open eyes, a small closed mouth. Keep the expression legible at thumbnail size.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 公司 CEO · 满意 · P1

文件：`public/assets/npc/ceo_pleased.png` · 768×768 · 透明

Ch4 C4-03：要求提出 DEI 政策、交董事会审议；剧本没有限定外貌或性别。 只变化眉、眼、嘴，沿用该角色neutral定稿。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

The company CEO asking for a DEI policy proposal. An adult with gender-neutral styling, a broad clean suit silhouette and hands resting on an unlettered folder. Controlled executive politeness, distinct from the Creative Director, Executive Producer and Board Chair. No crown, money symbols or villain props.

Use the attached approved ceo_neutral.png as the exact identity reference. Do not change the hairstyle, face proportions, costume, prop, pose, crop or scale.
A restrained approving smile, gently lifted brows and relaxed open eyes. Communicate polite approval, not a huge grin.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 公司 CEO · 打量 · P1

文件：`public/assets/npc/ceo_appraising.png` · 768×768 · 透明

Ch4 C4-03：要求提出 DEI 政策、交董事会审议；剧本没有限定外貌或性别。 只变化眉、眼、嘴，沿用该角色neutral定稿。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

The company CEO asking for a DEI policy proposal. An adult with gender-neutral styling, a broad clean suit silhouette and hands resting on an unlettered folder. Controlled executive politeness, distinct from the Creative Director, Executive Producer and Board Chair. No crown, money symbols or villain props.

Use the attached approved ceo_neutral.png as the exact identity reference. Do not change the hairstyle, face proportions, costume, prop, pose, crop or scale.
An assessing look: one brow slightly raised, eyes focused, lips held in a small thoughtful line. Communicate scrutiny without making the character monstrous.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### 规则书／常驻引导人 · 中性 · P0

文件：`public/assets/npc/guide_neutral.png` · 768×768 · 透明

常驻棋盘边与选择前；台词轻快，像行业前辈的小贴士。其象征性是“行业常识”的化身。 先完成这一张，并把它作为该角色后续表情的参考。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

An original friendly living workplace handbook as the resident guide. A small cream book body, flexible rubber-hose arms, white gloves, large oval eyes and a modest confident smile. It acts like an upbeat industry insider offering optional advice. Keep its cover blank; no title or readable writing. Use this concept only if the team has not already approved a different guide character.

Create this neutral master portrait and use the supplied approved cast as style references.
A composed, attentive neutral expression: relaxed brows, open eyes, a small closed mouth. Keep the expression legible at thumbnail size.

One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.
```

### E02 · A Different Door · P0

文件：`public/assets/cards/ending_E02.png` · 1200×800 · 横版3:2

原表美术需求：录用邮件；Junior Producer 字样淡去，Production Coordinator 被突出

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

Create a standalone ending-card illustration for “A Different Door”. A recruitment offer email shown on a laptop, two competing role labels represented by blank title bars: the intended creative role is faint and the coordination role is strongly boxed. A small portfolio rests beside the laptop. Show the mismatch of roles without judging coordination work as worthless. Leave title bars blank for accurate typography to be added separately.

Landscape 3:2 composition, 1200 by 800 pixels, flat cream #F4EFE3 background, a few clear objects and generous breathing space. No game card border, no UI, no captions, no score numbers and no theory text; the game displays those separately. Maintain the same scale language and line weight as the approved cast. Any necessary labels must be left blank for manual typesetting. Deliver one complete illustration, not a mockup.
```

### E03 · The Door Stays Closed · P0

文件：`public/assets/cards/ending_E03.png` · 1200×800 · 横版3:2

原表美术需求：邮件屏幕显示未录用 按源表第一章当前原始数值，E03 暂不可达。仍保留这张需求与 Prompt，但可等组员决定是否调整数值后再制作；清单数量不变。

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

Create a standalone ending-card illustration for “The Door Stays Closed”. A close view of an opened recruitment email on a laptop on a modest desk. A closed portfolio sits beside it and an office doorway is visible beyond. The empty, understated composition conveys a rejected application without a dramatic crying figure. Use simple unreadable email lines; do not generate rejection text.

Landscape 3:2 composition, 1200 by 800 pixels, flat cream #F4EFE3 background, a few clear objects and generous breathing space. No game card border, no UI, no captions, no score numbers and no theory text; the game displays those separately. Maintain the same scale language and line weight as the approved cast. Any necessary labels must be left blank for manual typesetting. Deliver one complete illustration, not a mockup.
```

### E08 · Personal Reasons · P0

文件：`public/assets/cards/ending_E08.png` · 1200×800 · 横版3:2

原表美术需求：一封只写着“个人原因”的辞职信

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

Create a standalone ending-card illustration for “Personal Reasons”. A restrained close-up of a resignation letter on a desk, a pen set down beside it, and an unanswered exit-interview form. Reserve one clear blank line for the words personal reasons to be typeset later; all other lines are abstract marks. No decorative calligraphy or readable generated text.

Landscape 3:2 composition, 1200 by 800 pixels, flat cream #F4EFE3 background, a few clear objects and generous breathing space. No game card border, no UI, no captions, no score numbers and no theory text; the game displays those separately. Maintain the same scale language and line weight as the approved cast. Any necessary labels must be left blank for manual typesetting. Deliver one complete illustration, not a mockup.
```

### E09 · Off the List · P0

文件：`public/assets/cards/ending_E09.png` · 1200×800 · 横版3:2

原表美术需求：公告栏上的晋升名单中没有你的名字

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

Create a standalone ending-card illustration for “Off the List”. An office noticeboard with a new promotion list and formally printed review criteria. Several names are represented by simple dark lines, with one conspicuous empty space where a name might have been. The focus is exclusion from a supposedly fair process. Do not write names or invent a score.

Landscape 3:2 composition, 1200 by 800 pixels, flat cream #F4EFE3 background, a few clear objects and generous breathing space. No game card border, no UI, no captions, no score numbers and no theory text; the game displays those separately. Maintain the same scale language and line weight as the approved cast. Any necessary labels must be left blank for manual typesetting. Deliver one complete illustration, not a mockup.
```

### E10 · The Official Version · P0

文件：`public/assets/cards/ending_E10.png` · 1200×800 · 横版3:2

原表美术需求：停用的门禁卡、HR 邮件，以及一份关键内容被涂黑的内部声明

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

Create a standalone ending-card illustration for “The Official Version”. A deactivated employee access badge beside a laptop showing an HR email and a company statement with important lines blacked out. The objects sit calmly on a meeting-room table. No recording contents, no real person’s name, no readable generated text.

Landscape 3:2 composition, 1200 by 800 pixels, flat cream #F4EFE3 background, a few clear objects and generous breathing space. No game card border, no UI, no captions, no score numbers and no theory text; the game displays those separately. Maintain the same scale language and line weight as the approved cast. Any necessary labels must be left blank for manual typesetting. Deliver one complete illustration, not a mockup.
```

### E04 · A Personal Choice · P0

文件：`public/assets/cards/ending_E04.png` · 1200×800 · 横版3:2

原表美术需求：空荡的工位，椅背上搭着一件外套

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

Create a standalone ending-card illustration for “A Personal Choice”. An empty ordinary office workstation with a coat hanging over the chair back, soft stillness and an absent worker. A shared image for either player route; do not add a visibly pregnant woman, a baby or a gender-specific protagonist. The absence, not a moral judgement about family, is the subject.

Landscape 3:2 composition, 1200 by 800 pixels, flat cream #F4EFE3 background, a few clear objects and generous breathing space. No game card border, no UI, no captions, no score numbers and no theory text; the game displays those separately. Maintain the same scale language and line weight as the approved cast. Any necessary labels must be left blank for manual typesetting. Deliver one complete illustration, not a mockup.
```

### E05 · Family Man · P0

文件：`public/assets/cards/ending_E05.png` · 1200×800 · 横版3:2

原表美术需求：办公桌上的全家福

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

Create a standalone ending-card illustration for “Family Man”. A framed family photo on a television producer’s working desk, showing an adult father, his adult female partner and two children. Around the frame are modest production papers and a script, suggesting the career publicly celebrated while another adult’s labour is overlooked. Small dignified stylised figures; no gendered facial caricatures, no written captions.

Landscape 3:2 composition, 1200 by 800 pixels, flat cream #F4EFE3 background, a few clear objects and generous breathing space. No game card border, no UI, no captions, no score numbers and no theory text; the game displays those separately. Maintain the same scale language and line weight as the approved cast. Any necessary labels must be left blank for manual typesetting. Deliver one complete illustration, not a mockup.
```

### E06 · Staying Put · P0

文件：`public/assets/cards/ending_E06.png` · 1200×800 · 横版3:2

原表美术需求：同一张工位，墙上的日历已经翻过了好几年

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

Create a standalone ending-card illustration for “Staying Put”. The same ordinary workstation in repeated quiet use: a familiar chair, unchanged desk and a stack of several curled old calendar pages beneath the current blank calendar. Show years passing without advancement, not laziness or incompetence. No readable years or calendar text.

Landscape 3:2 composition, 1200 by 800 pixels, flat cream #F4EFE3 background, a few clear objects and generous breathing space. No game card border, no UI, no captions, no score numbers and no theory text; the game displays those separately. Maintain the same scale language and line weight as the approved cast. Any necessary labels must be left blank for manual typesetting. Deliver one complete illustration, not a mockup.
```

### E07 · Maybe It Was Just Me · P0

文件：`public/assets/cards/ending_E07.png` · 1200×800 · 横版3:2

原表美术需求：一面映出空工位的镜子

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

Create a standalone ending-card illustration for “Maybe It Was Just Me”. A simple office mirror reflecting an empty workstation rather than a person. A neatly packed small box sits at the edge of the composition. Subtle loneliness and self-questioning, no broken mirror, no melodrama and no judgement of the departing worker.

Landscape 3:2 composition, 1200 by 800 pixels, flat cream #F4EFE3 background, a few clear objects and generous breathing space. No game card border, no UI, no captions, no score numbers and no theory text; the game displays those separately. Maintain the same scale language and line weight as the approved cast. Any necessary labels must be left blank for manual typesetting. Deliver one complete illustration, not a mockup.
```

### E11 · Burnout · P0

文件：`public/assets/cards/ending_E11.png` · 1200×800 · 横版3:2

原表美术需求：一张空椅子，桌上的电脑还亮着

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

Create a standalone ending-card illustration for “Burnout”. An empty office chair and a still-lit computer displaying a crowded inbox as abstract rows and small notification marks. A silent alarm clock sits to one side. The worker is absent; convey exhaustion and replacement through ordinary objects, without medical imagery or a collapsed body.

Landscape 3:2 composition, 1200 by 800 pixels, flat cream #F4EFE3 background, a few clear objects and generous breathing space. No game card border, no UI, no captions, no score numbers and no theory text; the game displays those separately. Maintain the same scale language and line weight as the approved cast. Any necessary labels must be left blank for manual typesetting. Deliver one complete illustration, not a mockup.
```

### E12 · Nothing Changed · P0

文件：`public/assets/cards/ending_E12.png` · 1200×800 · 横版3:2

原表美术需求：茶水间冰箱上贴着的一张 A4 声明

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

Create a standalone ending-card illustration for “Nothing Changed”. An A4 corporate statement pinned to a staff-kitchen refrigerator among ordinary workplace objects. It looks tidy and unchanged, with a prominent blank heading and abstract text lines. The modest everyday setting suggests a declaration with no practical reform. No readable generated text or real brand logo.

Landscape 3:2 composition, 1200 by 800 pixels, flat cream #F4EFE3 background, a few clear objects and generous breathing space. No game card border, no UI, no captions, no score numbers and no theory text; the game displays those separately. Maintain the same scale language and line weight as the approved cast. Any necessary labels must be left blank for manual typesetting. Deliver one complete illustration, not a mockup.
```

### E13 · A Small Step Forward · P0

文件：`public/assets/cards/ending_E13.png` · 1200×800 · 横版3:2

原表美术需求：地下一层门口的一块新门牌

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

Create a standalone ending-card illustration for “A Small Step Forward”. A modest new office door sign at a basement-level corridor entrance, with a small light on and a place to knock. Leave the sign blank so its label can be added accurately later. The scene feels like a real but limited first step, not a triumphant revolution.

Landscape 3:2 composition, 1200 by 800 pixels, flat cream #F4EFE3 background, a few clear objects and generous breathing space. No game card border, no UI, no captions, no score numbers and no theory text; the game displays those separately. Maintain the same scale language and line weight as the approved cast. Any necessary labels must be left blank for manual typesetting. Deliver one complete illustration, not a mockup.
```

### E14 · Rewriting the Rules · P0

文件：`public/assets/cards/ending_E14.png` · 1200×800 · 横版3:2

原表美术需求：公告栏上贴着的晋升名单和评审标准

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

Create a standalone ending-card illustration for “Rewriting the Rules”. An accessible workplace noticeboard displaying a promotion list next to clear written assessment criteria and a flexible-working form, all represented with orderly blank headings and abstract text lines. The office entrance is visible and open. Suggest practical procedural change without victory confetti or a perfect utopia.

Landscape 3:2 composition, 1200 by 800 pixels, flat cream #F4EFE3 background, a few clear objects and generous breathing space. No game card border, no UI, no captions, no score numbers and no theory text; the game displays those separately. Maintain the same scale language and line weight as the approved cast. Any necessary labels must be left blank for manual typesetting. Deliver one complete illustration, not a mockup.
```

### 通用卡背 · P0

文件：`public/assets/cards/card_back.png` · 900×1200 · 竖版3:4

只需一张，三个抽牌堆复用。没有扑克牌花色和角标数字。

```text
Create a simple original card-back illustration for Genderpoly in the approved 1930s rubber-hose graphic language. Portrait 3:4, 900 by 1200 pixels. Flat black #141414 and cream #F4EFE3 only. One centred large question-mark motif, with a restrained thin inner rectangular border and generous quiet space. No hearts, spades, diamonds, clubs, corner ranks, duplicate numbers, company name or other lettering. No metallic gradient, fake paper texture, 3D mockup or shadow outside the card. Deliver a flat complete card face.
```

### The Old Boys’ Network · 满意 · 可选

文件：`public/assets/bosses/old_boys_network_pleased.png` · 1024×1024 · 透明

已有基础Boss可直接复用；只有完成全部首批资源后才建议补。

```text
Use the attached approved old_boys_network.png as an exact identity and framing reference. Preserve the existing concept, silhouette, props, pose, proportions, camera, scale and line weight. Change only the face to this reaction: A restrained approving smile, gently lifted brows and relaxed open eyes. Communicate polite approval, not a huge grin. Do not turn an object character into a human or invent new costume details. One 1024 by 1024 pixel figure, genuine transparent background, same margins as the original, no text, no metal tile background, no contact sheet.
```

### The Old Boys’ Network · 打量 · 可选

文件：`public/assets/bosses/old_boys_network_appraising.png` · 1024×1024 · 透明

已有基础Boss可直接复用；只有完成全部首批资源后才建议补。

```text
Use the attached approved old_boys_network.png as an exact identity and framing reference. Preserve the existing concept, silhouette, props, pose, proportions, camera, scale and line weight. Change only the face to this reaction: An assessing look: one brow slightly raised, eyes focused, lips held in a small thoughtful line. Communicate scrutiny without making the character monstrous. Do not turn an object character into a human or invent new costume details. One 1024 by 1024 pixel figure, genuine transparent background, same margins as the original, no text, no metal tile background, no contact sheet.
```

### The Old Boys’ Network · 冷淡 · 可选

文件：`public/assets/bosses/old_boys_network_cold.png` · 1024×1024 · 透明

已有基础Boss可直接复用；只有完成全部首批资源后才建议补。

```text
Use the attached approved old_boys_network.png as an exact identity and framing reference. Preserve the existing concept, silhouette, props, pose, proportions, camera, scale and line weight. Change only the face to this reaction: A flat closed mouth, level brows and a reserved distant gaze. Show professional distance, not anger or cruelty. Do not turn an object character into a human or invent new costume details. One 1024 by 1024 pixel figure, genuine transparent background, same margins as the original, no text, no metal tile background, no contact sheet.
```

### The Ideal Worker · 满意 · 可选

文件：`public/assets/bosses/ideal_worker_pleased.png` · 1024×1024 · 透明

已有基础Boss可直接复用；只有完成全部首批资源后才建议补。

```text
Use the attached approved ideal_worker.png as an exact identity and framing reference. Preserve the existing concept, silhouette, props, pose, proportions, camera, scale and line weight. Change only the face to this reaction: A restrained approving smile, gently lifted brows and relaxed open eyes. Communicate polite approval, not a huge grin. Do not turn an object character into a human or invent new costume details. One 1024 by 1024 pixel figure, genuine transparent background, same margins as the original, no text, no metal tile background, no contact sheet.
```

### The Ideal Worker · 皱眉 · 可选

文件：`public/assets/bosses/ideal_worker_frowning.png` · 1024×1024 · 透明

已有基础Boss可直接复用；只有完成全部首批资源后才建议补。

```text
Use the attached approved ideal_worker.png as an exact identity and framing reference. Preserve the existing concept, silhouette, props, pose, proportions, camera, scale and line weight. Change only the face to this reaction: Brows drawn together and a slight downward mouth, clearly showing disapproval or concern. No rage, shouting or exaggerated villain expression. Do not turn an object character into a human or invent new costume details. One 1024 by 1024 pixel figure, genuine transparent background, same margins as the original, no text, no metal tile background, no contact sheet.
```

### The Ideal Worker · 冷淡 · 可选

文件：`public/assets/bosses/ideal_worker_cold.png` · 1024×1024 · 透明

已有基础Boss可直接复用；只有完成全部首批资源后才建议补。

```text
Use the attached approved ideal_worker.png as an exact identity and framing reference. Preserve the existing concept, silhouette, props, pose, proportions, camera, scale and line weight. Change only the face to this reaction: A flat closed mouth, level brows and a reserved distant gaze. Show professional distance, not anger or cruelty. Do not turn an object character into a human or invent new costume details. One 1024 by 1024 pixel figure, genuine transparent background, same margins as the original, no text, no metal tile background, no contact sheet.
```

### The System · 满意 · 可选

文件：`public/assets/bosses/the_system_pleased.png` · 1024×1024 · 透明

已有基础Boss可直接复用；只有完成全部首批资源后才建议补。

```text
Use the attached approved the_system.png as an exact identity and framing reference. Preserve the existing concept, silhouette, props, pose, proportions, camera, scale and line weight. Change only the face to this reaction: A restrained approving smile, gently lifted brows and relaxed open eyes. Communicate polite approval, not a huge grin. Do not turn an object character into a human or invent new costume details. One 1024 by 1024 pixel figure, genuine transparent background, same margins as the original, no text, no metal tile background, no contact sheet.
```

### The System · 皱眉 · 可选

文件：`public/assets/bosses/the_system_frowning.png` · 1024×1024 · 透明

已有基础Boss可直接复用；只有完成全部首批资源后才建议补。

```text
Use the attached approved the_system.png as an exact identity and framing reference. Preserve the existing concept, silhouette, props, pose, proportions, camera, scale and line weight. Change only the face to this reaction: Brows drawn together and a slight downward mouth, clearly showing disapproval or concern. No rage, shouting or exaggerated villain expression. Do not turn an object character into a human or invent new costume details. One 1024 by 1024 pixel figure, genuine transparent background, same margins as the original, no text, no metal tile background, no contact sheet.
```

### The System · 冷淡 · 可选

文件：`public/assets/bosses/the_system_cold.png` · 1024×1024 · 透明

已有基础Boss可直接复用；只有完成全部首批资源后才建议补。

```text
Use the attached approved the_system.png as an exact identity and framing reference. Preserve the existing concept, silhouette, props, pose, proportions, camera, scale and line weight. Change only the face to this reaction: A flat closed mouth, level brows and a reserved distant gaze. Show professional distance, not anger or cruelty. Do not turn an object character into a human or invent new costume details. One 1024 by 1024 pixel figure, genuine transparent background, same margins as the original, no text, no metal tile background, no contact sheet.
```

### CH1-E01 · Through the Door · P2

文件：`public/assets/cards/ending_CH1-E01.png` · 1200×800 · 横版3:2

晋升过渡卡，有独立插槽，可在晋升时翻面查看；不进入 Gallery，不计入13个终局。原表美术需求：Junior Producer 录用邮件

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

Create an optional milestone-card illustration for “Through the Door”. A laptop displaying a successful Junior Producer offer email, beside a tidy portfolio and a simple open studio doorway. Reserve a blank heading area for the exact role title to be typeset later; use abstract email lines. Show entry into the industry rather than final victory.

Landscape 3:2 composition, 1200 by 800 pixels, flat cream #F4EFE3 background, generous breathing space, clear simple props. No card border, game UI, numbers, theory text, captions or readable generated labels. No confetti or finish-line imagery. Deliver one standalone illustration matching the approved ending illustrations.
```

### CH2-E07 · Moving Up · P2

文件：`public/assets/cards/ending_CH2-E07.png` · 1200×800 · 横版3:2

晋升过渡卡，有独立插槽，可在晋升时翻面查看；不进入 Gallery，不计入13个终局。原表美术需求：A company-wide promotion announcement, a new title beneath Alex's name and an invitation to a senior meeting.

```text
Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character.

Create an optional milestone-card illustration for “Moving Up”. An office noticeboard with a company-wide promotion announcement and a new role title represented by a blank title line, beside an invitation to a senior meeting. Leave the character name and role labels blank for accurate typesetting. This is an intermediate promotion, not the final creative-director appointment or an ending.

Landscape 3:2 composition, 1200 by 800 pixels, flat cream #F4EFE3 background, generous breathing space, clear simple props. No card border, game UI, numbers, theory text, captions or readable generated labels. No confetti or finish-line imagery. Deliver one standalone illustration matching the approved ending illustrations.
```

## 音频交付

 已预留这六个音频名称，支持.mp3、.wav、.ogg、.m4a；移动或改名时也更新public/assets/manifest.json。当前仅完成接入框架，成品未放入，实际响度、循环和播放效果需收到后检查。

现有音频不需要重新制作。按用途挑选，并优先复制一份到下列位置，原始文件保留在reference/audio。下面时长是剪辑建议，不是剧情要求，也不要求为了凑齐六项制作新音频。若你只有一首背景音乐，先交main即可。

| 文件（public/assets/audio/下） | 用途 | 建议 | 触发位置 |
| --- | --- | --- | --- |
| bgm_main.mp3 | 常规游玩背景循环 | 建议60–120秒以上、首尾可衔接，轻量，不掩盖文字阅读。 | 选择开始游戏后播放；普通章节延续。 |
| bgm_boss.mp3 | Boss场景背景循环 | 建议30–90秒，可循环；与主背景响度相近。 | 进入Boss卡时切换，离开后切回。 |
| sfx_move.wav | 棋子移动 | 建议0.15–0.6秒，一步一声，无突兀静音头。 | 棋子开始移动时。 |
| sfx_card.wav | 翻卡／打开卡片 | 建议0.1–0.4秒，轻短。 | 打开剧情卡、结局卡翻面。 |
| sfx_choose.wav | 确认选择 | 建议0.1–0.4秒，听起来中性，不评价对错。 | 玩家确认一个有效选项时。 |
| sfx_ending.wav | 结局出现 | 建议1–3秒，用同一中性提示，不划分好／坏结局。 | 每局结局首次出现时。 |

- 音乐优先MP3（兼容性较好）；短音效可WAV。44.1或48kHz即可。别把m4a/MP3仅改后缀为wav。
- 尽量不要爆音或相差很大的响度；主音乐可循环，剪掉明显空白头尾。
- 每个文件在同目录的CREDITS说明中记录：来源/作者、链接或“组员原创”、许可或授权、修改情况。没有外部来源时按实际注明，不能猜授权。
- 浏览器需要玩家操作后才允许声音播放；设置中的Sound可关闭。不要依赖音频才能理解剧情。
- 文件名、扩展名、触发位置需在音频路径表中对应；交付后让Codex逐个试听/检查接入，不要仅凭文件存在判定有声音。

## 结局画面核对

**E03 制作顺序：** 按源表第一章当前原始数值，E03 暂不可达。仍保留这张需求与 Prompt，但可等组员决定是否调整数值后再制作；清单数量不变。

| 结局 | 正式来源 | 图面要求 |
| --- | --- | --- |
| E02 A Different Door | ch1!24 | 录用邮件；Junior Producer 字样淡去，Production Coordinator 被突出 |
| E03 The Door Stays Closed | ch1!25 | 邮件屏幕显示未录用 |
| E08 Personal Reasons | ch2!46 | 一封只写着“个人原因”的辞职信 |
| E09 Off the List | ch2!47 | 公告栏上的晋升名单中没有你的名字 |
| E10 The Official Version | ch2!48 | 停用的门禁卡、HR 邮件，以及一份关键内容被涂黑的内部声明 |
| E04 A Personal Choice | ch3!45 | 空荡的工位，椅背上搭着一件外套 |
| E05 Family Man | ch3!46 | 办公桌上的全家福 |
| E06 Staying Put | ch3!47 | 同一张工位，墙上的日历已经翻过了好几年 |
| E07 Maybe It Was Just Me | ch3!48 | 一面映出空工位的镜子 |
| E11 Burnout | ch4!36 | 一张空椅子，桌上的电脑还亮着 |
| E12 Nothing Changed | ch4!37 | 茶水间冰箱上贴着的一张 A4 声明 |
| E13 A Small Step Forward | ch4!38 | 地下一层门口的一块新门牌 |
| E14 Rewriting the Rules | ch4!39 | 公告栏上贴着的晋升名单和评审标准 |

这里只计 **E02—E14 共13个终局**。Ch1 E01 Through the Door 是继续第二章的过渡；Ch2 E07 Moving Up 是晋升过渡，和Ch3 E07 Maybe It Was Just Me是不同内容。不要把两个同名编号的图片互相覆盖，也不要把旧模板页的示例结局作为正式需求。这两张过渡卡可在晋升时展示与翻面查看，但不进入 Gallery；Gallery 只收录13个终局。内部编号为CH1-E01和CH2-E07，文件分别是 `public/assets/cards/ending_CH1-E01.png`、`public/assets/cards/ending_CH2-E07.png`。列为P2可选，共2张；不计入首批25张或13个终局。完整Prompt已列在上面。

## 可选扩展：目前没有独立必需上屏位置

以下只在团队决定增加场景画面/候选人头像时制作，不计入31/58/67/69张的工作量。先完成已有插槽，避免做完大量用不上的图。

### 场景底图：8个可复用场景

- **面试前衣柜**（C1-01），预留 `public/assets/scenes/wardrobe.png`。Prompt：Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character. A compact adult bedroom corner with a wardrobe holding three simple workplace outfit silhouettes and a mirror. No figure, no luxury branding. Wide landscape 1600 by 900 pixels, sparse cream background, a clear uncluttered central composition, no UI or text. This is a background-only optional illustration; leave space for separately composited approved characters.

- **面试／会议室**（C1-02、C1-03、C2-01、C2-02），预留 `public/assets/scenes/interview_meeting.png`。Prompt：Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character. A modest London creative-company meeting room with a table, chairs, a blank portfolio screen and a window toward an outdoor smoking area. No characters. Wide landscape 1600 by 900 pixels, sparse cream background, a clear uncluttered central composition, no UI or text. This is a background-only optional illustration; leave space for separately composited approved characters.

- **制作／剪辑区**（C1-04、C3-03b、C3-04），预留 `public/assets/scenes/production_room.png`。Prompt：Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character. An everyday TV production workroom with unlettered schedules, edit monitors and headphones, including a simple clock with hands near nine. No characters. Wide landscape 1600 by 900 pixels, sparse cream background, a clear uncluttered central composition, no UI or text. This is a background-only optional illustration; leave space for separately composited approved characters.

- **下班后的酒吧**（C2-03、相关回忆），预留 `public/assets/scenes/after_work_bar.png`。Prompt：Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character. A small ordinary bar near an office, a cluster of stools and glasses, leaving an uncomfortable empty space near the group area. No people, alcohol branding or readable signs. Wide landscape 1600 by 900 pixels, sparse cream background, a clear uncluttered central composition, no UI or text. This is a background-only optional illustration; leave space for separately composited approved characters.

- **伴侣共用的家**（C3-02、C3-03a、C3-04），预留 `public/assets/scenes/home_table.png`。Prompt：Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character. A shared living-room table with two laptops, takeaway boxes, a kettle and unwashed plates. A small removable baby-care prop can form a separate version, never place it in the child-free branch. No people. Wide landscape 1600 by 900 pixels, sparse cream background, a clear uncluttered central composition, no UI or text. This is a background-only optional illustration; leave space for separately composited approved characters.

- **Soho圣诞聚会**（C3-05a/b），预留 `public/assets/scenes/soho_party.png`。Prompt：Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character. A contemporary members-club Christmas gathering space in Soho, understated festive garlands, a few glasses and quiet conversation areas. No people or real club branding. Wide landscape 1600 by 900 pixels, sparse cream background, a clear uncluttered central composition, no UI or text. This is a background-only optional illustration; leave space for separately composited approved characters.

- **总监办公室**（C4-00、C4-01、C4-02），预留 `public/assets/scenes/director_office.png`。Prompt：Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character. A modest private office at the end of a corridor, a closable door, two blank candidate folders and a visitor chair. No people, no nameplate text. Wide landscape 1600 by 900 pixels, sparse cream background, a clear uncluttered central composition, no UI or text. This is a background-only optional illustration; leave space for separately composited approved characters.

- **董事会会议室**（C4-B），预留 `public/assets/scenes/boardroom.png`。Prompt：Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character. A top-floor boardroom with a long table, seven simple chairs and a blank presentation screen. Everyday corporate furniture, no throne, villains or victory imagery. Wide landscape 1600 by 900 pixels, sparse cream background, a clear uncluttered central composition, no UI or text. This is a background-only optional illustration; leave space for separately composited approved characters.

### 被提及但无需单独头像的角色：3张可选参考

- **同事 Daniel**：第二章同批同事，第四章成为另一节目线的创意总监；单独头像暂无必需上屏位置。 如以后增加对应插槽，预留 `public/assets/npc/daniel_neutral.png`。Prompt：Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character. An adult male creative-production colleague named Daniel, distinct from the Chapter 2 Creative Director. Contemporary simple jacket, a confident but ordinary work posture. Match the approved cast; do not use an overt villain design. A composed, attentive neutral expression: relaxed brows, open eyes, a small closed mouth. Keep the expression legible at thumbnail size. One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.

- **候选人 Chloe**：第四章女性候选人；现有招聘卡用文字展示，不需独立头像。 如以后增加对应插槽，预留 `public/assets/npc/chloe_neutral.png`。Prompt：Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character. Chloe, an adult female internship candidate with a strong short-film portfolio. A plain professional top and a small unlettered portfolio, a capable calm posture. Do not portray her as less creative or only domestic. A composed, attentive neutral expression: relaxed brows, open eyes, a small closed mouth. Keep the expression legible at thumbnail size. One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.

- **候选人 Josh**：第四章男性候选人；与Chloe学历、作品集相近，不能把“创意天才”刻板印象当作事实画出来。 如以后增加对应插槽，预留 `public/assets/npc/josh_neutral.png`。Prompt：Original 1930s rubber-hose cartoon illustration for Genderpoly, a contemporary London creative-production workplace story. Fully 2D, flat opaque fills, confident thick black #141414 outlines, cream #F4EFE3 highlights. Large white oval eyes with thick outlines, black pupils, simple brows and mouth. Modern workplace props rendered in this vintage cartoon language. No gradients, no 3D, no photorealism, no text, no watermark, no generated frame, no baked-in paper grain. Use the supplied approved game characters as style references; do not copy a named copyrighted character. Josh, an adult male internship candidate with an educational background and portfolio comparable to Chloe. A simple professional outfit and an unlettered portfolio. Equal visual weight and competence to Chloe, no glowing genius aura or exaggerated charisma. A composed, attentive neutral expression: relaxed brows, open eyes, a small closed mouth. Keep the expression legible at thumbnail size. One production-ready chest-up portrait, square 768 by 768 pixels, real transparent background, no checkerboard pattern. Face centred, consistent eye line and scale, generous transparent margins, all hair and visible hands inside the canvas. Deliver one image, not a contact sheet. Keep the head silhouette, clothing, prop, pose, camera and line weight identical to this character’s approved neutral reference; change only the facial expression.

婴儿、保姆、编辑、两位Senior Producers、其他董事等都不需要独立表情套装；可作为剧情文字或未来场景中的小型配角。章节开场4张与终章1张目前没有额外插图要求；两张过渡卡有独立插槽，已单列P2；标题字样、Gallery边框由现有界面承担，无需再做title/gallery_frame图。

## 交付与检查顺序

1. 先把已有6个角色和已完成音频放到上面的文件夹。原稿另存reference，运行版本放public/assets。
2. 做Guide，再做Hiring Manager、Senior Producer、Creative Director的neutral，先看第一、二章替换效果。
3. 补其余基础头像与13张结局图、1张卡背；这些构成25张首批新增图。
4. 沿用neutral定稿补27张剧情反应；最后按需要补9张Boss反应和可选场景。
5. 在Game Demo运行 `npm run dev`，打开本地预览。检查棋子、Boss、每个NPC的neutral与结果表情；达成对应结局并打开Gallery检查图面与裁切。
6. 每批新图都看手机窄屏。黑色/奶油色底均需清晰，不能缺头、缺手、出现白色矩形底；上传后若仍显示占位框，核对英文文件名、大小写和扩展名。

**手动改位置可以。** 图片移动后更新 `public/assets/manifest.json` 的路径；音频移动后更新对应音频路径表。不要修改左侧资源key，不要移动public或src目录。运行中的素材由构建时扫描，新加文件后如果未出现，重启预览并刷新；线上版本需重新发布才会更新。
