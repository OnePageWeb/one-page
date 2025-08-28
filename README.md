# 一页 - 高度可定制的仪表盘应用

![一页](https://img.shields.io/badge/Version-1.0.0-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue) ![SPA](https://img.shields.io/badge/SPA-Yes-success) ![Self-Hosted](https://img.shields.io/badge/Self--Hosted-Yes-important)

一页 是一个现代化的、高度可定制的仪表盘（Dashboard）单页面应用（SPA）。它允许您聚合关键信息、链接和工具，打造一个完全属于您个人的工作台或信息中枢。

## ✨ 核心特性

### 🎯 1. 完全自定义的仪表盘布局

本项目采用了仪表盘式布局设计，为您提供极致的布局自由度：

- **🖱️ 自由拖放定位**：每个组件都可以通过简单的拖放操作放置在页面的任意位置
- **📏 灵活尺寸调整**：所有组件支持动态调整大小，满足不同内容的展示需求
- **🔲 网格对齐系统**：内置智能网格系统，在保持灵活性的同时确保布局整齐美观
- **👀 实时预览**：所有布局调整即时可见，无需刷新页面即可查看最终效果

### 🧩 2. 模块化组件设计

通过组件化架构实现高度可定制的导航体验：

- **📦 丰富组件库**：内置多种实用组件（链接卡片、搜索框、网页格子、时钟、笔记等）
- **🎨 组件自定义**：每个组件支持独立配置，包括标题、链接、图标、背景等属性
- **🔗 轻松组合**：通过简单拖放组合不同组件，构建功能丰富的个性化导航页面
- **🔄 状态管理**：每个组件拥有独立的状态管理，确保交互流畅自然

### 🎨 3. 深度样式自定义

同时支持全局样式和组件级样式的精细控制：

- **🌍 全局样式系统**：通过CSS变量定义全局主题颜色、字体、间距等设计元素
- **🎯 组件独立样式**：每个组件支持单独设置CSS样式，不影响其他组件
- **📤 样式导出/导入**：可以导出样式配置与他人分享，或导入他人设计的精美样式

### 🌐 4. 单页面静态设计

采用现代前端技术构建的单页面应用：

- **📄 纯静态架构**：无需服务器支持，仅需浏览器即可运行
- **🐙 Github Pages友好**：完美适配Github Pages等静态网站托管服务

### ⚡ 5. 一键快速部署

简化部署流程，让每个人都能轻松拥有个性化导航页：

- **🔱 Fork即用**：只需Fork项目到自己的GitHub账户，无需复杂配置
- **🚀 自动部署**：开启GitHub Pages后自动构建并部署到互联网
- **🌐 自定义域名**：支持绑定自己的域名，打造专属导航门户
- **🔄 多版本管理**：通过Git进行版本控制，方便回溯和管理不同版本的配置
- **💾 自动备份**：所有配置自动保存到浏览器本地存储，防止意外丢失

### 📤 6. 便捷的配置分享

轻松分享您的精心配置，与他人共享导航体验：

- **💾 完整配置导出**：一键导出所有布局、组件和样式的完整配置
- **📥 快速导入**：通过上传配置文件或输入分享链接即可复现他人导航页
- **🔍 一条链接完成分享**：在链接中加入配置方案与样式设定，直接访问即可轻松载入

### 🗂️ 7. 多工作区支持

引入多工作区概念，满足多样化场景需求：

- **🏢 独立工作区**：创建多个完全独立的工作区，每个拥有自己的布局、组件和样式
- **🎭 场景化设计**：为不同用途创建专属工作区（如工作、学习、娱乐、项目等）
- **🔄 快速切换**：一键切换不同工作区，适应不同使用场景

## 🚀 快速开始

### 直接访问已部署的 GitHub Pages

1. 访问[one](https://verlif.github.io/one)即可直接使用。

### Fork已部署的 GitHub Pages (最简单)

1. 找到仓库地址[one](https://github.com/Verlif/one)
2. 点击`Fork`按钮，将仓库复制到您的 GitHub 账号下。
3. 进入您的仓库设置，将`gh-pages`分支设为默认分支。
4. 进入您的仓库设置，使用`gh-pages`分支作为page分支即可。

### 本地打包部署

1. Fork 或下载本项目代码。
2. 运行`npm install & npm run build`
3. 打包完成后，在项目根目录下会生成一个`dist`文件夹，将其上传到您的服务器即可。

## 📖 使用指南

### 添加和自定义组件

- 从页面**左边缘竖向滑动**开启操作栏
- 在操作栏中找到`添加格子`按钮，点击后选中需要的组件进行添加
- 点击操作栏中的`开启移动`来调整每个组件的位置和大小
- 点击操作栏中的`开启编辑`来对每个组件进行单独设置

### 导入/导出配置

- 从页面**左边缘竖向滑动**开启操作栏
- 在操作栏中`加载配置`，这里会出现配置弹窗，其中可粘贴配置或将配置文件拖拽到弹窗中进行加载操作

### 编写自定义 CSS

- 在操作栏中启用`开启编辑`
- 点击组件右上角的`样式图标`，在弹出的样式编辑窗口进行css样式编辑。

```css
.my-widget {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    border: 2px solid #ff6b6b;
}

.my-widget h2 {
    color: #ffe66d;
    font-family: 'Comic Sans MS', cursive;
}
```

### 创建 HTML 组件

选择添加“HTML 组件”，在编辑框中输入您的 HTML 代码。您可以嵌入 `<script>` 和 `<style>` 标签。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>实时时钟</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: Arial, sans-serif;
    }

    #clock {
      font-size: 5rem;
      color: #333;
      padding: 24px;
      border-radius: 24px;
      background-color: aliceblue;
    }
  </style>
</head>
<body>
<div id="clock"></div>

<script>
  function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    document.getElementById('clock').textContent =
            `${hours}:${minutes}:${seconds}`;
  }

  // 初始更新时间
  updateTime();

  // 每秒更新一次
  setInterval(updateTime, 1000);
</script>
</body>
</html>
```

### 高级技巧

跳转到 [高级技巧](./docs/Advanced.md)

## 🛠️ 技术栈

- **前端框架**: Vue 3
- **构建工具**: Vite
- **布局库**: Gridstack.js
- **样式库**: Element Plus

## 📜 许可证

本项目采用 [MIT](https://opensource.org/licenses/MIT) 许可证。请查看 `LICENSE` 文件了解更多详情。

## 🤝 贡献

我们欢迎任何形式的贡献！

## ⚠️ 注意事项

- 当使用 HTML 组件功能时，请仅嵌入您信任的代码，因为恶意脚本可能会带来安全风险。
- 导出的配置文件包含您的所有布局和设置，但不包含任何敏感数据（如 API 密钥）。API 密钥通常由浏览器本地存储，不会被导出。
- 部署在 GitHub Pages 上时，由于是纯前端应用，所有配置和数据都存储在您的浏览器本地（LocalStorage/IndexedDB），清空浏览器数据会导致配置丢失，请记得定期导出备份。

---

**享受打造您专属仪表盘的乐趣吧！**