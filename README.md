# Any WebManifest

一个Chrome浏览器插件，可以根据URL配置动态为网页注入WebManifest链接。

## 功能特性

- 🎯 **URL正则匹配**: 根据自定义的正则表达式匹配特定网站
- 📱 **动态注入**: 自动将WebManifest以base64格式注入到页面header中
- ⚙️ **可视化配置**: 提供友好的配置界面管理多个配置项
- 💾 **配置管理**: 支持配置的导入导出功能
- 🔄 **实时生效**: 配置保存后立即在匹配的页面生效
- 📊 **状态显示**: 弹出窗口显示当前页面的匹配状态

## 安装方法

1. 下载或克隆这个项目到本地
2. 打开Chrome浏览器，进入扩展程序管理页面 (`chrome://extensions/`)
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目文件夹

## 使用说明

### 1. 配置管理

1. 右键点击插件图标，选择"选项"，或者在扩展程序管理页面点击"选项"
2. 在配置页面中，点击"添加新配置"
3. 填写以下信息：
   - **URL正则表达式**: 用于匹配目标网站的正则表达式
   - **Manifest JSON内容**: 符合WebManifest规范的JSON内容

### 2. URL正则表达式示例

```javascript
// 匹配GitHub网站
.*\.github\.com.*

// 匹配Google首页
^https://www\.google\.com/$

// 匹配本地开发服务器
.*localhost:3000.*

// 匹配所有HTTPS网站
^https://.*
```

### 3. Manifest JSON示例

```json
{
  "name": "我的应用",
  "short_name": "MyApp",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 4. 状态检查

点击插件图标可以查看：
- 当前页面URL
- 配置数量
- 是否有匹配的配置
- WebManifest注入状态

## 工作原理

1. **内容脚本监听**: `content.js`在所有页面上运行，检查当前URL
2. **配置匹配**: 从Chrome存储中读取配置，使用正则表达式匹配当前URL
3. **动态注入**: 如果匹配成功，将对应的manifest JSON转换为base64格式并注入到页面`<head>`中
4. **链接格式**: `<link rel="manifest" href="data:application/json;base64,{base64_data}">`

## 文件结构

```
any-webmanifest/
├── manifest.json          # 插件清单文件
├── content.js             # 内容脚本 - 负责URL检测和注入
├── options.html           # 配置页面HTML
├── options.js             # 配置页面逻辑
├── popup.html             # 弹出窗口HTML
├── popup.js               # 弹出窗口逻辑
├── icons/                 # 插件图标
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md              # 说明文档
```

## 技术特点

- **纯JavaScript实现**: 不依赖任何外部库
- **Manifest V3**: 使用最新的Chrome扩展规范
- **响应式UI**: 配置界面适配不同屏幕尺寸
- **错误处理**: 完善的错误处理和用户提示
- **数据同步**: 使用Chrome Storage API同步配置

## 使用场景

1. **PWA开发测试**: 为测试网站临时添加WebManifest
2. **第三方网站增强**: 为不支持PWA的网站添加manifest
3. **本地开发**: 为开发环境快速配置PWA特性
4. **网站定制**: 为常用网站自定义PWA体验

## 注意事项

- 只支持HTTP/HTTPS协议的网页
- 正则表达式需要符合JavaScript正则语法
- Manifest JSON必须符合标准格式
- 插件注入的manifest会覆盖页面原有的manifest（如果存在）
- 配置修改后需要刷新页面才能生效

## 开发者说明

如需修改或扩展功能，主要文件说明：

- `content.js`: 修改URL检测逻辑或注入方式
- `options.js`: 修改配置界面功能
- `popup.js`: 修改弹出窗口功能
- `manifest.json`: 修改插件权限或配置

## 许可证

MIT License
