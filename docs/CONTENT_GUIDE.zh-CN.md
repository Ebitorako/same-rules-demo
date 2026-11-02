# 组员正式剧情接入指南（v0.12）

当前正式内容来自 [共享表](https://docs.google.com/spreadsheets/d/1I28ChU7iAl6aHeJ9U5UPgOz2YptRXfwZ8VwOgwCg8Ow/edit) 的 `ch1`、`ch2`、`ch3`、`ch4` 和 `ch3相关规则说明`。这次只读取表格，没有改变组员共享文件。旧“剧本模板”“结局卡”页的示例不再作为游戏正文。

## 以后怎么改稿

1. 组员继续在共享表中修改英文场景、选项、结果、数值、规则书和结局。保留卡号及清楚的条件，不把备注中的规则变更当作单纯文字修改。
2. 告诉 Codex 哪些页更新了。Codex 重新读取来源并保存新快照，核对是否出现新字段、分支或冲突。
3. 更新映射后运行 `node scripts/import-team-content.mjs`，再检查数据、测试和构建。
4. 本地分别使用男女棋子体验相关分支、门槛和结局；发布后组员才会在公共网址看到新内容。

**导入脚本不会自动读取 Google Sheet。** 它读取项目里已保存的 `docs/source/2026-11-03-team-sheet.json`。不要拿旧快照重跑后覆盖新稿。若快照文件名改变，需同步脚本入口。

| 文件 | 当前作用 |
|---|---|
| `public/data/team-content.json` | 唯一正式剧情运行数据：场景、数值、条件、effects、章节、里程碑、终局、指南建议及共用文案 |
| `public/data/scenarios.csv` / `endings.csv` | 便于查阅、比对和表格打开的导出；单独改这里不会更新游戏 |
| `public/data/copy.json` / `candidates.json` / `policies.json` | 正式运行数据的对应查阅导出；修改后需同步生成源，不是独立覆盖项 |
| `public/data/guide.json` | 实际读取：常驻 NPC 名称、身份和头像资源 key |
| `public/data/guide.csv` | 实际读取的通用导航 fallback；正式逐卡建议优先使用源表“规则书”列 |
| `public/data/legacy-data.json` | 旧版收藏使用的旧结局/共用文案，不能换成正式版编号解释 |
| `docs/source/2026-11-03-import-report.json` | 来源、数量及缺失/冲突的处理记录 |

## 一行是一个适用版本的选项

原表的 111 行有效选项完整保留。为落实 E05 下一局明确要求的台词，另派生了 C3-01 的三行女棋子版本，总计 114 行。每行带原工作表、原卡号与行号；同一棋盘位置只显示符合当前分支的一组。

| 棋盘槽 | 原表可用编号 |
|---|---|
| `C1-03` | `C1-03F` / `C1-03M` |
| `C2-04` | `C2-04A` / `B` / `C` / `D` |
| `C3-03`、`C3-04`、`C3-05` | 各自的 `a` 有孩子 / `b` 无孩子版本 |

每个棋子不再固定三个选项。C1-B 一项；C2-03 四项（D 内部编号 4）；女棋子的 C2-04 A/B/C 有第四项辞职；D 是强制离职叙事确认。其余按原表三项。不要为了凑齐三个按钮删除、复制或新写选项。

“出现条件”先区分两个用途：`condition` 决定看见哪个场景/选项版本，`availableWhen` 决定已显示选项能否选。未达数值门槛时保留灰色按钮，点击读原稿独白；不会实际选择、扣分或改变记录。门槛数字仍不在普通游玩中显示。

常用运行条件示例：`pawn:female`、`flag:has_child=true`、`flag:c2_branch=B`、`flag:policy=transparent`、`policy:transparent`、`stat:Availability>=3`。其中 `flag:policy` 是本轮提案，`policy:` 是上一轮生效政策，不能混用。原表可继续使用目前易读写法，映射由导入脚本处理；新增写法必须一起更新验证。

## 数值、表情与复盘

当前只有六项：Creativity、Communication、Network、Reputation、Availability、Energy。两枚棋子开局都是 **3、3、2、2、2、7**。数值列保留 `Network+1, Energy-1` 形式；空白表示不变。

沿用 0–10 上下限，Energy ≤ 1 提示，Energy ≤ 0 立即 E11 Burnout。没有对正式稿重新平衡。第三章开场的 Availability −1 是系统事件，只适用于带 maternal_assumption 的女棋子，透明政策取消它；刷新不能重复扣。

数值仍只在终局揭示：正面显示最终值；反面 Theory、References 下方按顺序列选择和系统变化，区分原效果、实际变化与上下限。普通 YOUR CHOICES 显示当时剧情和结果，不揭示数值，也不允许重选。能力解释保存在运行数据的 `copy.statDescriptions`；不要把文学理论引用当作能力标签说明。

表情用词：满意→`pleased`，中性→`neutral`，打量→`appraising`，皱眉→`frowning`，尴尬→`awkward`，冷淡→`cold`。实际需要的角色及表情数量见 [美术制作清单](ART_REQUIREMENTS.zh-CN.html)，不要默认每个角色都需要六张。

## Boss、政策和下一局

- C1-B 自动按 Creativity ≥ 5、否则 Communication ≥ 5、否则均不足分流；通过显示 CH1-E01 后进入第二章。
- C2-B 的 1/2 项分别需要 Network ≥ 5 / Creativity ≥ 6；第三项永远可选但男女走不同结果。CH2-E07 是晋升里程碑，不终止职业。
- C3-B 第1项需要 Availability ≥ 3，须通过并到 Creative Director 才能进入第四章。partner_primary 的男棋子第1项直接结算 E05；第2/3项按源表进入指定终局。
- C4-03 选择提案，C4-B 决定通过、降级、升级或撤回。transparent >5、coordinator >4、zero_tolerance 直接通过无门槛，其升级需要 >5。不是旧版通用“失败即退出”机制。
- 生效 coordinator 减轻下一局指定 C2-04 女棋子结果；transparent 改 C2-02、C2-B 及第三章开场的明确规则。只在董事会最终决定后记录政策。
- 招聘保留 Josh / Chloe 与盲审结果。下一局重新选择棋子，不强制继承被聘用者；上一局成为 Creative Director 或 E05 Family Man 的玩家可成为下一局 Gatekeeper。

改门槛、效果或触发条件必须同时更新正式运行数据与测试，不能只改结果正文或“触发条件”说明。

## 结局、章节卡与规则书

正式终局为 E02–E14，共 13 张，Gallery 只收藏这些终局。CH1-E01 Through the Door、CH2-E07 Moving Up 为两张章节里程碑，在章节过渡时可翻面查看，不进入 Gallery；它们显示原来的 E01/E07，但内部加章节前缀，避免与第三章 E07 Maybe It Was Just Me 冲突。所有卡均保留来源，不改写组员的编号含义。

结局正反面使用原文、理论和引用，支持段落及多行文献。E04 男棋子使用备注给出的专属正面；E14 可选末尾句暂不加。终章只在 E12/E13/E14 完整通关后展示。

规则书建议优先使用当前分支的“规则书”列；保留组员设计的轻快行业常识语气。背景信息使用中性场景背景，结局背面解释刚经历的机制。玩家可隐藏建议，阅读偏好不会改规则。

## 本轮保留的源表问题

**E03 需要组内优先确认。** 第一章男女各81条、共162条选择路线已经全部检查，最终总有 Creativity 或 Communication 至少一项达到5，因此没有路径会触发 E03 拒绝录用。原值和这张卡都保留，没有为了凑齐收藏自行改数值。其余12个终局均验证有真实可达路线；若希望E03也可收集，请组内明确调整方案。

1. 第一章结局小表没有文献列：CH1-E01、E02、E03 的 References 为空，不从 Boss 自动借引用。
2. C2-04B 选项2的 Q30 是 Reputation +1，备注说取消 −1；保留 +1，不额外加分。
3. transparent 的 C2-B 选项2备注“结果与男性相同”按结果文案/表情执行，女数值仍按明确的 Communication +1、Reputation +1。
4. 透明政策的正式会议、协调员在场谈话没有新版英文对白；机制已接入，但组员需补对应文本，不由程序新写。
5. 男 Ideal Worker 不足门槛没有专属独白，未编造；E05 下一局原定台词已加入。
6. 终章触发范围文字冲突，按第四章末行及全程叙述仅在完整通关后出现；原表未规定新最大值，保留10。

更完整的记录在导入报告。后续补稿时请标明修改的页、行和男女适用范围，尤其是理论的对应文献。

## 验证与素材交付

```bash
npm run validate-data
npm test
npm run build
npm run dev
```

用男女棋子分别检查改动卡、四选项/灰显独白、章节开场、提前终局、完整通关、下一局政策和结局复盘。正式数据自动验证会枚举各可见分支；来源测试核对原文字和数值。浏览器验收与本轮发布仍待最终记录，不能只凭构建成功宣称上线。

两枚棋子、四位 Boss 和音频已由你制作，但尚未放入项目。按 [美术与音频清单](ART_REQUIREMENTS.zh-CN.html) 中的文件名放到 `public/assets/`，原稿放 `docs/reference/`；移动文件时改 `public/assets/manifest.json` 的路径。不要改资源 key 或用旧编号覆盖新结局的图片。音频框架已接，收到文件后还需试听和检查循环，缺文件时不会自动生成声音。

历史原型的资料保存在 `docs/source/prototype-v0.11/`。那里关于八项能力、三选一和旧 Boss/结局的说明只用于旧档追溯，不能作为本版规则。
