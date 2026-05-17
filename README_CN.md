# React 技术评估

**目标级别：** 高级（Senior）  
**范围：** 客户端 UI 与 API 集成

---

## 项目启动

**前置条件：** Node.js 18+

1. **安装依赖**

   ```bash
   npm install
   ```

2. **运行项目**

   ```bash
   npm start
   ```

   此命令会同时启动后端（端口 3099）和 React 开发服务器。前端通过 `package.json` 中的 `proxy` 配置代理到后端。

   **快速验证：** `GET http://localhost:3099/` 返回正常即可。评估接口：`GET http://localhost:3099/api/realfraction/properties`（或通过代理访问 `/api/realfraction/properties`）。

---

## 任务：在"我的房产"页面实现数据表格

**目标：** 调用一个返回模拟数据的 REST API，并在 **"我的房产"** 页面以**响应式表格**和**流畅 UI** 的形式展示数据，需包含加载状态和错误状态的处理。

**范围：** 本任务仅涉及：

- **现有 API** — `GET /api/realfraction/properties`（返回房产列表）。
- **我的房产页面** — 使用导航栏中已有的"My Properties"标签（路由 `/my-properties`）。候选人需在此页面调用接口并以表格展示数据。其他路由（Marketplace、Rentals 等）**不在本次评估范围内**。

**需求：**

- **API 集成**
  - 从前端调用 **`GET /api/realfraction/properties`**（如：页面挂载时或点击按钮时触发）。
  - 解析 JSON 响应，将 **`properties`** 数组作为表格数据源。
  - 处理**加载状态**：请求进行中显示加载指示器。
  - 处理**错误状态**：网络失败或非 2xx 响应时，展示用户友好的错误提示；UI 不得崩溃或出现空白页。

- **表格 UI（"我的房产"页面）**
  - 在"我的房产"页面，将 API 数据以**表格**形式渲染（每行一条房产，列包含主要字段：如 tokenId、title、propertyType、ownerAddress、status）。
  - 表格须**易于阅读**：清晰的表头、对齐的内容、足够的对比度。
  - 在合适的地方使用**语义化 HTML**（如 `<table>`、`<thead>`、`<tbody>`、`<th>`、`<td>`）。

- **响应式布局**
  - 布局须**响应式**：在**手机、平板、桌面**上均可正常使用。
  - 小屏幕下，表格可水平滚动，也可切换为卡片/列表布局，只要数据完整展示且 UI 清晰即可。

- **流畅 UI / UX**
  - 在适当位置使用**平滑过渡动效**（如加载→内容，或数据出现时的淡入效果）。
  - 避免**布局抖动**：预留空间或使用骨架屏/占位符，让从加载到数据展示的过渡感觉流畅。
  - 加载和错误状态须**明显可见**（不得出现闪烁或模糊状态）。

- **评估标准：**
  - 正确调用 properties 接口，并将响应数据填充到"我的房产"页面的表格中（导航标签"My Properties"）。
  - 请求进行中，加载状态可见。
  - 请求失败时（如后端宕机或非 2xx 响应），展示错误状态。
  - 表格展示 API 响应中的所有相关字段，数据准确。
  - 布局在各种视口尺寸下响应式表现良好。
  - 无不必要的布局抖动，过渡动效流畅。
  - 其他路由/标签（Marketplace、Rentals 等）不受影响。

**建议的测试：**

- 在"我的房产"页面，模拟 `GET /api/realfraction/properties`，断言表格能渲染返回的数据，并依次展示加载→内容（或模拟失败时展示错误）。
- 断言加载和错误状态可见，且在数据返回之前表格不渲染（或为空）。
- 可选：测试响应式行为（如不同宽度下的表格或卡片布局），以及其他导航标签未被破坏。

---

## 项目概览（测试环境参考）

### 技术栈

- **运行时：** Node.js 18+
- **前端：** React（Create React App）、React Router、Bootstrap 5
- **API 客户端：** `fetch`（或等价方案）；前端代理到后端
- **后端：** Express.js，端口 3099（详见 server 文档）

**`GET /api/realfraction/properties` 成功响应结构（200）：**

```json
{
  "success": true,
  "properties": [
    { "tokenId": 1, "title": "Sunset Villa", "propertyType": "House", "ownerAddress": "0x...", "status": "listed" },
    ...
  ]
}
```

候选人使用响应中的 **`properties`** 数组，在"我的房产"页面（导航标签）填充表格。列的选择（如 tokenId、title、propertyType、ownerAddress、status）由候选人自行决定，只要数据准确展示即可。
