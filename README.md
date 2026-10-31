# Same Rules? — 游戏 Demo

这是 NMC5369 Media Project 的网页游戏骨架。游戏界面使用英文；给组员和美术的操作说明使用中文。剧情、结局与图片分别放在独立文件夹，后续可逐批替换。

目前内容包含完整流程所需的 **20 张卡位：16 张情境卡 + 4 张 Boss 卡**。除了保留的 `C2-03` 原始示例，其余新增文字用于测试流程，不是组员的最终稿。初始数值、Boss 门槛和结局判定也需要团队确认；能通关不代表已经完成游戏平衡。

## 在线试玩

**[打开 Same Rules? 试玩](https://ebitorako.github.io/same-rules-demo/)** · **[GitHub 项目仓库](https://github.com/Ebitorako/same-rules-demo)**

把试玩链接发给组员即可，浏览器打开就能玩，无需 GitHub 账号或安装软件。点击 **Start a career**，选择 **Female pawn** 或 **Male pawn**，再点击 **Enter the studio**。棋盘上点击 **Next** 前进，选择卡牌选项后点击 **Continue**。

GitHub Pages 首次发布已完成。之后把修改上传到仓库的 `main` 分支，会自动检查并更新同一个试玩网址；具体操作见[试玩网站发布说明](docs/DEPLOYMENT.zh-CN.md)。当前仍是包含占位剧情和占位美术的 Demo。

10 月 31 日的功能已发布到上面的同一试玩网址。以后本地修改仍需完成检查并上传，才会更新网站。

## 10 月 31 日更新：棋盘、引导与结局卡

六个特殊地块使用固定的拉丝金属背景：沿路线四位 Boss 依次为 **Gatekeeper 红、Old Boys' Network 绿、Ideal Worker 蓝、The System 紫**；**Creative Director 银色，START / 终点金色**。走过后保留金属色并加勾记。离开 START 后，它仍是金色，只把标记翻成 `?`。

常驻引导 NPC 在桌面棋盘旁、窄屏棋盘下方显示；选择卡中会先显示建议，再显示三个选项。点击 **Hide advice** 可以收起建议，**Ask the guide** 再次展开；有背景资料时，点击 **Open the rulebook** 查看行业背景、理论和文献。可以直接选择，不必先读完建议。隐藏偏好会保存，旧存档仍可继续；这些操作不会改变游戏数值或结果。

引导的专属台词目前留空等组员填写，只有通用导航提示。填写位置是 [guide.csv](public/data/guide.csv)，角色名字与头像名称在 [guide.json](public/data/guide.json)；操作步骤见[剧情指南](docs/CONTENT_GUIDE.zh-CN.md)。

结局卡点击 **Turn the card over**，或 Gallery 中已解锁卡点击 **Turn over**，背面会分别显示 **Theory** 与 **References**。支持多行引用与长文滚动，内容来自原来的 `endings.csv`，程序不会生成文献。

## 在本机修改和试玩

1. 在这个文件夹双击 **[启动游戏.cmd](启动游戏.cmd)**，保留它打开的窗口。
2. 按窗口提示打开本地网址 `http://127.0.0.1:5173/`。若提示端口被占用，先确认是否已有一个游戏启动窗口在运行；不要反复启动多个副本。
3. 点击 **Start a career**，选择 **Female pawn** 或 **Male pawn**，然后点击 **Enter the studio**。棋盘上点击 **Next** 前进，再选择卡牌选项，结果页点击 **Continue**。也可以用键盘 `1`、`2`、`3` 选项和 `Enter` 继续。

第一次启动需要联网准备项目依赖。以后依赖已在电脑上时，可以直接启动。不要双击 `index.html`；游戏的数据加载需要通过启动脚本提供的本地网址。

10 月 31 日版本的数据校验、55 项自动测试及构建通过。在线验收确认了六色金属地块、指引收起与恢复、刷新保留偏好、规则书内容、手机竖屏选择，以及 E03 结局和画廊的 Theory / References 翻面；未发现浏览器警告或错误。手机检查使用 390 × 844 浏览器尺寸，正式展示前仍需安排实体手机及完整职业试玩。

游戏会在当前浏览器自动记录进度，刷新页面会继续当前职业。浏览器、网址或端口变化可能使用另一份记录。标题页的 **Settings** 可重置全部进度；这会清除已解锁结局和历代角色。

标题页的 **Continue career** 可继续未完成的一轮；**Gallery** 查看已经解锁的结局。一轮结束后选择 **Next career** 体验上一轮决定对下一轮的影响。

想检查隐藏数值，可在网址末尾加 `?debug=1`。对外演示使用普通网址。

## 需要下载什么

这台电脑已经有 **Node.js 24** 和 **Git**，当前不用额外安装 Unity、Unreal 或其他游戏引擎。组员在线试玩只需浏览器；Node.js 用于本机启动和构建项目，Git 用于版本管理和上传更新。

整理剧情可以继续用现有的 Google Sheets 或 Excel。修改少量文件可以用文本编辑器；没有必要为了本次试玩再安装一个软件。图片从你的图像聊天导出后放入指定资源文件夹即可。

## 文件放哪里

| 位置 | 内容 | 日常操作 |
|---|---|---|
| [public/data/](public/data/) | 英文剧情、选项、结局、候选人、政策、引导 NPC 台词 | 组员交稿后更新这里，见[剧情指南](docs/CONTENT_GUIDE.zh-CN.md) |
| [public/data/guide.csv](public/data/guide.csv) / [guide.json](public/data/guide.json) | 22 行引导模板，以及 NPC 名字、身份、头像名称 | 填写建议、行业背景、理论和引用；卡号保持唯一 |
| [public/assets/](public/assets/) | 游戏实际使用的图片、音频、字体 | 你添加或替换资源，见[美术指南](docs/ART_GUIDE.zh-CN.md) |
| [public/assets/manifest.json](public/assets/manifest.json) | 资源名称与文件路径的对应表 | 改图片名称或移动图片后同步修改路径 |
| [docs/reference/](docs/reference/) | 草图、布局参考、风格参考 | 可以手动整理，不会自动作为游戏图片显示 |
| [docs/starter-data/](docs/starter-data/) | 最初提供的剧情数据备份 | 留作对照，游戏不读取这里 |
| [docs/GAME_SPEC.md](docs/GAME_SPEC.md) | 当前采用的游戏规则与设计规格 | 规则变更先在这里核对 |
| [src/config/rules.ts](src/config/rules.ts) | 初始数值、Boss 门槛、开放设计选项 | 与 Codex 一起调整并测试 |
| [src/styles/tokens.css](src/styles/tokens.css) | 界面色板和六种金属色 | 配色集中在这里，特殊地块不必另做背景图 |
| [src/data/guide.ts](src/data/guide.ts) / [src/ui/guide.ts](src/ui/guide.ts) | 引导数据检查与显示框架 | 组员日常只需填写上面的 CSV / JSON |
| [src/](src/) | 游戏流程、界面、样式 | 由 Codex 维护骨架 |
| [docs/AI_LOG.md](docs/AI_LOG.md) | AI 使用记录 | 用于课程提交的附录 |

根目录的 `GAME_SPEC.md` 和 `nmc5369-codex-starter.zip` 保留为原始交付文件。继续开发以 **`docs/GAME_SPEC.md`** 为准。

资源子文件夹：

```text
public/assets/
  manifest.json   资源路径表
  characters/     两种玩家棋子
  bosses/         四个 Boss
  npc/            情境 NPC、表情与 guide_neutral 引导头像
  cards/          卡背与结局图
  ui/             标题、边框等界面图片
  audio/          音效、音乐及授权说明
  fonts/          本地字体（需要离线展示时使用）
```

**你可以手动调整资源位置。** 最省事的方法是用相同文件名替换图片；如果更改名称、扩展名或子文件夹，再更新 `manifest.json` 的对应路径。`src`、`public`、`public/data` 属于程序的固定目录，不要只在文件管理器里直接重命名；需要重组时让 Codex 一起改引用并检查。

## 换一批内容的顺序

1. 把最终剧情或引导台词导出为 UTF-8 CSV，替换 `public/data` 中对应文件；先保留一份组员原稿。`guide.csv` 每个卡号只有一行，与剧情表每个选项一行的方式不同。
2. 把美术成品放入 `public/assets` 的对应子文件夹，核对资源路径表。
3. 双击 **[检查项目.cmd](检查项目.cmd)**，检查数据、游戏逻辑和发布构建。
4. 启动游戏，完整试玩受到改动影响的部分。引导有改动时检查收起、展开及规则册；结局有改动时翻到 Theory / References 并检查长文滚动。数据有大改时，通过 Settings 重置旧测试进度再开始。

提供的卡牌占位文字、候选人和政策只是接入样例。正式交稿前替换占位内容并删掉相应占位标记，核对文献出处、理论表述和结局。

## 给继续开发的人

在此目录打开终端：

```bash
npm install
npm run dev
npm run validate-data
npm test
npm run build
```

`validate-data` 检查表格；`test` 检查关键规则；`build` 生成 `dist/` 发布文件。`dist/` 是生成结果，不要直接改它来替换内容。

`node_modules/` 是已安装的开发组件，`.tools/` 是检查过程中生成的文件；它们和 `dist/` 都无需组员手动编辑。分享源码时可省略这些生成文件，接收者先运行 `npm install` 即可恢复组件。

技术准备与后续上线可参考 [Vite 官方说明](https://vite.dev/guide/) 和 [GitHub Pages 官方发布说明](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

排期 T04 的仓库和试玩网站已上线，[首次发布记录](https://github.com/Ebitorako/same-rules-demo/actions/runs/40188632600)为成功状态。发布、更新和组员试玩方式见[试玩网站发布说明](docs/DEPLOYMENT.zh-CN.md)。在线版本仍由浏览器保存进度，不会跨设备同步。

下一轮由团队确认：最终剧情、引导台词和文献、初始数值与 Boss 门槛、结局条件、政策效果，以及普通已走格子的配色。六个特殊地块的金属色按 10 月 31 日决定固定。当前六个结局按退出原因或是否推行正式招聘政策选择；**The System 最后一次选择如何对应不同结局，还需要团队定义**。当前可先沿用规格中的默认值继续制作。
