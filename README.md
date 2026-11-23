# GitHub Actions 自动部署学习项目

这是一个从零开始的最小 Web 应用，用于完整学习下面这条链路：

```text
修改代码 -> git push -> GitHub Actions 自动构建 -> 自动发布到 GitHub Pages
```

不需要 Jenkins，不需要自己的服务器，也不需要安装 GitHub CLI。

## 一、你将学到什么

- `.github/workflows/*.yml` 是什么；
- `push` 和 `workflow_dispatch` 两种触发方式；
- `actions/checkout`、`actions/setup-node` 等官方 Action 的用途；
- 如何安装依赖、构建并上传产物；
- 如何自动发布到 GitHub Pages；
- 如何从 Actions 日志定位失败原因；
- 修改代码并再次推送后，网站如何自动更新。

## 二、先在本地运行

在本目录打开 PowerShell：

```powershell
cd "C:\Users\Administrator\Documents\Codex\2026-11-23\psychologicalcounseling\outputs\GitHubActionsWebDemo"
npm ci
npm run dev
```

浏览器打开：

```text
http://127.0.0.1:4173
```

看到“自动部署已生效”页面，说明本地构建正常。

## 三、创建 GitHub 仓库

1. 登录 GitHub。
2. 点击右上角 `+`，选择 **New repository**。
3. 仓库名填：`github-actions-web-demo`。
4. 学习阶段建议选择 **Public**。
5. 不要勾选自动创建 README、`.gitignore` 或 License。
6. 点击 **Create repository**。

保留创建完成页面显示的仓库地址，例如：

```text
https://github.com/你的用户名/github-actions-web-demo.git
```

## 四、把本地项目推送到 GitHub

本项目已经是一个 Git 仓库并完成了第一次提交。只需添加远程地址并推送：

```powershell
cd "C:\Users\Administrator\Documents\Codex\2026-11-23\psychologicalcounseling\outputs\GitHubActionsWebDemo"
git remote add origin https://github.com/你的用户名/github-actions-web-demo.git
git push -u origin main
```

如果提示要求登录，按 Git 弹出的窗口在浏览器中登录 GitHub。

如果 `origin` 已存在，可改为：

```powershell
git remote set-url origin https://github.com/你的用户名/github-actions-web-demo.git
git push -u origin main
```

## 五、开启 GitHub Pages

推送成功后：

1. 打开仓库的 **Settings**。
2. 左侧点击 **Pages**。
3. 在 **Build and deployment** 下，把 **Source** 改为 **GitHub Actions**。
4. 不需要选择分支，保存即可。

然后在仓库顶部打开 **Actions**，点击左侧的：

```text
Deploy web app to GitHub Pages
```

第一次推送通常会自动运行；如果页面没有运行记录，点击 **Run workflow** 手动执行。

完整流程大约 1～3 分钟。成功后，部署步骤会显示网站地址，通常是：

```text
https://你的用户名.github.io/github-actions-web-demo/
```

## 六、验证自动部署

打开网站后，页面会显示：

- 部署提交的短哈希；
- 构建时间；
- Actions Run ID。

这些内容由构建脚本自动写入 `build-info.json`，能证明页面确实来自 GitHub Actions，而不是本地文件。

## 七、修改代码，观察再次部署

打开：

```text
src/index.html
```

例如把：

```html
<h1>自动部署已生效</h1>
```

改成：

```html
<h1>第二次自动部署成功</h1>
```

然后执行：

```powershell
git add .
git commit -m "test: update heading"
git push
```

回到 GitHub 的 **Actions** 页面，会看到新的运行记录。完成后刷新网站，标题会同步更新。

## 八、工作流逐段解释

文件位置：

```text
.github/workflows/deploy-pages.yml
```

### 触发条件

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:
```

- `push`：向 `main` 分支推送代码时自动运行；
- `workflow_dispatch`：允许在 GitHub 页面手动点击运行。

### 权限

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

Pages 部署需要这三个权限，不能省略。

### 并发控制

```yaml
concurrency:
  group: pages
  cancel-in-progress: false
```

避免两个部署同时修改线上网站。

### 使用 Node.js

```yaml
- uses: actions/setup-node@v7
  with:
    node-version: "24"
    cache: npm
```

这是 GitHub 提供的云端 Node.js 环境，不会使用你本机的 Node.js。

### 安装与构建

```yaml
- run: npm ci
- run: npm run build
```

- `npm ci`：严格按照 `package-lock.json` 安装依赖；
- `npm run build`：生成可部署的 `dist` 目录。

### 上传并发布

```yaml
- uses: actions/upload-pages-artifact@v5
  with:
    path: ./dist

- uses: actions/deploy-pages@v5
  id: deployment
```

先把 `dist` 上传为 Actions 产物，再交给 GitHub Pages 发布。

## 九、常见错误

### `Pages site not found`

进入 **Settings -> Pages**，把 Source 设置为 **GitHub Actions**，然后重新运行工作流。

### `Resource not accessible by integration`

检查工作流顶部的 `permissions` 是否完整，尤其是：

```yaml
pages: write
id-token: write
```

### `npm ci` 找不到 lockfile

确认仓库根目录存在 `package-lock.json`。本项目已经生成，不要删除。

### 私有仓库无法访问 Pages

学习阶段先使用 Public 仓库。私有仓库的 Pages 能力取决于 GitHub 账户套餐。

### Actions 没有自动运行

检查 YAML 是否位于仓库根目录下的：

```text
.github/workflows/deploy-pages.yml
```

并确认默认分支是 `main`。

## 十、这个方案适合什么应用

GitHub Pages 只托管**静态文件**，适合：

- HTML/CSS/JavaScript；
- Vue、React、Angular 构建后的 `dist`；
- 文档站、展示站、个人主页。

如果你的 Web 应用包含：

- Java/Node/Python 后端；
- 数据库；
- 文件上传；
- 登录鉴权服务端逻辑；
- Docker 容器；

那么 GitHub Pages 不够，需要把部署步骤改成 SSH、Docker、云平台或公司内网自托管 Runner。

## 十一、建议的学习顺序

1. 先完整跑通本项目；
2. 修改标题并观察自动重新部署；
3. 故意改坏一个 JavaScript 语法，查看失败日志；
4. 学会在 Actions 页面重新运行失败任务；
5. 再把同样的结构套用到你真正要部署的 Web 应用；
6. 最后学习 Secrets、Environment 审批和自托管 Runner。

完成这套流程后，你已经掌握了 GitHub Actions 的核心工作方式。