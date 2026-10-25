# 试玩网站发布说明

## 当前状态

本地游戏与 GitHub Pages 自动发布配置已准备。计划使用仓库名 `same-rules-demo`。远程仓库和试玩网址要在 GitHub 账号授权后建立；在这里记录真实链接前，不要把预期网址当作已经上线的网址。

本项目只发布 `Game Demo` 文件夹里的游戏文件。原始压缩包、已安装组件、临时检查文件和本地构建结果不进入 Git 仓库。课程其他作业、共享排期表也不在这个仓库范围内。

## 第一次上线

由 Codex 协助完成：

1. 使用已授权的 GitHub 账号建立 `same-rules-demo` 仓库，并上传 `main` 分支。GitHub Free 的 Pages 需要公开仓库；仓库中的源码、剧情文件和图片也会公开可见。
2. 在仓库的 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
3. 在 **Actions** 打开 **Publish game to GitHub Pages**。它会先检查剧情数据、运行游戏测试，再构建并发布。首次开启 Pages 后，可点击 **Run workflow** 手动启动。
4. 等待发布成功，以 **Settings → Pages** 显示的真实网址为准，再用该网址检查首页、开始游戏、卡牌选项、刷新续玩与手机显示。
5. 把验证过的试玩网址发给组员。只试玩的人无需 GitHub 账号，无需安装 Node.js 或 Git。

## 以后更新剧情或美术

1. 在 `public/data/` 更新剧情，在 `public/assets/` 添加图片；更改图片路径时同步更新 `manifest.json`。
2. 双击根目录的 **检查项目.cmd**，然后双击 **启动游戏.cmd** 试玩受影响的部分。
3. 让 Codex 把确认后的改动提交并上传 GitHub。`main` 分支每次更新都会自动检查并重新发布，试玩网址保持不变。

改动只保存在电脑上时，线上版本不会变化。如果自动检查失败，查看 Actions 的错误信息并修正；上一次成功发布的网页会继续可用。

## 试玩记录

游戏进度保存在每个人当前浏览器里，不会共享给其他组员或跨设备同步。剧情结构发生大改后，可从标题页 **Settings → Reset all progress** 清除自己的旧测试进度。普通演示使用不带 `?debug=1` 的网址。

## 官方参考

- [GitHub Pages 适用账号与公开仓库要求](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [用 GitHub Actions 发布 Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
