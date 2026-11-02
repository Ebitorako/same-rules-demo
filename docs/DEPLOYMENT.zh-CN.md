# 试玩网站发布说明

## 当前状态

排期 T04 的首次上线已于 2026-10-25 完成：

- **试玩网址：[Genderpoly](https://ebitorako.github.io/same-rules-demo/)**
- **公开仓库：[Ebitorako / same-rules-demo](https://github.com/Ebitorako/same-rules-demo)**
- **[首次发布记录](https://github.com/Ebitorako/same-rules-demo/actions/runs/40188632600)：成功**

仓库使用 `main` 分支，由 GitHub Actions 自动检查并发布到 GitHub Pages。公开仓库中的源码、剧情文件和图片均可查看。当前本地已使用组员正式剧情和六项能力；最新版本及实际发布结果以根目录 README 和 AI_LOG 为准。

本项目只发布 `Game Demo` 文件夹里的游戏文件。原始压缩包、已安装组件、临时检查文件和本地构建结果不进入 Git 仓库。课程其他作业、共享排期表也不在这个仓库范围内。

## 组员怎么试玩

1. 打开上面的试玩网址，无需 GitHub 账号，无需安装 Node.js 或 Git。
2. 点击 **Start a career**，选择 **Female pawn** 或 **Male pawn**，再点击 **Enter the studio**。
3. 棋盘上点击 **Next** 前进，选择卡牌选项，结果页点击 **Continue**。也可以用键盘 `1`–`4`、`D` 选择，`Enter` 继续。声音在 Settings 的 Sound 中开启。

## 首次上线的检查结果

本地数据校验、35 项自动测试、生产构建，以及 GitHub 上的自动检查和发布全部成功。已在真实线上网址完成以下浏览器检查：

- 首页、角色选择和 22 格棋盘能正常打开；首张卡显示 3 个可选项。
- 选择后显示结果，刷新仍停留在同一结果；点击 **Continue** 后进度为 `01 / 20 CARDS`，可进入下一张卡。
- 390 × 844 手机竖屏尺寸下，棋盘和卡牌显示正常，选项可用。
- 实际按数字 `3` 和 `Enter` 可完成选择与继续；检查过程中浏览器控制台没有警告或错误。

完整两轮职业流程已由逻辑集成测试覆盖。此次浏览器验收没有完成全部 20 张卡通关，也未在实体手机上试玩，这两项仍需团队验收。

## 以后更新剧情或美术

1. 在 `public/data/` 更新剧情，在 `public/assets/` 添加图片；更改图片路径时同步更新 `manifest.json`。
2. 双击根目录的 **检查项目.cmd**，然后双击 **启动游戏.cmd** 试玩受影响的部分。
3. 让 Codex 把确认后的改动提交并上传 GitHub。`main` 分支每次更新都会自动检查并重新发布，试玩网址保持不变。
4. 在仓库 **Actions → Publish game to GitHub Pages** 确认最新发布成功，再刷新试玩网址检查改动。组员继续使用原来的链接即可。

改动只保存在电脑上时，线上版本不会变化。如果自动检查失败，查看 Actions 的错误信息并修正；上一次成功发布的网页会继续可用。

## 试玩记录

游戏进度保存在每个人当前浏览器里，不会共享给其他组员或跨设备同步。剧情结构发生大改后，可从标题页 **Settings → Reset all progress** 清除自己的旧测试进度。普通演示使用不带 `?debug=1` 的网址。

## 官方参考

- [GitHub Pages 适用账号与公开仓库要求](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [用 GitHub Actions 发布 Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
