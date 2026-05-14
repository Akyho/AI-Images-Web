# AI Images Web

纯浏览器端运行的 AI 图片生成与编辑工具，支持 OpenAI 兼容 API。所有数据存储在本地 IndexedDB，不上传任何数据到云服务器。

## 一键部署

本项目为纯静态前端应用，构建后可直接部署在任何静态托管平台。

[Demo](https://ai-images-web.pages.dev/)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Akyho/AI-Images-Web)
[![Deploy with EdgeOne](https://img.shields.io/badge/Deploy-EdgeOne-0066FF?logo=tencentqq&style=for-the-badge)](https://console.cloud.tencent.com/edgeone)
[![Deploy with Cloudflare](https://img.shields.io/badge/Deploy-Cloudflare-F38020?logo=cloudflare&style=for-the-badge)](https://deploy.workers.cloudflare.com/?url=https://github.com/Akyho/AI-Images-Web)

## 功能特性

- **图片生成** — 文本提示词驱动，支持批量生成、并发控制、实时进度、取消生成
- **图片编辑** — 上传参考图片 + 文本描述，拖拽上传，批量生成，取消编辑
- **提示词模板** — 内置 20+ 个分类模板，按类别筛选，一键填入
- **图片对比** — 选中 2~9 张图进入对比，鼠标滚轮缩放 (10%~500%)、拖拽平移、所有图片同步
- **画廊管理** — 列数可调 (2~9)、全选/反选、批量下载 (ZIP)、批量删除、清空
- **大图预览** — 全屏预览，一键下载
- **自定义尺寸** — 预设 + 自定义宽高，支持保存/删除惯用尺寸（按面积自动排序）
- **导出提示词** — 选中图片后一键导出提示词文本文件（含模型 ID、时间、尺寸、类型）
- **模型 ID 记录** — 每张生成/编辑的图片自动记录所使用的模型 ID
- **智能错误提示** — HTTP 状态码中文映射 + 错误码（insufficient_quota、rate_limit 等）中文解读
- **完全离线** — 生成结果缓存在 IndexedDB，关闭页面不丢失
- **深色主题** — 全界面暗色风格

## 技术栈

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand (状态管理)
- IndexedDB (本地持久化)
- JSZip (批量打包下载)
- Lucide React (图标)

## 快速开始

```bash
npm install
npm run dev      # 开发模式
npm run build    # 生产构建
npm run preview  # 预览构建结果
npm run check    # TypeScript 类型检查
```

## 使用指南

### 1. 配置

点击右上角齿轮图标打开配置面板：

| 配置项 | 说明 |
|--------|------|
| API 端点 | API 服务商地址（留空默认为相对路径） |
| 模型 ID | 使用的模型名称（如 `gpt-image-2`） |
| API Key | API 密钥（必填） |
| 最大保存数 | IndexedDB 中最多保留的图片数 |
| 自定义端点 | 可单独设置生成/编辑的完整 URL（覆盖默认路径） |

配置自动保存至 localStorage，刷新不丢失。

> **注意**：生产环境需通过 nginx 等反向代理解决 CORS 跨域问题，或将前端与 API 部署在同域下。

### 2. 图片生成

1. 在「图片生成」标签输入提示词
2. 使用提示词模板快速创建专业 prompt（模板中 `{变量}` 替换为你的内容）
3. 选择输出尺寸
4. 设置生成数量、单次请求返回数和并发数
5. 点击「生成」或按 `Ctrl + Enter`
6. 可随时点击「取消」中断生成

### 3. 图片编辑

1. 切换到「图片编辑」标签
2. 上传或拖拽一张图片
3. 输入编辑提示词描述修改内容
4. 选择输出尺寸和生成数量
5. 点击「编辑」

### 4. 图片画廊

- **单选/多选** — 点击图片勾选，支持全选、反选
- **列数调整** — 点击「N列」下拉切换 2~9 列
- **操作按钮** — 鼠标悬停显示放大、下载、删除三个按钮
- **批量下载** — 选中多张后打包为 ZIP 下载
- **批量删除** — 选中后二次确认删除
- **导出提示词** — 选中图片后点击「导出提示词」按钮，生成 `.txt` 文件（包含模型 ID、生成时间、尺寸等信息）

### 5. 图片对比

1. 在画廊中勾选 2~9 张图片
2. 点击右上角紫色「对比」按钮进入对比视图
3. 鼠标滚轮缩放 (10% ~ 500%)
4. 拖拽平移图片
5. 所有图片同步缩放和移动，方便细致对比

### 6. 大图预览

点击图片或「放大」按钮进入全屏预览，支持下载。

## API 兼容性

OpenAI 兼容格式：

- 生成：`{baseUrl}/v1/images/generations`
- 编辑：`{baseUrl}/v1/images/edits`

支持返回 `url` 或 `b64_json` 格式。可在配置中设置自定义端点覆盖默认路径。

### 错误码说明

常见 API 错误中文提示：

| 错误码 | 提示内容 |
|--------|----------|
| 401 | API Key 无效或未授权 |
| 403 | 无权限访问，请检查 API Key 或账户额度 |
| 503 | 服务暂不可用，请稍后重试 |
| 554 | 上游服务超时，请稍后重试或更换站点 |
| insufficient_user_quota | 账户额度已用完，请充值或更换 API Key |
| rate_limit_exceeded | 请求频率过高，请稍后重试 |

## 隐私说明

- 配置存储在浏览器 localStorage
- 生成的图片缓存在 IndexedDB
- 无任何数据上传至本项目服务器
- 清除浏览器数据后所有信息将丢失

## 浏览器支持

Chrome / Edge / Firefox / Safari 最新版本，需支持 ES2020+ 和 Fetch API。

## License

MIT
