# Genderpoly — 游戏 Demo

NMC5369 Media Project 的网页游戏。游戏名 **Genderpoly**，公司名 **FreeDOM**；中英文剧情均使用组员表格原文。

## 当前版本与试玩

**v0.14：中英文双语版本。** 正式 CH1–4、规则书、选项、结果、结局与复盘支持语言切换；共用六项能力、已拆分角色、场景音频与获准的 E03 调平。验证记录见 [AI_LOG](docs/AI_LOG.md)，线上发布状态见 [GitHub Actions](https://github.com/Ebitorako/same-rules-demo/actions)。

本轮验证：134 项测试、数据检查和构建通过；浏览器走通中文 E03 和完整 E14，确认剧情／历史／结局可切换语言，刷新保留中文与进度，390px 手机布局无横向溢出。

[中文试玩](https://ebitorako.github.io/same-rules-demo/?lang=zh-CN) · [English](https://ebitorako.github.io/same-rules-demo/?lang=en) · [GitHub 仓库](https://github.com/Ebitorako/same-rules-demo)

本地双击 [启动游戏.cmd](启动游戏.cmd)，或运行 `npm run dev`，打开提示的网址。选择 **Female pawn / Male pawn → Enter the studio**；用 **Next** 前进、点击选项并 **Continue**。键盘支持 `1`–`4`、`D`、`Enter`。声音可在 **Settings → Sound** 开关。

点击右上角 **中文 / English** 随时切换；剧情弹窗及历史回顾里也有切换按钮。中文版点击 **开始职业生涯 → 女性棋子 / 男性棋子 → 进入工作室**。语言偏好会保存，刷新不会变回英文；切换不重开、不重选，也不会重复加减数值。旧原型收藏仍保留当时的原始文本。

旧原型存档保留在 Gallery 的 **Earlier prototype records**，正式剧情和旧结局不混用。不需要为更新主动清空存档。

## 本轮内容

- 20 个剧情位置、4 段章节开场、13 个终局，两个章节晋升卡只在过渡时查看，不进入 Gallery。
- 六项能力初始值：Creativity 3、Communication 3、Network 2、Reputation 2、Availability 2、Energy 7。游玩中隐藏数值，终局正面显示最终值，反面显示选择及系统规则复盘。
- 两枚棋子和四位 Boss 已按提供的两张图分拆为透明 PNG；原稿保留。其余人物与结局仍按清单补齐，不自行创作新的角色。
- 9份已提供音频对应背景介绍、普通游玩、酒吧、圣诞派对、移动、落地、抽卡、选择、入职；另补 Boss 登场、终局、翻面3个原创短音效。
- 大音频原稿本地保留；游戏只发布轻量节选。音频场合、来源、时长统一维护在 [catalog.json](public/assets/audio/catalog.json)。

## E03 调平

已按你的授权，只将 **C1-04 第3项的 Communication +1 改为0，男女一致**。其他能力变化、初始值和 Boss 门槛不变；Google Sheet 原始快照不改。

| 第一章81条路线／棋子 | 晋升 | E02 | E03 |
|---|---:|---:|---:|
| 女性 | 21 | 45 | 15 |
| 男性 | 51 | 18 | 12 |

晋升路线数量保持原样。13个终局均有真实选择路径。覆盖配置见 [chapter-one-balance.json](src/config/chapter-one-balance.json)，对比和路线见 [调平记录](docs/source/2026-11-03-ch1-balance.json)；重新导入不会撤销本次批准的调整。

调平对更新后作出的选择生效，已经记录的选择及结局复盘保留当时的实际数值。

## 文件夹怎么用

| 位置 | 用途 |
|---|---|
| [public/assets/](public/assets/) | 游戏实际加载的图片、字体与音频 |
| `characters/`、`bosses/` | 两枚棋子、四位 Boss |
| `npc/`、`cards/` | 普通角色表情、结局图、卡背 |
| `audio/music/`、`audio/effects/` | 背景音乐、短音效；用途见同目录 catalog |
| [docs/reference/](docs/reference/) | 用户原稿；其中大型音频只保留本地，不提交 Git |
| [public/data/team-content.json](public/data/team-content.json) | 正式剧情运行数据 |
| [docs/source/](docs/source/) | 原表快照、导入与调平记录；旧版数据子目录仅供测试 |
| [src/](src/) | 游戏逻辑与界面 |
| [scripts/](scripts/) | 内容导入、检查与音频处理 |
| [docs/tools/](docs/tools/) | 生成美术清单、音频试听等维护工具 |

后续直接把图片发到聊天即可，由 Codex 分拆、命名和接入。也可以自行移动资源，只需同步 [manifest.json](public/assets/manifest.json) 的右侧路径，固定资源名称不变。路径以 `assets/` 开头，不写盘符或 `public/`。

**[打开唯一的美术需求与 Prompt 清单](docs/ART_REQUIREMENTS.zh-CN.html)**：已有6张已接入，首批新增25张（11基础头像、13结局、1卡背），再补27张剧情表情；9张 Boss 表情和2张晋升插图可选。人物统一参考提供的工牌角色世界，不再生成一套不相干的真人头像。

旧版重复说明已从当前文件夹移除，可从 Git 历史找回。原始启动包归档到上一级 `_archive/`；过去四批验收截图集中在 `_archive/verification/`，保留原批次名称。本轮临时截图使用项目内被忽略的 `.verification/`。`node_modules`、`dist` 和 `.tools` 是本地运行或构建所需目录，不上传 Git。

## 内容更新与检查

[游戏规则](docs/GAME_SPEC.md) · [剧情接入指南](docs/CONTENT_GUIDE.zh-CN.md) · [发布方法](docs/DEPLOYMENT.zh-CN.md)

组员更新共享表后，先让 Codex 读取新快照并核对差异，再导入；**导入脚本不会自动联网刷新 Google Sheet**。场景 CSV 和 copy/candidate/policy JSON 只是查阅导出，单改它们不会改变游戏。

```bash
node scripts/import-team-content.mjs
node scripts/import-chinese-content.mjs
npm run validate-data
npm test
npm run build
npm run dev
```

仍需组员补充的内容：第一章结局卡缺少引用；透明招聘／协调员介入的替换英文对白未提供；男棋子 Ideal Worker 锁定选项缺少专属独白。这些没有擅自补写，细节在导入报告。无需另外安装游戏引擎，组员在线试玩只需浏览器。
