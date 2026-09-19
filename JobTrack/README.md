# JobTrack

一个基于 Vue 3、TypeScript 和 Vite 的个人求职管理 Web 应用。

> 当前状态：可运行的前端原型 / 早期 MVP。项目已经具备基础工程、布局、路由、岗位数据模型、Mock 数据、Dashboard 和岗位列表展示；数据持久化与完整的岗位 CRUD 交互仍在开发计划中。

## 项目简介

JobTrack 的目标是为个人求职过程提供一个统一的管理入口，用于整理岗位信息、记录招聘状态并查看求职进度。

当前版本是纯前端实现，主要使用 Mock 数据和 Pinia 状态管理验证页面结构及数据展示流程，尚未接入后端 API、用户系统或持久化存储。项目的定位是先完成清晰、稳定的核心求职管理流程，再逐步扩展投递、面试和统计能力。

## 项目定位

- 个人求职管理工具的前端原型。
- 用于展示 Vue 3 单页应用、TypeScript、Pinia、Vue Router 和 Tailwind CSS 的工程实践。
- Desktop Web 优先，保留基础响应式样式；移动端专项适配尚未完成。
- 当前重点是岗位记录与招聘状态展示，不是完整的多用户招聘平台。

## 技术栈

| 技术 | 用途 |
| --- | --- |
| Vue 3 | Composition API 与页面组件 |
| TypeScript | 类型约束与数据模型定义 |
| Vite | 本地开发、构建与预览 |
| Vue Router | 单页应用路由与页面切换 |
| Pinia | 岗位数据状态管理 |
| Tailwind CSS 4 | 页面样式与设计令牌 |
| `Intl.DateTimeFormat` | 中文日期格式化 |

项目当前未使用 UI 组件库。Vite 8.3.0 要求 Node.js `^20.19.0` 或 `>=22.12.0`。

## 已实现功能

### 工程基础

- Vue 3 + TypeScript + Vite 项目基础配置。
- Vue Router 使用 `createWebHistory` 创建前端路由。
- Pinia 已注册到应用并用于岗位数据管理。
- Tailwind CSS 已通过 Vite 插件接入。
- 已建立统一的设计令牌，包括暖灰背景、鼠尾草绿色主色、卡片圆角和阴影。

### 应用布局

- `AppLayout` 提供桌面端侧边栏、顶部栏和主内容区域。
- `AppSidebar` 包含“概览”和“岗位”导航，并根据当前路由显示选中状态。
- `AppHeader` 根据路由 `meta.title` 显示当前页面名称。
- 主内容区域使用居中的最大宽度容器，并保留基础响应式间距。
- 视口小于 `lg` 时侧边栏会隐藏；移动端导航抽屉尚未实现。

### Dashboard

`/dashboard` 已接入 Pinia Job Store，并根据 Mock 岗位数据实时计算：

- 岗位总数。
- 待投递数量。
- 已投递数量。
- 面试中数量。
- Offer 数量。
- 已结束数量。
- 全部 10 种招聘状态的数量分布。

当前 Dashboard 不包含最近投递列表、最近面试、趋势图或独立的空状态组件。

### 岗位列表

`/jobs` 已接入 Pinia Job Store，并以卡片列表展示：

- 公司名称。
- 岗位名称。
- 工作地点。
- 薪资范围。
- 当前招聘状态。
- 投递日期或“尚未投递”。
- 岗位来源。

列表当前没有搜索、筛选、排序、分页、详情跳转和专门的空状态提示。

### 岗位数据层

- `Job` 类型包含公司、职位、地点、薪资、状态、来源、描述、要求、备注及时间字段。
- 招聘状态覆盖：待投递、已投递、简历筛选、笔试、一面、二面、HR 面、Offer、未通过、已撤回。
- 岗位来源覆盖：官网、BOSS 直聘、猎聘、拉勾、内推、其他。
- 内置 14 条 Mock 岗位数据，覆盖全部 10 种招聘状态和全部 6 种岗位来源。
- Job Store 已提供 `jobs`、`getJobById`、`addJob`、`updateJob` 和 `deleteJob`。
- Store 的增删改方法尚未全部接入页面交互；页面刷新后数据会恢复为初始 Mock 数据。

### 工具函数

- 招聘状态、岗位来源的中文标签映射。
- 招聘状态颜色和展示顺序映射。
- 中文日期格式化。
- 月薪、年薪的统一格式化和空薪资处理。

## 页面说明

| 路由 | 页面 | 当前实现 |
| --- | --- | --- |
| `/` | 入口 | 重定向到 `/dashboard` |
| `/dashboard` | 概览 | 已接入 Job Store，展示汇总指标和状态分布 |
| `/jobs` | 我的岗位 | 已接入 Job Store，展示岗位卡片列表 |
| `/jobs/new` | 添加岗位 | 仅页面骨架，尚未实现表单和保存流程 |
| `/jobs/:id` | 岗位详情 | 仅页面骨架，尚未按 `id` 读取和展示岗位 |
| `/jobs/:id/edit` | 编辑岗位 | 仅页面骨架，尚未实现回填、校验和保存流程 |

当前没有 404 页面，岗位列表卡片也没有到详情页的链接或点击行为。

## 项目结构

```text
JobTrack/
├─ public/                         # 预留静态资源目录，当前为空
├─ src/
│  ├─ assets/
│  │  └─ main.css                  # Tailwind 引入、主题令牌和基础样式
│  ├─ components/
│  │  ├─ common/                   # 预留通用组件目录，当前为空
│  │  ├─ job/                      # 预留岗位业务组件目录，当前为空
│  │  └─ layout/
│  │     ├─ AppHeader.vue          # 顶部栏
│  │     ├─ AppLayout.vue          # 主布局与 RouterView
│  │     └─ AppSidebar.vue         # 桌面端侧边栏
│  ├─ layouts/
│  │  └─ DefaultLayout.vue         # 默认布局入口
│  ├─ mock/
│  │  └─ jobs.ts                   # 14 条示例岗位数据
│  ├─ router/
│  │  └─ index.ts                  # 路由配置
│  ├─ stores/
│  │  └─ job.ts                    # Pinia 岗位 Store
│  ├─ types/
│  │  └─ job.ts                    # Job 相关类型
│  ├─ utils/
│  │  └─ job.ts                    # 标签、颜色、日期和薪资格式化
│  ├─ views/
│  │  ├─ DashboardView.vue         # 概览页
│  │  ├─ JobsView.vue              # 岗位列表页
│  │  ├─ JobCreateView.vue         # 添加岗位页骨架
│  │  ├─ JobDetailView.vue         # 岗位详情页骨架
│  │  └─ JobEditView.vue           # 编辑岗位页骨架
│  ├─ App.vue
│  └─ main.ts
├─ .gitignore
├─ AGENTS.md                       # 项目开发规则
├─ PROJECT_STATUS.md               # 开发状态交接文档
├─ index.html
├─ package.json
├─ package-lock.json
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts
```

## 本地运行

环境要求：

- Node.js `^20.19.0` 或 `>=22.12.0`。
- npm。

安装依赖并启动开发服务器：

```bash
npm install
npm run dev
```

Vite 启动后会输出本地访问地址，默认通常为 `http://localhost:5173`。

生产构建与本地预览：

```bash
npm run build
npm run preview
```

构建产物输出到 `dist/`，该目录不会被 Git 跟踪。

## 当前开发状态

| 模块 | 状态 |
| --- | --- |
| Vue/Vite/TypeScript 基础工程 | 已完成 |
| Router、Pinia、Tailwind CSS 接入 | 已完成 |
| 桌面端整体布局与视觉令牌 | 已完成 |
| Job 类型、Mock 数据、Pinia Store | 已完成 |
| Dashboard 数据统计 | 已完成基础版本 |
| 岗位列表展示 | 已完成基础版本 |
| 添加岗位表单与保存 | 未实现 |
| 岗位详情数据读取 | 未实现 |
| 编辑岗位与删除交互 | 未实现 |
| LocalStorage 或后端持久化 | 未实现 |
| 搜索、筛选、排序、分页 | 未实现 |
| 投递管理、面试管理、统计模块 | 未实现 |
| 自动化测试和代码检查脚本 | 未实现 |

最近一次 `npm run build` 已通过 `vue-tsc -b` 和 Vite 生产构建。

## 后续计划

建议按以下顺序继续开发：

1. 完成岗位创建、详情、编辑和删除的 UI 流程，并复用现有 Job Store。
2. 增加 LocalStorage 持久化，避免刷新后数据恢复为初始 Mock 数据。
3. 补充空状态、异常状态和列表到详情页的跳转。
4. 增加搜索、状态筛选和必要的排序。
5. 扩展 Dashboard 的最近岗位、近期投递和面试信息。
6. 完善移动端导航与保留的响应式布局。
7. 根据项目复杂度增加测试、Lint 和持续集成。
8. 稳定后补充真实项目截图和部署说明。

以上均为后续计划，不代表当前已经实现。

## 开发说明

- 当前页面设计、Layout、Sidebar、Header 和技术栈已确定，不应无故重构或更换。
- 岗位数据的唯一来源应为 `src/stores/job.ts`，不要为 Dashboard 或列表页建立重复的数据源。
- 当前数据来自 `src/mock/jobs.ts`，接入持久化或 API 前不要把它描述为真实后端数据。
- 仅修改完成任务所需的文件，优先复用现有代码和依赖。
- 提交前至少运行 `npm run build`。
- 每完成一个明确阶段，应同步更新 `PROJECT_STATUS.md`。
- 项目开发约束见 `AGENTS.md`，当前开发状态和交接信息见 `PROJECT_STATUS.md`。
