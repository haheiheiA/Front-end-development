# 三件事（DayDone）项目说明

## 项目目标

「三件事」是一个手机端优先的生活打卡 PWA，默认记录三件日常小事，也支持用户添加自己的打卡项目。数据保存在浏览器 `localStorage` 中，不依赖后端和数据库。

## 当前功能

- 每日打卡、取消打卡和完成进度
- 默认项目：上大号、洗澡、洗衣服
- 自定义项目的新增、编辑和归档删除
- 项目上一次完成时间和相对时间
- 最近 7 天记录和月历历史
- 日历日期状态及备注查看
- 打卡备注的新增、编辑和删除
- 当前月份总次数和项目统计
- JSON 数据导出、导入和二次确认清空
- 完成当天最后一个启用项目时的 Pingu 庆祝界面
- Manifest、Service Worker、离线缓存和安装到手机桌面
- Android 返回键优先关闭弹窗或返回首页
- 兼容第一版和第二版的历史数据结构

## 技术栈

- Vue 3
- Vite
- JavaScript
- 原生 CSS
- vite-plugin-pwa
- Workbox 生成的离线 Service Worker

## 运行项目

```bash
npm install
npm run dev
```

生产构建与 PWA 验证：

```bash
npm run build
npm run preview
```

Service Worker 不会在普通开发服务器中启用。需要验证安装和离线能力时，应使用 `npm run preview` 或部署后的 HTTPS 地址。

## 主要结构

```text
src/
  App.vue                        应用状态和数据操作
  components/
    HomeView.vue                 首页、打卡卡片和最近 7 天
    CalendarView.vue             月历、日期详情和备注入口
    StatsView.vue                当前月份统计
    SettingsView.vue             数据导出、导入和清空
    ItemManager.vue              自定义项目管理
    NoteEditor.vue               备注编辑
    CelebrationModal.vue         Pingu 庆祝界面
  composables/
    useUiHistory.js              标签页、弹窗和浏览器返回键状态
  lib/
    daydone.js                   日期、存储、统计和备份规则
public/
  assets/icons/                  PWA、Apple Touch 图标
  assets/pingu/pingu.gif         私人庆祝动画
vite.config.js                   PWA Manifest、Service Worker 和 Workbox 配置
```

## 数据约定

打卡数据继续使用：

```text
daydone.records.v1
daydone.items.v1
```

原有布尔字段保持不变，完成时间和备注放在 `_meta`：

```json
{
  "2026-09-16": {
    "toilet": true,
    "_meta": {
      "toilet": {
        "completedAt": "2026-09-16T14:30:00.000Z",
        "note": "今天状态不错"
      }
    }
  }
}
```

PWA 只缓存应用代码、图标和庆祝素材，不改变或清理任何本地存储数据。

## PWA 配置

- 应用名称：`三件事`
- 显示模式：`standalone`
- 启动地址：`/`
- 主题色：`#1d8b5c`
- 启动背景色：`#f7f4ee`
- 图标：192、512、maskable 512 和 Apple Touch 180
- Service Worker：自动更新、离线预缓存、导航回退到 `index.html`
- PWA 插件：`vite-plugin-pwa`
- 离线缓存包括 Pingu 动图，因此庆祝界面可以离线显示

## 更新记录

### 2026-09-17

- 增加 PWA Manifest、Service Worker、应用图标和离线缓存
- 增加浏览器返回键对标签页和弹窗的处理
- 增加移动端触控尺寸、安全区域和软键盘相关样式
- 保持所有本地存储键和历史数据兼容

### 2026-09-17（第四版）

- 调整备注交互为主动点击打开
- 增加全部完成时的 Pingu 庆祝界面和 CSS 庆祝效果

### 2026-09-16

- 完成首版打卡、持久化和最近 7 天记录
- 增加月历、自定义项目、距离上次打卡、统计、备注和数据备份
