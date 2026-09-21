# JobTrack

JobTrack 是一个基于 Vue 3、TypeScript 和 Vite 的个人求职管理 Web 应用，用于统一管理岗位、投递、面试、Offer、联系人和求职进度。

## 项目定位

- 个人求职管理工具的前端项目。
- 以岗位为核心，串联投递记录、面试记录、Offer 信息和招聘联系人。
- Desktop Web 优先，保留基础响应式布局，移动端专项适配尚未完成。
- 当前为纯前端应用，数据保存在浏览器 LocalStorage，不包含后端 API 和用户系统。

## 技术栈

| 技术 | 用途 |
| --- | --- |
| Vue 3 | Composition API 与页面组件 |
| TypeScript | 类型约束与业务数据模型 |
| Vite | 本地开发、构建和预览 |
| Vue Router | 页面路由与详情页参数 |
| Pinia | 岗位及关联记录的统一状态管理 |
| Tailwind CSS 4 | 页面样式和设计令牌 |
| LocalStorage | 浏览器端数据持久化 |

项目未使用 UI 组件库，也没有新增数据请求或图表依赖。

## 已实现功能

### 岗位管理

- 岗位列表展示公司、职位、地点、薪资、状态、投递时间和来源。
- 按公司或职位搜索，按招聘状态筛选，按更新时间排序。
- 通过弹窗新增、编辑岗位，并支持确认删除。
- 在列表中快捷修改招聘状态。
- 岗位表单支持基础校验、编辑回填和防重复提交。
- 岗位详情页根据路由 ID 读取数据，支持返回列表和页内编辑。
- 岗位数据首次加载使用 14 条 Mock 记录，之后通过 LocalStorage 持久化。

### 求职记录

岗位详情页已实现以下记录的查看、新增和编辑：

- 投递记录：投递时间、渠道和备注。
- 面试记录：面试时间、轮次、方式和结果。
- Offer 信息：Offer 日期、职位、薪资、入职日期和备注。
- 联系人：姓名、职位、邮箱、电话和 LinkedIn。

当前不支持删除投递、面试、Offer 和联系人记录，也不支持多 Offer 管理。

### Dashboard 与求职进度

- Dashboard 展示岗位总数、待投递、已投递、面试中、Offer、已结束和招聘状态分布。
- `/progress` 展示求职漏斗、最近 7 天投递 / 面试总数和活动趋势。
- 求职进度页展示最近 5 条求职动态，并可跳转到对应岗位详情。

### 界面与交互

- 桌面端侧边栏、顶部栏和主内容布局。
- 统一的暖灰背景、鼠尾草绿色主色和卡片视觉令牌。
- 按钮、链接和表单控件的基础交互反馈。
- Modal 打开后自动聚焦，限制 Tab 焦点循环，支持 Esc 关闭并恢复触发按钮焦点。

## 页面说明

| 路由 | 页面 | 当前实现 |
| --- | --- | --- |
| `/` | 入口 | 重定向到 `/dashboard` |
| `/dashboard` | 概览 | 岗位核心统计和招聘状态分布 |
| `/jobs` | 我的岗位 | 岗位列表、搜索、筛选、排序、CRUD、状态快捷修改 |
| `/progress` | 求职进度 | 求职漏斗、近 7 天统计、活动趋势和最近动态 |
| `/jobs/new` | 添加岗位 | 独立新增岗位页面 |
| `/jobs/:id` | 岗位详情 | 岗位信息及投递、面试、Offer、联系人管理 |
| `/jobs/:id/edit` | 编辑岗位 | 编辑回填、校验和保存 |

当前没有 404 页面；侧边栏在小屏幕下会隐藏，但移动端导航尚未实现。

## 项目结构

```text
JobTrack/
├─ public/
├─ src/
│  ├─ assets/main.css
│  ├─ components/
│  │  ├─ job/
│  │  │  ├─ ContactSection.vue
│  │  │  ├─ JobForm.vue
│  │  │  ├─ JobFormModal.vue
│  │  │  ├─ JobFunnelSection.vue
│  │  │  └─ OfferInfoSection.vue
│  │  └─ layout/
│  │     ├─ AppHeader.vue
│  │     ├─ AppLayout.vue
│  │     └─ AppSidebar.vue
│  ├─ layouts/DefaultLayout.vue
│  ├─ mock/jobs.ts
│  ├─ router/index.ts
│  ├─ stores/job.ts
│  ├─ types/job.ts
│  ├─ utils/job.ts
│  ├─ views/
│  │  ├─ DashboardView.vue
│  │  ├─ JobsView.vue
│  │  ├─ JobCreateView.vue
│  │  ├─ JobDetailView.vue
│  │  ├─ JobEditView.vue
│  │  └─ ProgressView.vue
│  ├─ App.vue
│  └─ main.ts
├─ .gitignore
├─ AGENTS.md
├─ PROJECT_STATUS.md
├─ index.html
├─ package.json
├─ package-lock.json
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts
```

## 本地运行

环境要求：Node.js `^20.19.0` 或 `>=22.12.0`。

```bash
npm install
npm run dev
```

生产构建与预览：

```bash
npm run build
npm run preview
```

## 当前开发状态

已完成：基础工程、路由、布局、岗位 CRUD、LocalStorage、搜索筛选排序、岗位详情、投递 / 面试 / Offer / 联系人记录、Dashboard 基础统计和求职进度页面。

尚未完成：分页、记录删除、多 Offer、后端 API、登录权限、移动端导航、测试、Lint、CI 和 404 页面。

最近一次 `npm run build` 已通过 TypeScript 检查和 Vite 生产构建。

## 后续计划

1. 为 LocalStorage 增加 schema 校验和版本迁移。
2. 补充记录删除和更完整的异常反馈。
3. 根据数据规模评估分页和更精细的检索。
4. 完善移动端导航和可访问性。
5. 增加组件测试、Store 测试、Lint 和 CI。
6. 补充真实截图、在线部署地址和 License。

## 开发说明

- 保持现有页面设计和统一 Job Store，不重复建立数据源。
- 仅修改任务所需文件，不进行无关重构或新增不必要依赖。
- 提交前运行 `npm run build`。
- 项目开发规则见 `AGENTS.md`，阶段状态和已知问题见 `PROJECT_STATUS.md`。
