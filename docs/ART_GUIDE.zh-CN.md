# 美术资源接入指南

**正式剧本的逐项制作清单与完整 Prompt：** [打开可筛选清单](ART_REQUIREMENTS.zh-CN.html) · [文字版](ART_REQUIREMENTS.zh-CN.md)。2026 年 11 月 3 日后的制作数量、角色、表情和结局编号以该清单为准；本页保留通用导出和替换方法。已有 2 枚棋子和 4 位 Boss 复用，先补 25 张基础视觉，再按实际剧情补 27 张反应；不用给每个 NPC 做完整六种表情。

你可以在另一个图像聊天制作资源，再把成品放到这里。当前骨架不会替你创作角色；图片缺失时显示带名称的占位框，方便逐张补齐。统一风格与配色以 [GAME_SPEC.md](GAME_SPEC.md) 第 10 节为准。

## 资源清单与建议尺寸

下面是方便制作的建议导出尺寸，不是限制。保留相同类型图片的画布比例、角色位置和透明边距，有助于替换时保持一致。支持 SVG、PNG、WebP；使用位图时导出实际透明背景，避免把棋盘格画进图片里。

| 放置文件夹 | 建议文件名 | 建议导出 | 背景 |
|---|---|---|---|
| `public/assets/characters/` | `pawn_female.png`、`pawn_male.png` | 1024 × 1024，完整角色居中 | 透明 |
| `public/assets/bosses/` | `gatekeeper.png`、`old_boys_network.png`、`ideal_worker.png`、`the_system.png` | 1024 × 1024，四位 Boss 尺度一致 | 透明 |
| `public/assets/npc/` | `<npc-id>_<expression>.png` | 768 × 768，统一头像裁切和眼睛位置 | 透明 |
| `public/assets/npc/` | `guide_neutral.png`（或 `.svg`、`.webp`） | 768 × 768，常驻引导 NPC，主体居中 | 透明 |
| `public/assets/cards/` | `card_back.png` | 900 × 1200，竖版 3:4 | 可用规格中的奶油色或黑色 |
| `public/assets/cards/` | `ending_E02.png`—`ending_E14.png`，13 个真正终局 | 1200 × 800，横版 3:2 的独立插图 | 按插图构图决定 |
| `public/assets/ui/` | `title.png`（可选，现有文字界面已可用） | 1600 × 600，横版标题装饰 | 透明 |
| `public/assets/ui/` | `gallery_frame.png`（可选，现有边框已可用） | 900 × 1200，边框中间留空 | 透明 |

结局插图不要把结局正文画进图片；游戏会显示可选取、可缩放的文字。标题和卡背若包含文字，请先人工检查拼写。

NPC 表情后缀使用 `pleased`、`neutral`、`appraising`、`frowning`、`awkward`、`cold`，但每个角色只做正式清单列出的子集。NPC 的资源编号要和路径表一致；新增 NPC 后让 Codex 核对表格名称与资源编号的对应关系。Ch1 E01 与 Ch2 E07 是继续游玩的过渡，不要与真正终局 E07 混用图片。

常驻引导 NPC 的头像使用 [guide.json](../public/data/guide.json) 中的 `portrait: "npc/guide_neutral"`，已经在资源路径表登记。直接把同名透明图片放入 `public/assets/npc/` 即可；缺图时仍显示占位框。NPC 的名字与身份说明分别在同一文件的 `name`、`role` 修改，台词另填 [guide.csv](../public/data/guide.csv)，不要把对白画进头像。

## 风格约束

- 1930 年代黑白 rubber-hose 卡通，平涂、粗黑线，完整 2D。角色、普通卡牌和普通格子维持平涂；六个特殊地块与四张 Boss 历史小卡采用下面明确批准的金属背景例外。
- 玩家棋子都是带橡皮管手脚的横向工作证：夹子、两条挂绳、白手套、黑色圆头鞋。
- 两种棋子的轮廓、体型、面部构造和姿势一致。性别差异仅来自挂绳颜色和脸颊上的小 `♀` / `♂` 符号。
- 人脸统一使用白色大椭圆眼睛、粗黑外框、黑色瞳孔、简单眉毛与嘴巴。
- 使用规格已有颜色和 10 月 31 日确认的六种金属色；颜色标识位置，不代表“好／坏选择”。

常用颜色：黑线 `#141414`、奶油白 `#F4EFE3`、纸色 `#E6DFCF`、女性挂绳 `#C7716B`、男性挂绳 `#5B7FA6`。其余界面颜色见规格，不要从参考图随意取新的颜色。

### 普通地块：黑色变奶油白（v0.10）

普通棋盘格未走过时保持现有黑色 `--tile-hidden`（`#2A2825`），走过后统一使用奶油白 `--tile-walked: var(--cream)`（`#F4EFE3`）。取消过去的红、蓝、黄轮换；这项配色已确定，不再列为待讨论选项。背景由程序绘制，无需另外制作图片。

这个调整只针对普通地块。下面六个特殊地块及四张 Boss 历史小卡仍保留各自金属色。

### 六个特殊地块的金属色

设计者在 **2026 年 10 月 31 日** 明确更新了旧版“不使用渐变”和特殊地块旧配色的限制。以下六个地块背景使用固定的拉丝金属渐变，按照棋盘路线安排；四张 Boss 历史小卡复用各自地块的金属色：

| 地块 | 固定背景 | 主色 token |
|---|---|---|
| The Gatekeeper | 金属红 | `--metal-red` |
| The Old Boys' Network | 金属绿 | `--metal-green` |
| The Ideal Worker | 金属蓝 | `--metal-blue` |
| The System | 金属紫 | `--metal-purple` |
| Creative Director | 银色金属 | `--metal-silver` |
| START / 终点（同一格） | 金色金属 | `--metal-gold` |

各金属色的主色、暗部、高光和边缘色集中放在 [src/styles/tokens.css](../src/styles/tokens.css)，不需要分别生成六张背景图片。Boss 人物仍交付透明背景图片，让棋盘自身的金属底色显露出来。

走过这些地块后保留原来的金属色，并加勾记显示已走过；不会变成普通已走格子的奶油白。START 离开后文字翻成 `?`，底色仍然是金色。Creative Director 是银色晋升格，真正的终点仍是金色 START。四张 Boss 历史小卡仅显示对应金属色，不显示文字或编号；普通历史小卡仅显示一个居中编号。金属背景例外不扩大到角色、其他卡牌或普通地块。

给图像聊天的需求里写清：用途、文件名、尺寸、画布比例、是否透明、风格、允许的颜色、完整边界，以及与哪些已有角色保持一致。一次先完成一张标准形象，再沿用它制作表情和版本，能减少同一角色外观漂移。

## 如何放入和替换

1. 打开 [public/assets/](../public/assets/)，把图片放进对应子文件夹。文件名用英文、数字和下划线；大小写保持一致。
2. 打开 [manifest.json](../public/assets/manifest.json)。左侧是程序使用的固定资源名称，右侧方括号内是可尝试的文件路径；通常只需改右侧路径。
3. 路径使用 `/`，以 `assets/` 开头，例如 `assets/characters/pawn_female.png`。不要写 `D:\...`，也不要加 `public/`。
4. 同一资源可以列多个路径，程序依次尝试。放了 PNG 时确认列表里有对应 PNG 路径；换成 SVG 也要核对扩展名。
5. 刷新本地游戏查看。若仍显示占位框，先检查文件名、大小写、扩展名和路径；必要时强制刷新浏览器。

例如玩家棋子的条目可写为：

```json
"characters/pawn_female": [
  "assets/characters/pawn_female.svg",
  "assets/characters/pawn_female.png"
]
```

这是路径表中的一个条目。直接修改现有条目即可，保留整个文件最外层的大括号和条目之间的逗号。

**相同路径、相同文件名替换图片，不需要改代码。** 图片想移到自己命名的子文件夹也可以，只要同步修改路径表。例如移到 `public/assets/characters/final/pawn_female.png` 后，路径应改为 `assets/characters/final/pawn_female.png`。

不要删除路径表左侧的固定名称，也不要只移动整个 `public/` 或 `src/` 文件夹。如果想改变这些基础目录，让 Codex 同时更新所有引用。`docs/reference/` 里的参考图不会自动加载到游戏里；成品仍需放入 `public/assets/` 并登记路径。

## 字体与音频

字体只使用 **Limelight** 和 **Josefin Sans**。当前通过 Google Fonts 样式加载；网络不可用时浏览器会使用备用字体，画面字形会有差异。重要的离线演示前，可以将这两种字体的合法本地文件放到 `public/assets/fonts/`，让 Codex 配好本地加载并测试。不要单独换成第三种装饰字体。

音乐和音效放进 `public/assets/audio/`。正式清单里的 `bgm_main`、`bgm_boss`、`sfx_move`、`sfx_card`、`sfx_choose`、`sfx_ending` 六个名称已预留加载与触发位置，支持 `.mp3`、`.wav`、`.ogg`、`.m4a`，路径也在 `public/assets/manifest.json`。当前只有接入框架，音频成品尚未放入，实际播放、循环与响度需收到后检查。使用外部音频时一并保存作者、来源和授权说明；此文件夹可以暂时为空。

## 每次交付后看什么

- 标题页、棋盘角色、四个 Boss、NPC 表情和结局图是否正确出现。
- 引导 NPC 的头像在桌面棋盘旁、窄屏棋盘下，以及卡牌选择前的提示区域是否完整显示。
- 四个 Boss 是否依次对应红、绿、蓝、紫，Creative Director 是否银色、START 是否金色；走过后是否仍保留颜色并出现勾记。
- 普通未走格子是否保持黑色，走过后是否统一变成奶油白；不应出现旧的红、蓝、黄轮换。
- 角色是否被裁掉、边缘是否有不需要的白底、两种棋子是否同样大小。
- 深色和浅色格子上的图像都是否清楚；文字和操作按钮是否被遮住。
- 在桌面和手机窄窗口各看一次。图片没有出现时，保留占位框有助于找出缺失资源。

对照清单逐张补齐即可，不必等所有资源做完才开始试玩。
