# JobTrack

一个用于管理求职岗位、投递记录、面试进度、Offer 和联系人的纯前端 Web 应用。

> 当前状态：核心求职管理功能已经完成，处于项目整理、文档补充和面试展示准备阶段。项目尚未部署在线版本。

## 项目简介

JobTrack 面向个人求职过程，主要解决以下问题：

- 岗位信息分散，无法统一整理。
- 投递、面试和 Offer 进度难以集中查看。
- 招聘联系人信息缺少统一记录位置。
- 难以快速了解最近一段时间发生了哪些求职活动。

应用以岗位为中心，串联岗位信息、投递记录、面试记录、Offer、联系人和求职进度。当前不包含后端 API、云同步和用户系统，数据保存在浏览器 LocalStorage 中。

## 项目定位

这是一个以前端实习实践和真实产品体验为目标开发的个人求职管理项目，重点实践：

- Vue 3 Composition API 与组件化页面开发。
- TypeScript 数据模型和类型约束。
- Pinia 单一数据源状态管理。
- Vue Router 页面路由和详情页参数。
- 表单校验、Modal 生命周期和交互反馈。
- `computed` 派生统计与数据可视化。
- LocalStorage 持久化。
- Desktop、Tablet 和常见移动端宽度的响应式适配。
- ESLint 代码检查。

## 技术栈

| 技术 | 用途 |
| --- | --- |
| Vue 3 | Composition API、页面与组件 |
| TypeScript | 类型约束、数据模型与校验类型 |
| Vite | 开发服务器、生产构建与预览 |
| Vue Router | 页面路由、详情页参数路由 |
| Pinia | 岗位及关联记录的统一状态管理 |
| Tailwind CSS 4 | 样式、设计令牌和响应式布局 |
| LocalStorage | 浏览器端数据持久化 |
| ESLint | Vue、TypeScript 和基础 JavaScript 代码检查 |

项目没有使用 UI 组件库、图表库、日期库或数据请求库。

## 核心功能

### 岗位管理

- 岗位列表展示公司、职位、地点、薪资、状态、投递日期和招聘来源。
- 支持按公司名称或职位名称搜索。
- 支持按招聘状态筛选。
- 支持按最近更新和最早更新排序。
- 通过当前页面的 Modal 新增岗位。
- 通过当前页面的 Modal 编辑岗位。
- 支持删除岗位，删除前使用原生确认。
- 支持在岗位列表直接修改招聘状态。
- 岗位表单包含基础校验，并防止快速重复提交。
- 首次访问使用 14 条 Mock 数据，后续岗位数据通过 LocalStorage 持久化。

### 岗位详情

岗位详情页根据 `/jobs/:id` 读取当前岗位，并展示：

- 岗位名称、公司名称和当前状态。
- 工作地点、薪资、投递日期和招聘来源。
- 创建时间和更新时间。
- 职位描述和任职要求。
- 投递记录。
- 面试记录。
- Offer 信息。
- 招聘联系人。

岗位详情页支持返回岗位列表和通过 Modal 编辑当前岗位。

### 投递记录

- 查看当前岗位的投递记录。
- 新增投递记录。
- 编辑已有投递记录。
- 记录投递日期、招聘来源和备注。
- 按投递日期倒序展示。
- 当前不支持删除投递记录。

### 面试记录

- 查看当前岗位的面试记录。
- 新增面试记录。
- 编辑已有面试记录。
- 记录面试时间、轮次、方式、结果和备注。
- 按面试时间倒序展示。
- 当前不支持删除面试记录。

### Offer 信息

- 查看当前岗位的 Offer 信息。
- 新增和编辑 Offer。
- 记录是否收到 Offer、Offer 日期、职位、薪资、入职日期和备注。
- 当前每个岗位只保存一个 Offer。
- 当前不支持 Offer 删除和多 Offer 管理。

### 联系人

- 查看当前岗位的联系人。
- 新增和编辑联系人。
- 记录姓名、职位、邮箱、电话、LinkedIn 和备注。
- 当前不支持联系人删除和去重。

### Dashboard / 概览

Dashboard 展示：

- 岗位总数。
- 待投递数量。
- 已投递数量。
- 面试中数量。
- Offer 数量。
- 已结束数量。
- 招聘状态分布。

Dashboard 不保存独立统计副本，所有数字均从 Job Store 派生。

### 求职进度

`/progress` 包含：

- 求职进度漏斗。
- 最近 7 天投递和面试总数。
- 最近 7 天每日活动趋势。
- 最近 5 条投递 / 面试动态。
- 动态点击跳转到对应岗位详情。

求职进度数据同样来自 Job Store 的 `computed` 派生结果。

## 页面路由

| 路由 | 页面 | 说明 |
| --- | --- | --- |
| `/` | 入口 | 重定向到 `/dashboard` |
| `/dashboard` | 概览 | 岗位核心统计和招聘状态分布 |
| `/jobs` | 我的岗位 | 列表、搜索、筛选、排序、新增、编辑、删除和状态快捷修改 |
| `/progress` | 求职进度 | 求职漏斗、近期数据、7 天趋势和最近动态 |
| `/jobs/new` | 添加岗位兼容页 | 保留直接访问能力；正常入口使用 Modal |
| `/jobs/:id` | 岗位详情 | 岗位信息及关联记录 |
| `/jobs/:id/edit` | 编辑岗位兼容页 | 保留直接访问能力；正常入口使用 Modal |

当前没有 404 页面。

## 项目结构

```text
JobTrack/
├─ src/
│  ├─ assets/
│  │  └─ main.css                    # Tailwind 入口、设计令牌和基础交互样式
│  ├─ components/
│  │  ├─ common/
│  │  │  └─ EmptyState.vue           # 通用空状态展示
│  │  ├─ job/
│  │  │  ├─ ContactSection.vue       # 联系人展示与表单
│  │  │  ├─ JobForm.vue              # 新增 / 编辑岗位共用表单
│  │  │  ├─ JobFormModal.vue         # 岗位表单 Modal
│  │  │  ├─ JobFunnelSection.vue     # 求职漏斗展示
│  │  │  └─ OfferInfoSection.vue     # Offer 展示与表单
│  │  └─ layout/
│  │     ├─ AppHeader.vue
│  │     ├─ AppLayout.vue
│  │     └─ AppSidebar.vue
│  ├─ layouts/
│  │  └─ DefaultLayout.vue
│  ├─ mock/
│  │  └─ jobs.ts                     # 14 条初始 Mock 岗位
│  ├─ router/
│  │  └─ index.ts                    # 路由配置
│  ├─ stores/
│  │  └─ job.ts                      # Pinia Job Store
│  ├─ types/
│  │  └─ job.ts                      # Job 相关类型定义
│  ├─ utils/
│  │  └─ job.ts                      # 状态、来源、日期和薪资格式化
│  ├─ views/
│  │  ├─ DashboardView.vue
│  │  ├─ JobsView.vue
│  │  ├─ JobCreateView.vue
│  │  ├─ JobDetailView.vue
│  │  ├─ JobEditView.vue
│  │  └─ ProgressView.vue
│  ├─ App.vue
│  └─ main.ts
├─ eslint.config.js
├─ AGENTS.md
├─ PROJECT_STATUS.md
├─ package.json
├─ package-lock.json
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts
```

## 核心数据流

```text
LocalStorage
     ↓
Pinia Job Store
     ↓
Views / Components
     ↓
用户操作
     ↓
Job Store 更新
     ↓
LocalStorage 持久化
```

具体说明：

- `useJobStore` 是岗位数据的单一数据源。
- 页面通过 Store 获取和修改岗位数据。
- 页面不直接读取 `src/mock/jobs.ts` 作为业务数据。
- 页面不直接操作 LocalStorage。
- Dashboard 和 Progress 使用 `computed` 从 `jobs` 派生统计和活动数据。
- 投递、面试、Offer 和联系人保存在对应 Job 内，不单独建立 Store。

## 状态管理

`src/stores/job.ts` 提供：

- `jobs`：岗位数组。
- `getJobById(id)`：按 ID 查询岗位。
- `addJob(job)`：新增岗位。
- `updateJob(job)`：更新岗位及关联记录。
- `deleteJob(id)`：删除岗位。

页面通过 Store 完成业务修改，不直接修改 Store 内部数组，也不维护第二份业务数据。

## LocalStorage 持久化

Storage Key：

```text
jobtrack:jobs
```

初始化流程：

```text
读取 LocalStorage
→ 如果存在有效数组，作为当前 jobs
→ 如果不存在或解析失败，使用 Mock 数据
→ Pinia Store 初始化
→ jobs 发生深层变化
→ watch 自动写回 LocalStorage
```

当前只做数组级 JSON 读取，没有逐字段 schema 校验和版本迁移。LocalStorage 不可用时，Store 仍保持内存状态可用。

## UI / UX

项目采用统一的轻量 SaaS 视觉方向：

- Warm Gray 页面背景。
- 白色 / 浅色内容卡片。
- 低饱和 Sage Green 品牌色。
- 约 18px 卡片圆角。
- 轻边框和轻阴影。
- 低饱和状态颜色。
- 克制的 hover、focus、active 和 disabled 反馈。
- 统一的空状态、表单错误和 Modal 交互。
- 不使用渐变、玻璃拟态、3D 或大面积装饰。

## 响应式设计

当前已对 Desktop、Tablet 和常见移动端宽度进行基础适配，重点覆盖：

- Header 和 Sidebar。
- `lg` 以下的抽屉导航。
- 我的岗位页面和岗位卡片。
- Dashboard 统计卡片。
- 求职进度漏斗、近期数据、7 天趋势和最近动态。
- 新增 / 编辑岗位 Modal。

已验证 1440px、1024px、768px、640px、390px 和 375px 等宽度，主要页面无横向溢出。项目仍不是完整的移动端专项设计。

## 项目亮点

### 单一数据源

岗位、投递、面试、Offer 和联系人统一由 Pinia Job Store 管理，页面不创建重复数据源。

### 派生统计

Dashboard 和 Progress 的统计数据全部通过 `computed` 从 Job Store 派生，不保存独立统计状态。

### 表单复用

新增和编辑岗位复用同一个 `JobForm`，通过 `JobFormModal` 区分模式，减少重复校验和表单逻辑。

### Modal 交互

岗位 Modal 支持：

- 新增与编辑模式切换。
- 打开时自动聚焦。
- Tab 焦点循环。
- Esc 关闭。
- 关闭后焦点恢复。
- 防重复提交。
- 页面滚动锁定。
- `scrollbar-gutter: stable` 防止横向位移。

### 最近 7 天趋势

使用 Vue 和 CSS 实现活动趋势，不引入图表库。面试时间会按本地自然日归类，趋势和近期总数使用同一份派生数据。

### 响应式布局

通过 Tailwind `sm`、`lg`、`xl` 等现有断点进行渐进适配，不维护独立的移动端页面。

## 本地运行

环境要求：

- Node.js `^20.19.0` 或 `>=22.12.0`
- npm

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

生产构建：

```bash
npm run build
```

本地预览构建产物：

```bash
npm run preview
```

运行 ESLint：

```bash
npm run lint
```

单独执行 TypeScript 检查：

```bash
npx vue-tsc -b
```

`npm run build` 会先执行 `vue-tsc -b`，再执行 Vite 生产构建。

## Screenshots

当前仓库尚未包含项目截图，后续整理阶段补充：

- Dashboard
- 我的岗位
- 岗位详情
- 求职进度
- 新增 / 编辑岗位 Modal

不会使用不存在的图片路径作为占位。

## Live Demo

当前没有已部署的在线地址。

## Project Status

- 核心岗位 CRUD、搜索、筛选、排序和状态快捷修改已完成。
- 岗位详情中的投递、面试、Offer 和联系人新增 / 编辑闭环已完成。
- Dashboard 和独立求职进度页面已完成。
- LocalStorage 持久化已完成基础版本。
- Desktop、Tablet 和常见移动端宽度已完成基础响应式适配。
- ESLint 已接入，当前 `npm run lint` 为 0 error / 0 warning。
- 项目尚未部署，尚未接入后端 API、用户系统或云同步。
- 尚未建立自动化测试和 CI。

## Interview Focus

项目中适合进一步展开的前端技术点：

- Vue 3 Composition API 与 `<script setup>`。
- TypeScript 类型建模和联合类型。
- Pinia Setup Store 与单一数据源。
- Vue Router 参数路由和 `meta.title`。
- LocalStorage 初始化、深度 watch 和异常兜底。
- `computed` 派生统计、日期分桶和趋势数据。
- 表单校验、编辑回填和防重复提交。
- Modal 生命周期、焦点管理、Esc 和滚动锁定。
- Tailwind CSS 设计令牌与响应式布局。
- ESLint flat config。

## 当前限制

- 纯前端实现，没有后端 API、数据库、登录和多用户能力。
- LocalStorage 没有逐字段 schema 校验和版本迁移。
- 不支持删除投递记录、面试记录、Offer 或联系人。
- 不支持多 Offer 管理和 Offer 状态流转。
- 没有分页、最近岗位、趋势图、数据导入导出和 404 页面。
- 没有自动化测试、CI 和在线 Demo。
- 响应式适配覆盖主要页面和常见宽度，但没有完成全设备专项适配。

## 后续计划

- 补充真实项目截图和部署信息。
- 根据实际使用情况完善数据校验和错误处理。
- 在数据规模增长后评估分页和更精细的检索。
- 补充自动化测试和持续集成。
- 继续整理面试展示材料。
