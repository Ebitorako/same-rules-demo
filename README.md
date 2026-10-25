# Same Rules? — 游戏 Demo

这是 NMC5369 Media Project 的网页游戏骨架。游戏界面使用英文；给组员和美术的操作说明使用中文。剧情、结局与图片分别放在独立文件夹，后续可逐批替换。

目前内容包含完整流程所需的 **20 张卡位：16 张情境卡 + 4 张 Boss 卡**。除了保留的 `C2-03` 原始示例，其余新增文字用于测试流程，不是组员的最终稿。初始数值、Boss 门槛和结局判定也需要团队确认；能通关不代表已经完成游戏平衡。

## 在线试玩

**[打开 Same Rules? 试玩](https://ebitorako.github.io/same-rules-demo/)** · **[GitHub 项目仓库](https://github.com/Ebitorako/same-rules-demo)**

把试玩链接发给组员即可，浏览器打开就能玩，无需 GitHub 账号或安装软件。点击 **Start a career**，选择 **Female pawn** 或 **Male pawn**，再点击 **Enter the studio**。棋盘上点击 **Next** 前进，选择卡牌选项后点击 **Continue**。

GitHub Pages 首次发布已完成。之后把修改上传到仓库的 `main` 分支，会自动检查并更新同一个试玩网址；具体操作见[试玩网站发布说明](docs/DEPLOYMENT.zh-CN.md)。当前仍是包含占位剧情和占位美术的 Demo。

## 在本机修改和试玩

1. 在这个文件夹双击 **[启动游戏.cmd](启动游戏.cmd)**，保留它打开的窗口。
2. 按窗口提示打开本地网址 `http://127.0.0.1:5173/`。若提示端口被占用，先确认是否已有一个游戏启动窗口在运行；不要反复启动多个副本。
3. 点击 **Start a career**，选择 **Female pawn** 或 **Male pawn**，然后点击 **Enter the studio**。棋盘上点击 **Next** 前进，再选择卡牌选项，结果页点击 **Continue**。也可以用键盘 `1`、`2`、`3` 选项和 `Enter` 继续。

第一次启动需要联网准备项目依赖。以后依赖已在电脑上时，可以直接启动。不要双击 `index.html`；游戏的数据加载需要通过启动脚本提供的本地网址。

这台电脑的依赖已于 2026-10-25 安装完成。本地构建、资料校验与 35 项自动检查全部通过，包含真实 CSV 的两轮职业流程；GitHub 上的自动检查和首次发布也已成功。

线上浏览器已验证首页、角色选择、22 格棋盘、首张卡的 3 个选项、选择结果、刷新保留同一结果、继续后的 `01 / 20 CARDS` 进度及下一张卡。390 × 844 的手机竖屏尺寸下，棋盘和卡牌显示正常、选项可用；数字 `3` 和 `Enter` 的实际操作成功，浏览器控制台没有警告或错误。实体手机试玩及浏览器内完整 20 张卡通关仍待团队检查。

游戏会在当前浏览器自动记录进度，刷新页面会继续当前职业。浏览器、网址或端口变化可能使用另一份记录。标题页的 **Settings** 可重置全部进度；这会清除已解锁结局和历代角色。

标题页的 **Continue career** 可继续未完成的一轮；**Gallery** 查看已经解锁的结局。一轮结束后选择 **Next career** 体验上一轮决定对下一轮的影响。

想检查隐藏数值，可在网址末尾加 `?debug=1`。对外演示使用普通网址。

## 需要下载什么

这台电脑已经有 **Node.js 24** 和 **Git**，当前不用额外安装 Unity、Unreal 或其他游戏引擎。组员在线试玩只需浏览器；Node.js 用于本机启动和构建项目，Git 用于版本管理和上传更新。

整理剧情可以继续用现有的 Google Sheets 或 Excel。修改少量文件可以用文本编辑器；没有必要为了本次试玩再安装一个软件。图片从你的图像聊天导出后放入指定资源文件夹即可。

## 文件放哪里

| 位置 | 内容 | 日常操作 |
|---|---|---|
| [public/data/](public/data/) | 英文剧情、选项、结局、候选人、政策 | 组员交稿后更新这里，见[剧情指南](docs/CONTENT_GUIDE.zh-CN.md) |
| [public/assets/](public/assets/) | 游戏实际使用的图片、音频、字体 | 你添加或替换资源，见[美术指南](docs/ART_GUIDE.zh-CN.md) |
| [public/assets/manifest.json](public/assets/manifest.json) | 资源名称与文件路径的对应表 | 改图片名称或移动图片后同步修改路径 |
| [docs/reference/](docs/reference/) | 草图、布局参考、风格参考 | 可以手动整理，不会自动作为游戏图片显示 |
| [docs/starter-data/](docs/starter-data/) | 最初提供的剧情数据备份 | 留作对照，游戏不读取这里 |
| [docs/GAME_SPEC.md](docs/GAME_SPEC.md) | 当前采用的游戏规则与设计规格 | 规则变更先在这里核对 |
| [src/config/rules.ts](src/config/rules.ts) | 初始数值、Boss 门槛、开放设计选项 | 与 Codex 一起调整并测试 |
| [src/](src/) | 游戏流程、界面、样式 | 由 Codex 维护骨架 |
| [docs/AI_LOG.md](docs/AI_LOG.md) | AI 使用记录 | 用于课程提交的附录 |

根目录的 `GAME_SPEC.md` 和 `nmc5369-codex-starter.zip` 保留为原始交付文件。继续开发以 **`docs/GAME_SPEC.md`** 为准。

资源子文件夹：

```text
public/assets/
  manifest.json   资源路径表
  characters/     两种玩家棋子
  bosses/         四个 Boss
  npc/            情境 NPC 与表情
  cards/          卡背与结局图
  ui/             标题、边框等界面图片
  audio/          音效、音乐及授权说明
  fonts/          本地字体（需要离线展示时使用）
```

**你可以手动调整资源位置。** 最省事的方法是用相同文件名替换图片；如果更改名称、扩展名或子文件夹，再更新 `manifest.json` 的对应路径。`src`、`public`、`public/data` 属于程序的固定目录，不要只在文件管理器里直接重命名；需要重组时让 Codex 一起改引用并检查。

## 换一批内容的顺序

1. 把最终剧情导出为 UTF-8 CSV，替换 `public/data` 中对应文件；先保留一份组员原稿。
2. 把美术成品放入 `public/assets` 的对应子文件夹，核对资源路径表。
3. 双击 **[检查项目.cmd](检查项目.cmd)**，检查数据、游戏逻辑和发布构建。
4. 启动游戏，完整试玩受到改动影响的部分。数据有大改时，通过 Settings 重置旧测试进度再开始。

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

下一轮由团队确认：最终剧情和文献、初始数值与 Boss 门槛、结局条件、政策效果，以及已走格子的配色。当前六个结局按退出原因或是否推行正式招聘政策选择；**The System 最后一次选择如何对应不同结局，还需要团队定义**。当前可先沿用规格中的默认值继续制作。
