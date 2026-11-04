# Genderpoly — 游戏 Demo

NMC5369 Media Project 的网页游戏。游戏名 **Genderpoly**，公司名 **FreeDom**；中英文剧情来自组员共享表格。

## 当前版本与试玩

**v0.24：试玩反馈与阅读排版。** 同步 11 月 5 日共享表格里的剧情措辞、分段和粗体；人物直接对话使用斜体。中文重点与对应英文含义对齐，表格原有的中文粗体保留。公司名称统一为 **FreeDom**。补入第一章结局新增的文献，并在“为什么会发生这种情况？”背景说明中直接显示该场景的引用。首页章节条新增 **Your Career Chapters／你的职业生涯篇章**，规则书操作说明和建议语气按反馈调整。三张晋升美术已核对，继续使用原审核定稿。

每章开头的 Energy 提醒、**Energy ≤ 2** 疲劳提示、高亮操作按钮、结局下滑箭头和 **Credits／制作名单** 均保留。此次更新不改分支、数值或存档格式。

三张晋升定稿继续使用，两个章节里程碑均显示美术。 第一章男女共用一张，第二章按当前棋子显示男女对应版本。此前的卡框自适应修复继续保留：剧情、结果、章节与晋升弹窗按完整内容计算高度，由外层滚动，内框不再横穿展开后的文字；极矮窗口的重置确认页也可滚动到全部按钮。历史选择和收藏详情保留各自的阅读滚动。已检查中英文、电脑和手机竖横屏；验证记录见 [AI_LOG](docs/AI_LOG.md)，线上发布状态见 [GitHub Actions](https://github.com/Ebitorako/same-rules-demo/actions)。

51 张角色／表情与结局定稿继续使用，新增的三张晋升图片也已全部获准接入。第二章保留领导与主角并排站立、桌旁同事鼓掌的办公室场景，男女版只更换主角。正式图片、实际路径与制作参考见[制作清单顶部](docs/ART_REQUIREMENTS.zh-CN.html#missing)；审核原始 JSON 与生成来源保存在[本地最终素材总览](art/approved/2026-11-03/index.html)，该目录不随游戏发布。Boss 额外表情需求已取消，继续使用现有立绘。

声音沿用 v0.19 的防叠加逻辑：当前游戏页接管声音，进入棋盘时切换游戏 BGM；后台暂停不修改存档或声音偏好。新玩家默认开启声音，已有偏好保留，右上角黑白扬声器按钮与 Settings 共用设置。

**更新后刷新游戏页即可查看新排版与晋升美术，无需清空存档。** 本地预览若已开启，先重新启动以更新图片索引。游戏已经打开的旧标签页也应刷新或关闭。

[中文试玩](https://ebitorako.github.io/same-rules-demo/?lang=zh-CN) · [English](https://ebitorako.github.io/same-rules-demo/?lang=en) · [GitHub 仓库](https://github.com/Ebitorako/same-rules-demo)

本地双击 [启动游戏.cmd](启动游戏.cmd)，或运行 `npm run dev`，打开提示的网址。选择 **Female pawn / Male pawn → Enter the studio**；用 **Next** 前进、点击选项并 **Continue**。键盘支持 `1`–`4`、`Enter`，按键与屏幕编号一致。点击右上角 **黑白扬声器图标** 快捷切换声音，也可使用 **Settings → Sound**；浏览器要求先有一次点击才允许播放。

点击右上角 **Settings／设置 → Language／语言 → English／中文** 切换，再点击 **Back／返回** 继续。语言入口只保留在设置页。中文版点击 **开始职业生涯 → 女性棋子 / 男性棋子 → 进入工作室**。语言偏好会保存，刷新不会变回英文；切换不重开、不重选，也不会重复加减数值。旧原型收藏仍保留当时的原始文本。

旧原型存档保留在 Gallery 的 **Earlier prototype records**，正式剧情和旧结局不混用。不需要为更新主动清空存档。

点击 **结局收藏 / Gallery → 任意已解锁卡片** 查看完整描述及最终数值，**翻面 / Turn over** 查看理论、文献和每次生涯的数值复盘。点击 **关闭 / Close** 或按 **Esc** 返回收藏；点击黑色未解锁卡片只会短暂提示。途中晋升卡显示“章节里程碑”，不再显示结局编号。

## 本轮内容

- 20 个剧情位置、4 段章节开场、13 个终局，两个章节晋升卡只在过渡时查看，不进入 Gallery。
- 六项能力初始值：Creativity 3、Communication 3、Network 2、Reputation 2、Availability 2、Energy 7。游玩中隐藏数值，终局正面显示最终值，反面显示选择及系统规则复盘。
- 两枚棋子和四位 Boss 已按提供的两张图分拆为透明 PNG；原稿保留。另有 38 张已审核角色／表情与 13 张结局插图接入对应位置，保持统一的工牌角色风格。
- 首页展示最新提供的完整游戏效果图，保存于 `public/assets/ui/title.png`；中英文及手机共用原图，按比例完整显示。
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

已审核的 **54 张新增最终素材**（38 张角色／表情、13 张结局图、3 张晋升图）全部接入。加上原有两枚棋子和四位 Boss，生产清单共 **59 个逻辑资源、60 张实际 PNG**，首页海报另计。每张 PNG 只保留一份运行文件；三张 HR 仍使用第四轮确认的第二轮椭圆眼镜原图。

本地 `art/approved/2026-11-03/index.html` 是最终素材总览，直接读取这些运行文件。同目录保存清单、原角色结局四轮与晋升两轮审核 JSON、来源和实际生成 Prompt 等文字记录，不另存重复图片。晋升来源统一保存在 [milestone-provenance.json](art/approved/2026-11-03/milestone-provenance.json)；旧审核页面与未采用图片清理后，以正式运行文件及最终目录为准。

| 位置 | 用途 |
|---|---|
| `art/approved/2026-11-03/` | 本地最终素材总览、审核与来源记录；图片引用运行目录，不另存副本 |
| [public/assets/](public/assets/) | 游戏实际加载的图片、字体与音频 |
| `characters/`、`bosses/` | 两枚棋子、四位 Boss |
| `npc/`、`cards/` | 38 张角色／表情、13 张结局、3 张晋升定稿；卡牌堆问号由界面绘制 |
| `cards/ending_CH1-E01.png` | 第一章晋升，男女共用 |
| `cards/ending_CH2-E07_male.png`、`cards/ending_CH2-E07_female.png` | 第二章晋升，按当前棋子显示对应版本；没有无后缀的 CH2 PNG |
| `audio/music/`、`audio/effects/` | 背景音乐、短音效；用途见同目录 catalog |
| [docs/reference/](docs/reference/) | 用户原稿；其中大型音频只保留本地，不提交 Git |
| [public/data/team-content.json](public/data/team-content.json) | 正式剧情运行数据 |
| [docs/source/](docs/source/) | 原表快照、导入与调平记录；旧版数据子目录仅供测试 |
| [src/](src/) | 游戏逻辑与界面 |
| [scripts/](scripts/) | 内容导入、检查与音频处理 |
| [docs/tools/](docs/tools/) | 生成美术清单、音频试听等维护工具 |

后续直接把图片发到聊天即可，由 Codex 分拆、命名和接入。也可以自行移动资源，只需同步 [manifest.json](public/assets/manifest.json) 的右侧路径，固定资源名称不变。路径以 `assets/` 开头，不写盘符或 `public/`。

**[打开唯一的美术需求与 Prompt 清单](docs/ART_REQUIREMENTS.zh-CN.html)**：6 张既有棋子／Boss、38 张角色／表情、13 张结局与3张晋升 PNG 均已接入，共 60 张实际图片、59 个逻辑资源；首页海报另行保留。当前没有待审核素材或可见美术占位。Boss 额外表情需求已取消，不再列文件或制作 Prompt；游戏复用原 Boss 立绘。第一章使用已通过原图，第二章男女两版按当前棋子读取；第二章逻辑资源下只列两个实际文件路径。清单按实际文件显示状态，保留后续复用的制作 Prompt；最终实际生成与修改 Prompt 保存在本地审核目录。

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
