---
description: 'GPT-5.2-Codex MCP Unified Specification: DDD × Angular 20+ × NgRx Signals × Firebase × Pure Reactive (zone-less)'
model: GPT-5.2-Codex
name: 'Angular 20+ Pure Reactive Agent V5.2'
mcp-servers:
  context7:
    type: http
    url: "https://mcp.context7.com/mcp"
    headers: {"CONTEXT7_API_KEY": "${{ secrets.COPILOT_MCP_CONTEXT7 }}"}
    tools: ["get-library-docs", "resolve-library-id"]
handoffs:
  - label: Context7 Documentation Lookup
    agent: agent
    prompt: "查詢 Angular 20+、NgRx Signals、Firebase 官方文檔，必須完成"
    send: true
  - label: Sequential Thinking
    agent: agent
    prompt: "使用順序思維分析問題，逐步拆解需求，標明步驟與優先順序"
    send: true
  - label: Software Planning
    agent: agent
    prompt: "將需求拆解為原子任務（DDD 分層、響應式設計、EventBus），生成 TODO 清單"
    send: true
  - label: Architecture Validation
    agent: agent
    prompt: "驗證代碼是否符合規範，檢查反模式，標明問題與優先修正順序"
    send: true
---

## 2️⃣ 核心原則

* **順序思維 + MCP 計劃強制**：每次實作必須先列出錯誤 → 拆解任務 → 生成代碼。
* **Domain 層純 TypeScript**，無 Angular / RxJS / Firebase 依賴。
* **Application 層使用 signalStore() + rxMethod() + withComputed() + withMethods()。
* **Infrastructure 層封裝 Firebase，返回 Observable，無 subscribe**。
* **Interface 層組件純展示，透過 effect() 和 Signal 更新 UI**。
* **EventBus 解耦跨 Store 通訊，避免循環依賴**。
* **模板語法統一使用 @if / @for / @switch，放棄 *ngIf / *ngFor / *ngSwitch**。

---

## 3️⃣ 禁止 & 必須

### 禁止操作

* `@ngrx/store`, `@ngrx/effects`, `@ngrx/entity`
* Component 直接 inject Firebase / Firestore / Auth
* Domain 層引入框架依賴
* 手動 subscribe Observable
* Store 直接依賴其他 Store

### 必須操作

* 使用 `@ngrx/signals` + `@ngrx/operators`
* 使用 Sequential Thinking 分解需求
* 使用 Software Planning MCP 拆解任務
* Architecture Validation 檢查反模式
* 所有狀態變更必須使用 patchState()
* 異步操作必須使用 rxMethod() + tapResponse()
* EventBus 解耦跨 Store 通訊

---

## 4️⃣ 開發工作流程

```

Step 1: Context7 查文檔
Step 2: Sequential Thinking 列出錯誤與需求
Step 3: Software Planning 拆解原子任務 → 生成 TODO
Step 4: Domain 層設計（Models / Policies / Types）
Step 5: Infrastructure 層實作 Repository（Observable，無 subscribe）
Step 6: Application 層實作 Store（signalStore + rxMethod）
Step 7: Interface 層實作組件（effect + @if/@for/@switch）
Step 8: Architecture Validation → 確認無反模式
Step 9: 測試 Store / 組件（Computed / Signal / 方法）
Step 10: 完成檢查清單

```

---

## 5️⃣ 建議專案結構 (DDD + Reactive)

```

src/app/
├── domain/                   # 核心業務模型與規則
│   ├── models/
│   ├── policies/
│   └── types/
│
├── application/              # NgRx Signals Store 層
│   └── stores/
│       ├── auth.store.ts
│       ├── workspace.store.ts
│       ├── task.store.ts
│       └── event-bus.store.ts
│
├── infrastructure/           # Firebase / API / Repository
│   ├── firebase/
│   │   ├── workspace.repository.ts
│   │   ├── task.repository.ts
│   │   └── account.repository.ts
│   └── services/
│
├── interfaces/               # UI / Component / Pages
│   ├── components/
│   ├── pages/
│   └── guards/
│
├── shared/                   # 共用元件 / utils / pipes / services
│   ├── components/
│   ├── services/
│   ├── utils/
│   ├── validators/
│   └── models/
│
├── assets/
│   ├── data/
│   ├── docs/
│   ├── fonts/
│   ├── images/
│   ├── styles/
│   └── tmp/logs/
│
├── dataconnect-generated/
│   ├── angular/
│   ├── esm/
│   └── .guides/
│
└── environments/
├── environment.ts
└── environment.prod.ts

```

---

## 6️⃣ 開發檢查清單 (MCP / Copilot Ready)

* [ ] 所有 Store 使用 signalStore + rxMethod
* [ ] Domain 層純 TypeScript
* [ ] Interface 層無直接 Firebase 注入
* [ ] 模板使用 @if/@for/@switch
* [ ] 無 @ngrx/store / effects / entity
* [ ] 異步操作使用 rxMethod + tapResponse
* [ ] EventBus 解耦跨 Store 通訊
* [ ] Architecture Validation 確認無反模式
* [ ] patchState() 完整使用，避免直接變更 state
* [ ] 所有模型 / policy / store 對應 DDD 層級
```

---
