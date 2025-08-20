# 一页 - 高度可定制的仪表盘应用

![一页](https://img.shields.io/badge/Version-1.0.0-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue) ![SPA](https://img.shields.io/badge/SPA-Yes-success) ![Self-Hosted](https://img.shields.io/badge/Self--Hosted-Yes-important)

一页 是一个现代化的、高度可定制的仪表盘（Dashboard）单页面应用（SPA）。它允许您聚合关键信息、链接和工具，打造一个完全属于您个人的工作台或信息中枢。

## ✨ 核心特性

### 1. 灵活的仪表盘布局

- **拖放式界面**：所有组件均可自由拖动，轻松调整其在仪表盘上的位置。
- **弹性尺寸调整**：通过直观的拖拽手柄，自定义每个组件的大小，完美适配不同内容和显示需求。
- **响应式设计**：布局会自动适应不同尺寸的屏幕，从桌面显示器到移动设备都能保持良好的可用性。

### 2. 高度自定义与扩展

我们提供了多种方式来满足您的个性化需求：

- **CSS 样式定制**：为每个内置组件编写自定义 CSS，轻松修改颜色、字体、边框、背景等，使其完美融入您的主题风格。
- **自定义文本块**：通过简单的文本格子（Text Grid）组件，快速添加纯文本或div块内容，并为其应用自定义样式。
- **网页组件（HTML）嵌入**：对于高级用户，可以直接编写 HTML 代码片段来创建全新的组件，集成第三方小部件或实现复杂功能。

### 3. 便捷的配置管理

- **配置导出**：将您精心配置的整个仪表盘布局和设置导出为一个单一的 JSON 文件，方便备份。
- **配置导入**：一键导入之前导出的配置文件，快速恢复工作环境或在多个实例间同步配置。

### 4. 多样化的部署方式

- **自托管**：您可以将其部署在自己的私有服务器（如 VPS、NAS、内网服务器）上，完全掌控您的数据和访问权限。Docker 支持让部署变得异常简单。
- **GitHub Pages / 静态托管**：作为一个纯静态的单页面应用（SPA），您可以直接将其部署到 GitHub Pages、Netlify、Vercel
  或其他任何静态网站托管服务，零成本快速上线。

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

## 🛠️ 技术栈

- **前端框架**: Vue 3
- **构建工具**: Vite
- **布局库**: Gridstack.js
- **样式**: CSS3

## 📜 许可证

本项目采用 [MIT](https://opensource.org/licenses/MIT) 许可证。请查看 `LICENSE` 文件了解更多详情。

## 🤝 贡献

我们欢迎任何形式的贡献！

1. Fork 本项目
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## ⚠️ 注意事项

- 当使用 HTML 组件功能时，请仅嵌入您信任的代码，因为恶意脚本可能会带来安全风险。
- 导出的配置文件包含您的所有布局和设置，但不包含任何敏感数据（如 API 密钥）。API 密钥通常由浏览器本地存储，不会被导出。
- 部署在 GitHub Pages 上时，由于是纯前端应用，所有配置和数据都存储在您的浏览器本地（LocalStorage/IndexedDB），清空浏览器数据会导致配置丢失，请记得定期导出备份。

---

**享受打造您专属仪表盘的乐趣吧！**