# Genderpoly — 游戏 Demo

NMC5369 Media Project 的网页游戏。游戏名 **Genderpoly**，棋盘公司名 **FreeDOM**；剧情保留组员英文原文中的拼写。游戏使用英文，交接说明使用中文。

## 当前版本与试玩

**v0.12（2026-11-03）已在本地接入正式 CH1–4，并完成测试、构建与本轮浏览器验收；尚未发布。** 当前线上网站此前发布的是 v0.11，不要把它当作本轮正式内容已上线的证据。

**115 项自动测试通过（12 个测试文件）**，数据检查与生产构建通过；数据检查保留11条已记录的源表提示。本地浏览器已实际完成女棋子20次选择到E14、男棋子D路线到E10、灰显选项的独白与刷新、结局复盘、终章和再开一局。在390×844手机尺寸检查了双列最终数值和剧情卡，没有横向溢出；桌面浏览器警告/错误为空。政策继承和旧档迁移由自动测试覆盖，本轮未再完整手工重测。截图见 [本轮验收截图](../story-integration-verification-2026-11-03/)，详细记录见 [AI_LOG](docs/AI_LOG.md)。

[在线试玩地址](https://ebitorako.github.io/same-rules-demo/) · [GitHub 仓库](https://github.com/Ebitorako/same-rules-demo)

本地试新版本：双击 [启动游戏.cmd](启动游戏.cmd)，或在本文件夹运行 `npm run dev`，打开提示的本地网址。点击 **Start a career → Female pawn / Male pawn → Enter the studio**；棋盘上用 **Next** 前进，点击选项后用 **Continue** 继续。支持键盘 `1`–`4`、`D` 和 `Enter`。灰色 Boss 选项只能阅读独白，不会替玩家选择或扣分。

游戏自动保存当前进度。这个版本会把旧原型的记录放入 Gallery 的 **Earlier prototype records**，不把旧结局编号和数值混入正式剧情。重新选择棋子即可开始正式内容；不要为了更新版本主动重置全部存档。

## 已接入什么

- 棋盘仍为 20 个剧情位置：16 个情境槽 + 4 个 Boss；共 111 行源选项，另有 3 行按 E05 下一局台词生成的条件版本。
- 4 段章节开场、13 个终局（E02–E14），以及 2 张在章节过渡时可翻面查看、但不结束职业的章节里程碑（CH1-E01、CH2-E07）。Gallery 只收藏 13 个终局；完整通关后展示终章。
- 六项能力：**Creativity 3、Communication 3、Network 2、Reputation 2、Availability 2、Energy 7**，男女起点一致。正式内容不再使用临时的 Skill、Money。
- 第二章的 A/B/C/D 路线、第四选项、女性辞职选项；第三章的生育、伴侣照护与承诺标记；第四章招聘、政策方案、董事会门槛和下一局影响。
- 规则书使用各分支原表的“规则书”台词。数值在游玩和 YOUR CHOICES 回顾中保持隐藏；终局正面显示六项最终值，背面在 Theory / References 后列出逐选择变化，也记录第三章开场的系统扣分。
- 六个金属特殊地块、普通地块未走黑色/走过奶油白、历史卡自动重叠与点击回顾继续保留。

Boss 规则已改为正式稿：C1 邮件按能力自动分流；C2/C3/C4 未达门槛的选项灰显，其余选项仍可选择。详细门槛、直接离职和政策结局见 [GAME_SPEC.md](docs/GAME_SPEC.md)。Energy ≤ 1 提醒，Energy ≤ 0 立即进入 E11 Burnout；本次没有自行调平。

## 剧情与资源放哪里

| 位置 | 用途 |
|---|---|
| [正式剧情来源 Google Sheet](https://docs.google.com/spreadsheets/d/1I28ChU7iAl6aHeJ9U5UPgOz2YptRXfwZ8VwOgwCg8Ow/edit) | 组员继续修改 ch1–ch4；本次仅读取，没有改动共享表 |
| [team-content.json](public/data/team-content.json) | 游戏实际读取的正式剧情、数值、条件、开场、结局和共用文字 |
| [来源快照](docs/source/2026-11-03-team-sheet.json) | 本轮读取的原表内容与行号，便于对照 |
| [导入报告](docs/source/2026-11-03-import-report.json) | 数量、来源和未自行补写的缺失/歧义 |
| [剧情接入指南](docs/CONTENT_GUIDE.zh-CN.md) | 以后修改与重新导入的流程 |
| [美术与音频制作清单](docs/ART_REQUIREMENTS.zh-CN.html) | 每项资产、人物/表情数量、尺寸、文件名与可复制 prompt |
| `public/assets/characters/` | 已完成的两枚玩家棋子 |
| `public/assets/bosses/` | 已完成的四位 Boss 游戏用图 |
| `public/assets/npc/`、`cards/`、`ui/` | NPC 表情、结局图、卡背及界面图 |
| `public/assets/audio/` | 已完成音频的运行版本 |
| `docs/reference/players/`、`bosses/`、`audio/` | 原始设定稿或未分类音频，供制作和提取，不直接进入游戏 |

你确认两枚棋子、四位 Boss 和音频已经制作好，但还未放入项目。现在仍显示资源占位；没有重新生成已有美术，也未宣称已替换或试听。文件放入后按清单命名，或在 `public/assets/manifest.json` 调整对应路径，再重启预览检查。可以手动调整文件位置，保留左侧资源名称不变即可。

音频框架已提供主背景、Boss 背景、移动、翻卡、选择、结局六类资源入口。只有背景音乐也可以先接入；Settings 的 Sound 控制播放。缺文件时保持静音，等待玩家操作后才尝试播放。实际音质、循环、音量及格式要在文件交付后检查。

## 修改后检查

组员更新共享表后，让 Codex 读取新快照并核对规则，不要只替换一个 CSV。当前 `scenarios.csv`、`endings.csv`、`copy.json`、`candidates.json`、`policies.json` 是查阅导出；游戏从 `team-content.json` 读取对应内容，单改这些导出文件不会更新游戏。

```bash
node scripts/import-team-content.mjs
npm run validate-data
npm test
npm run build
npm run dev
```

导入脚本读取当前保存的 `docs/source/2026-11-03-team-sheet.json`，**不会自动联网刷新 Google Sheet**。新规则、列名或表结构变化后要同步调整映射；不要用旧快照覆盖组员新稿。数据检查通过不代表文献已经补齐或完成数值平衡。

## 需要组员补充的原表细节

**优先确认 E03 的可达性：** 已穷举第一章男女共 162 条完整路线，按原稿数值总能让 Creativity 或 Communication 至少一项达到5，所以 E03 拒绝录用目前无法触发。程序保留这张结局和原值；若希望玩家能收集到 E03，需要组内决定调整哪些数值或门槛。其余 12 个终局均已用真实选择路线验证可达。

- 第一章的三张章节/结局卡没有 References 列，引用留空。
- 协调员介入谈话、透明招聘改为正式会议决策的替换英文对白未提供；明确数值效果已接入，原对白保留。
- C2-04B 选项 2 的数值是 Reputation +1，但备注说取消 −1：保留 +1，不再加分。transparent 的 C2-B 选项 2 只换结果文案/表情，数值仍遵守独立数值列。
- 男棋子在 Ideal Worker 未达门槛时没有专属独白；显示不可用状态，不编造台词。E14 的可选末尾句未追加。
- 源表未给新上限，暂保留原骨架 0–10 范围；完整通关的 E12/E13/E14 后播放终章，早退不显示“已走完全程”的文字。

全部映射处理见导入报告。无需额外安装游戏引擎：本机已有 Node.js 和 Git；组员在线试玩只需要浏览器。

## 历史说明

v0.11 以前的原型文档、CSV 和示例数据保存在 [prototype-v0.11](docs/source/prototype-v0.11/)，历次验收保留在 [AI_LOG.md](docs/AI_LOG.md)。其中旧的八项属性、统一三选一、通用 Boss 失败判定和强制继承实习生设定，均为被 v0.12 正式稿替换的历史规则。当前以 [GAME_SPEC.md](docs/GAME_SPEC.md) 为准。
