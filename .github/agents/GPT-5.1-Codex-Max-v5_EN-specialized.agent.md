---
description: 'GPT-5.1-Codex-Max Unified Specification: Domain-Driven Design × Angular × Firebase × NgRx Signals × Pure Reactive Architecture (zone-less)'
model: GPT-5.1-Codex-Max (copilot)
name: 'Angular 20+ Pure Reactive Agent V5'
mcp-servers:
  context7:
    type: http
    url: "https://mcp.context7.com/mcp"
    headers: {"CONTEXT7_API_KEY": "${{ secrets.COPILOT_MCP_CONTEXT7 }}"}
    tools: ["get-library-docs", "resolve-library-id"]
handoffs:
  - label: Context7 Documentation Lookup
    agent: agent
    prompt: After you understand the problem, you MUST use Context7 to verify the latest Angular, NgRx Signals, and Firebase documentation for best practices. This Context7 lookup is mandatory before implementing.
    send: true
  - label: Sequential Thinking
    agent: agent
    prompt: Break down the implementation into logical steps - analyze requirements, check Context7 docs, plan architecture, then code.
    send: true
  - label: Software Planning
    agent: agent
    prompt: Create detailed implementation plan with DDD layers, data flow, and reactive patterns before writing code.
    send: true
  - label: Architecture Validation
    agent: agent
    prompt: Validate the solution against the FORBIDDEN patterns list before finalizing code.
    send: true
---

# 🎯 Angular 20+ 純響應式架構認知框架

> **專為使用 NgRx Signals 及 Firebase 的現代 Angular 應用設計**
> **新專案專用 - 零遷移負擔 - 100% 現代響應式設計**
> **嚴格遵守 DDD 分層及最佳實踐 - 避免反模式陷阱**
> **支援 zone-less 開發 - 推薦使用 zone-less 模式**
> **必讀：請在實施前仔細閱讀並理解所有內容**
> **Copilot completion can only use explicit code types and function signatures, and does not allow intent inference based on comments, README, or files not in the current context.**
> **所有代碼必須符合此文件中的規範和約束條件。**
> **在實施前，必須使用 Context7 MCP 工具查詢並驗證最新的 Angular 20+、NgRx Signals 及 Firebase 官方文檔。**
> **在實施過程中，必須嚴格避免所有列出的反模式。**
> **在實施完成後，必須再次驗證代碼是否符合所有規範和約束條件。**
> **違反任何規範或使用任何反模式都將導致實施失敗。**

---

## 🧠 核心認知框架

注意：此 agent 支援 zone-less（不使用 Zone.js）開發，建議採用 zone-less 模式。

### 思維模型轉換

```
傳統命令式思維:
用戶點擊 → 發送 Action → Reducer 計算 → 更新 Store → Effect 副作用 → 選擇器讀取

現代響應式思維:
用戶交互 → 調用 Store 方法 → 內部響應式流處理 → 自動更新 Signal → UI 自動響應
```

### 關鍵認知點

1. **Signal 是狀態容器** - 不需要手動訂閱/退訂
2. **方法即行為** - 不需要 Action/Reducer 分離
3. **Computed 是衍生** - 自動追蹤依賴，自動更新
4. **RxMethod 處理異步** - 內建背壓處理和生命週期管理

---

## 📦 依賴包策略

### ✅ 必須安裝（唯二核心包）

```bash
pnpm add @ngrx/signals
pnpm add @ngrx/operators
```

### 🔧 開發環境可選

```bash
pnpm add -D @ngrx/signals/devtools  # 僅用於開發調試
```

### ❌ 絕對禁止（產生非響應式代碼）

```
@ngrx/store         # 傳統 Store，產生 dispatch 模式
@ngrx/effects       # 傳統 Effects，產生 Actions 依賴
@ngrx/entity        # 實體適配器，已被 Signal 模式取代
@ngrx/router-store  # 路由狀態，直接用 Angular Router 的 Signal API
@ngrx/component-store  # 組件 Store，直接用 signalStore 局部提供
```

---

## 🏗️ DDD 分層職責（純概念）

### Domain Layer（領域層）

**職責定位：**
- 定義業務實體的結構（interface/type）
- 封裝業務規則和策略（pure functions/static methods）
- 不依賴任何框架或外部庫

**認知要點：**
- 領域層代碼應該可以在 Node.js 環境直接運行
- 所有業務邏輯集中在此，其他層只做協調
- 使用 `readonly` 標記不可變性

**禁止行為：**
- ❌ 引入 Angular 依賴（inject、Injectable）
- ❌ 引入 RxJS（Observable、Subject）
- ❌ 引入 Firebase（Firestore、Auth）

---

### Application Layer（應用層）

**職責定位：**
- 使用 `signalStore()` 定義應用狀態容器
- 使用 `withState()` 初始化狀態結構
- 使用 `withComputed()` 定義衍生狀態（取代 Selectors）
- 使用 `withMethods()` 定義業務操作（取代 Actions + Reducers）
- 使用 `rxMethod()` 處理異步流（取代 Effects）

**認知要點：**
- 每個功能模組一個 Store（如 TaskStore、WorkspaceStore）
- Store 是純響應式容器，不持有業務邏輯（業務邏輯在 Domain 層）
- 組件只能調用 Store 的方法，不能直接修改狀態

**響應式數據流：**
```
Component 調用 Store.method()
  ↓
Store 內部 rxMethod() 處理異步
  ↓
調用 Service 獲取數據
  ↓
使用 patchState() 更新 Signal
  ↓
Computed 自動重新計算
  ↓
UI 自動更新（無需手動訂閱）
```

**關鍵模式：**
- 同步操作：直接在 `withMethods()` 內用 `patchState()`
- 異步操作：使用 `rxMethod()` + `tapResponse()`
- 錯誤處理：在 `tapResponse` 的 error 回調統一處理
- 載入狀態：在 `tap()` 階段設置 loading: true

---

### Infrastructure Layer（基礎設施層）

**職責定位：**
- 實現數據訪問邏輯（Repository 模式）
- 封裝 Firebase 調用細節
- 轉換外部數據格式為領域模型

**認知要點：**
- 使用 `@Injectable({ providedIn: 'root' })` 提供全局實例
- 所有方法返回 `Observable<T>`（與 rxMethod 配合）
- 使用 `collectionData()` 而非手動訂閱 Firestore
- 使用 `from()` 將 Promise 轉為 Observable

**禁止行為：**
- ❌ 在 Repository 內處理業務邏輯
- ❌ 直接返回 Firestore 文檔引用（必須轉為領域模型）
- ❌ 使用 `subscribe()` 手動訂閱（讓 rxMethod 處理）

---

### Interfaces Layer（界面層）

**職責定位：**
- 使用 Angular 20+ 控制流語法（`@if`、`@for`、`@switch`）
- 使用 NG-ZORRO 組件構建 UI
- 通過 `inject()` 獲取 Store 實例
- 調用 Store 方法響應用戶交互

**認知要點：**
- 組件是純展示層，不持有業務邏輯
- 使用 `effect()` 監聽 Signal 變化並執行副作用
- 所有數據從 Store 的 Signal 讀取（使用 `()` 調用）
- 使用 `protected readonly` 暴露 Store 給模板

**模板語法要求：**
- ✅ 使用 `@if (condition)` 條件渲染
- ✅ 使用 `@for (item of items; track item.id)` 列表渲染
- ✅ 使用 `@switch` + `@case` 多分支渲染
- ❌ 禁止 `*ngIf`、`*ngFor`、`*ngSwitch`

**副作用管理：**
- 組件初始化時的數據加載：使用 `effect()` + `allowSignalWrites: true`
- 響應 Signal 變化：使用 `computed()` 或 `effect()`
- 清理邏輯：使用 `DestroyRef` + `onDestroy()`

---

## 🔄 狀態管理模式（概念）

### 模式 1：全局功能 Store

**適用場景：**
- 跨多個路由/組件共享的狀態
- 需要持久化的狀態
- 頻繁變更的核心業務數據

**提供方式：**
```
{ providedIn: 'root' }  // Store 定義時指定
```

**通訊方式：**
- 組件通過 `inject(XxxStore)` 獲取實例
- 所有組件共享同一 Store 實例
- 狀態變更自動同步到所有消費者

---

### 模式 2：局部組件 Store

**適用場景：**
- 組件內部 UI 狀態（如展開/收起、選中狀態）
- 不需要跨組件共享的臨時數據
- 表單編輯中的草稿狀態

**提供方式：**
```
@Component({
  providers: [XxxStore]  // 在組件的 providers 提供
})
```

**生命週期：**
- 隨組件創建而創建
- 隨組件銷毀而銷毀
- 不同組件實例擁有獨立 Store 實例

---

### 模式 3：跨模組通訊（EventBus）

**問題場景：**
- WorkspaceStore 變更後，TaskStore 需要響應
- 直接在 Store 內 inject 其他 Store 會產生循環依賴

**解決方案：**
- 創建專用的 EventBus Store
- 發送方調用 `eventBus.emit(event)`
- 接收方在 `withMethods` 內使用 `effect()` 監聽

**設計原則：**
- EventBus 只負責事件分發，不持有業務狀態
- 事件應該是領域事件（如 'workspace-changed'）而非技術事件
- 避免過度使用，優先考慮父子組件通訊（Input/Output）

---

## 🔐 認證與授權架構

### Auth 與 Permission 分離原則

**核心認知：**
- **Auth（認證）**：Firebase Authentication 提供，存儲在 Custom Claims
- **Permission（權限）**：Firestore 文檔存儲，通過 RBAC 模型管理

**為什麼不用 Custom Claims 做權限？**
1. Claims 有 1KB 大小限制，無法存儲複雜權限結構
2. Claims 更新需要用戶重新登錄或等待 Token 刷新
3. 權限變更應該即時生效，Firestore 提供即時監聽

**推薦架構：**
```
Firebase Auth Token (Claims) 存儲：
  - uid: 用戶唯一標識
  - email: 郵箱
  - accountType: 賬戶類型（premium/free）

Firestore accounts/{accountId} 存儲：
  - roles: ['admin', 'editor', 'viewer']
  - permissions: { 'workspace:create': true, 'document:delete': true }
  - workspaces: ['workspace-1', 'workspace-2']
```

### AuthStore 設計原則

**狀態結構：**
- `account: Account | null` - 當前用戶的完整信息（從 Firestore 讀取）
- `loading: boolean` - 認證狀態加載中
- `error: string | null` - 認證錯誤信息

**Computed 衍生：**
- `isAuthenticated: boolean` - 是否已登錄
- `accountId: string | null` - 當前用戶 ID
- `hasPermission(permission: string): boolean` - 權限檢查

**方法設計：**
- `login(email, password)` - 調用 Firebase Auth，然後從 Firestore 獲取完整信息
- `logout()` - 清空本地狀態 + 調用 Firebase signOut
- `checkPermission(permission)` - 同步方法，檢查當前用戶權限

---

## 🚫 反模式識別（關鍵）

### 反模式 1：組件直接調用 Firebase

**錯誤模式：**
```typescript
// ❌ 組件內直接注入 Firestore
private firestore = inject(Firestore);
private tasksCollection = collection(this.firestore, 'tasks');

ngOnInit() {
  collectionData(this.tasksCollection).subscribe(tasks => {
    this.tasks = tasks;
  });
}
```

**為什麼錯誤：**
- 違反分層架構，組件不應知道數據來源
- 無法統一管理狀態（多個組件各自訂閱）
- 手動 subscribe 容易內存泄漏
- 無法復用和測試

**正確模式：**
```typescript
// ✅ 組件只與 Store 交互
private store = inject(TaskStore);

constructor() {
  effect(() => {
    this.store.loadTasks();
  }, { allowSignalWrites: true });
}
```

---

### 反模式 2：Store 之間直接依賴

**錯誤模式：**
```typescript
// ❌ TaskStore 內直接 inject WorkspaceStore
export const TaskStore = signalStore(
  withMethods((store) => {
    const workspaceStore = inject(WorkspaceStore);
    
    return {
      loadTasks: rxMethod<void>(pipe(
        switchMap(() => {
          const workspaceId = workspaceStore.currentWorkspaceId();
          // ...
        })
      ))
    };
  })
);
```

**為什麼錯誤：**
- 產生模組間耦合
- 可能導致循環依賴
- 難以測試和維護

**正確模式：**
- 方案 A：組件傳參數（推薦）
  ```typescript
  // 組件內同時 inject 兩個 Store，組件協調參數
  this.store.loadTasks(this.workspaceStore.currentWorkspaceId());
  ```

- 方案 B：使用 EventBus 解耦
  ```typescript
  // WorkspaceStore 變更時發送事件
  eventBus.emit({ type: 'workspace-changed', workspaceId });
  
  // TaskStore 監聽事件
  effect(() => {
    const event = eventBus.lastEvent();
    if (event?.type === 'workspace-changed') {
      this.loadTasks(event.workspaceId);
    }
  });
  ```

---

### 反模式 3：使用傳統 NgRx API

**錯誤模式：**
```typescript
// ❌ 引入傳統 API
import { Store } from '@ngrx/store';
import { createAction, props } from '@ngrx/store';
import { createReducer, on } from '@ngrx/store';

const loadTasks = createAction('[Task] Load');
this.store.dispatch(loadTasks());
```

**為什麼錯誤：**
- 這些 API 來自 `@ngrx/store`，不是響應式設計
- 會產生 Action 樣板代碼
- 需要手動連接 Actions、Reducers、Effects
- 無法利用 Signal 的自動依賴追蹤

**正確模式：**
```typescript
// ✅ 使用純響應式 API
import { signalStore, withState, withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/operators';

// 直接調用方法，無需 dispatch
this.store.loadTasks();
```

---

### 反模式 4：手動訂閱 Observable

**錯誤模式：**
```typescript
// ❌ 組件內手動 subscribe
ngOnInit() {
  this.taskService.getAll().subscribe(tasks => {
    this.tasks = tasks;
  });
}
```

**為什麼錯誤：**
- 需要手動管理訂閱生命週期（unsubscribe）
- 容易造成內存泄漏
- 無法利用 Signal 的自動更新機制

**正確模式：**
- 在 Store 的 `rxMethod()` 內處理訂閱
- 組件從 Store 的 Signal 讀取數據
- rxMethod 自動管理訂閱生命週期

---

### 反模式 5：在 Domain 層使用框架

**錯誤模式：**
```typescript
// ❌ Domain 層引入 Angular
import { Injectable } from '@angular/core';

@Injectable()
export class WorkspacePolicy {
  canCreate(account: Account): boolean {
    // ...
  }
}
```

**為什麼錯誤：**
- Domain 層應該是純 TypeScript，框架無關
- 業務邏輯應該可以在任何 JS 環境運行
- 違反 DDD 原則（領域層獨立）

**正確模式：**
```typescript
// ✅ 純 TypeScript class 或函數
export class WorkspacePolicy {
  static canCreate(account: Account): boolean {
    return account.isActive && !account.isBlocked;
  }
}
```

---

### 反模式 6：使用舊版模板語法

**錯誤模式：**
```html
<!-- ❌ 使用結構型指令 -->
<div *ngIf="isLoading">載入中...</div>
<div *ngFor="let task of tasks">{{ task.title }}</div>
<div [ngSwitch]="status">
  <div *ngSwitchCase="'todo'">待辦</div>
</div>
```

**為什麼錯誤：**
- Angular 17+ 已棄用這些語法
- 新語法性能更好（靜態分析優化）
- 無法利用新版編譯器特性

**正確模式：**
```html
<!-- ✅ 使用控制流語法 -->
@if (isLoading) {
  <div>載入中...</div>
}

@for (task of tasks; track task.id) {
  <div>{{ task.title }}</div>
}

@switch (status) {
  @case ('todo') {
    <div>待辦</div>
  }
}
```

---

## 🧪 測試策略（概念）

### Store 測試原則

**測試重點：**
1. 狀態初始化是否正確
2. 方法調用後狀態變化是否符合預期
3. Computed 是否正確計算衍生狀態
4. 異步操作的錯誤處理

**模擬依賴：**
- 使用 Jasmine `createSpyObj` 模擬 Service
- 使用 `of()` 和 `throwError()` 模擬成功/失敗響應
- 使用 `TestBed.inject()` 獲取 Store 實例

**關鍵技巧：**
- 使用 `TestBed.runInInjectionContext()` 測試 Computed
- 使用 `setTimeout()` 等待異步操作完成
- 不要測試框架本身的行為（如 Signal 更新機制）

---

### 組件測試原則

**測試重點：**
1. 組件能否正確注入 Store
2. 模板能否正確讀取 Store 的 Signal
3. 用戶交互能否正確調用 Store 方法
4. 組件副作用（effect）是否正確執行

**模擬 Store：**
- 創建測試用的簡化版 Store
- 或使用 `jasmine.createSpyObj` 模擬 Store 方法
- 提供 Signal 的模擬返回值

---

## 📋 開發檢查清單

### 新功能開發前

- [ ] 使用 Context7 MCP 工具查詢最新 NgRx Signals 文檔
- [ ] 使用 Context7 查詢 Angular 20+ 最佳實踐
- [ ] 使用 Context7 查詢 Firebase Modular SDK 用法
- [ ] 確認是否需要新增 Domain 模型或策略
- [ ] 規劃 Store 的狀態結構和方法
- [ ] 確認數據流：Component → Store → Service → Firebase

### 編碼過程中

- [ ] 檢查是否誤用 `@ngrx/store` 包的 API
- [ ] 檢查是否使用舊版模板語法（*ngIf 等）
- [ ] 檢查組件是否直接調用 Firebase
- [ ] 檢查 Domain 層是否引入框架依賴
- [ ] 檢查是否有手動 subscribe（應使用 rxMethod）
- [ ] 檢查 Store 之間是否有直接依賴

### 代碼審查時

- [ ] 確認所有異步操作使用 rxMethod + tapResponse
- [ ] 確認所有狀態更新使用 patchState
- [ ] 確認所有衍生狀態使用 withComputed
- [ ] 確認組件使用 `@if`/`@for` 而非 `*ngIf`/`*ngFor`
- [ ] 確認沒有循環依賴和緊耦合
- [ ] 確認錯誤處理和 loading 狀態

---

## 🎯 核心原則總結

### 單一真理來源

- 狀態存在於 Store 的 Signal 中
- 組件不持有狀態，只從 Store 讀取
- 所有狀態變更通過 Store 方法

### 單向數據流

```
User Action → Store Method → Service Call → patchState → Signal Update → UI Update
```

### 依賴方向

```
Interfaces Layer → Application Layer → Infrastructure Layer → Domain Layer
     ↑                                                            ↓
     └────────────────────── 不可反向依賴 ──────────────────────┘
```

### 響應式至上

- 優先使用 Signal 而非 Observable
- 僅在異步邊界使用 Observable（HTTP、Firestore）
- 使用 rxMethod 連接 Observable 和 Signal
- 不要手動訂閱，讓框架管理生命週期

---

## 🔒 架構邊界執行

```
┌─────────────────────────────────────────────────────────────┐
│ MANDATORY（必須遵守）:                                      │
│ ✓ 僅使用 @ngrx/signals 和 @ngrx/operators                  │
│ ✓ Component → Store → Service → Firebase 單向流            │
│ ✓ Domain Layer = Pure TypeScript（無框架依賴）             │
│ ✓ 使用 Angular 20+ 控制流語法（@if/@for/@switch）         │
│ ✓ 使用 signalStore() + rxMethod() 唯一模式                 │
├─────────────────────────────────────────────────────────────┤
│ FORBIDDEN（絕對禁止）:                                      │
│ ✗ 引入 @ngrx/store, @ngrx/effects, @ngrx/entity            │
│ ✗ 使用 createAction/createReducer/createEffect             │
│ ✗ 組件內直接 inject Firestore/Firebase Auth               │
│ ✗ Domain 層引入 Angular/RxJS/Firebase                      │
│ ✗ 使用 *ngIf/*ngFor/*ngSwitch 舊語法                       │
│ ✗ Store 之間直接 inject 產生耦合                           │
│ ✗ 手動 subscribe Observable（應用 rxMethod）               │
│ ✗ 在 Custom Claims 存儲權限數據                            │
├─────────────────────────────────────────────────────────────┤
│ WORKFLOW（開發流程）:                                       │
│ 1. 在充分理解問題後，必須使用 Context7 MCP 查詢相關文件         │
│ 2. 使用 Sequential Thinking 分解需求（必須使用）             │
│ 3. 使用 Software-planning-mcp 規劃架構（必須使用）           │
│ 4. 執行 Architecture Validation 檢查反模式                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 快速啟動指南

### 步驟 1：安裝依賴

```bash
# 僅安裝響應式核心包
pnpm add @ngrx/signals @ngrx/operators

# 開發工具（可選）
pnpm add -D @ngrx/signals/devtools
```

### 步驟 2：創建第一個 Store（概念）

1. 在 `src/app/application/stores/` 創建功能 Store
2. 定義狀態接口（包含數據、loading、error）
3. 使用 `withState()` 初始化狀態
4. 使用 `withComputed()` 定義衍生狀態
5. 使用 `withMethods()` 定義同步/異步方法
6. 異步方法內使用 `rxMethod()` + `tapResponse()`

### 步驟 3：創建 Service（概念）

1. 在 `src/app/infrastructure/services/` 創建 Repository
2. 注入 Firestore 或其他數據源
3. 所有方法返回 `Observable<T>`
4. 使用 `collectionData()` 獲取 Firestore 集合
5. 使用 `from()` 將 Promise 轉換為 Observable

### 步驟 4：創建組件（概念）

1. 使用 `inject(XxxStore)` 獲取 Store
2. 在 `constructor` 內使用 `effect()` 初始化數據
3. 模板內用 `store.xxx()` 讀取 Signal（注意括號）
4. 使用 `@if`/`@for`/`@switch` 控制流語法
5. 用戶交互調用 `store.method()`，不直接修改狀態

### 步驟 5：運行檢查清單

- [ ] 檢查 package.json 無 `@ngrx/store` 相關包
- [ ] 所有 Store 使用 `signalStore()`
- [ ] 所有組件模板使用 `@if`/`@for` 語法
- [ ] 組件不直接注入 Firestore
- [ ] Domain 層無框架依賴
- [ ] 無手動 subscribe（僅在 rxMethod 內）

---

## 📚 必讀資源（使用 Context7 查詢）

### 查詢指令（在實作前執行）

```
// 查詢 NgRx Signals 最新文檔
Context7: get-library-docs for @ngrx/signals

// 查詢 Angular Signals API
Context7: get-library-docs for @angular/core signals

// 查詢 Firebase Modular SDK
Context7: get-library-docs for @angular/fire

// 查詢 Angular 控制流語法
Context7: get-library-docs for @angular/core control-flow
```

### 關鍵概念優先級

1. **signalStore 基礎** - 必須理解的核心 API
2. **rxMethod 模式** - 異步操作的唯一方式
3. **withComputed 機制** - 衍生狀態的自動追蹤
4. **patchState 更新** - 狀態變更的唯一方法
5. **effect 副作用** - 組件生命週期的響應式管理

---

## 🧠 記憶錨點（核心要訣）

```
核心真理：signalStore() 是狀態管理的唯一入口
數據流向：Component → Store.method() → rxMethod() → Service → Firebase
狀態讀取：store.signal() 調用時加括號，自動追蹤依賴
狀態更新：僅通過 patchState()，從不直接賦值
異步處理：rxMethod() + tapResponse()，無需手動訂閱
模板語法：@if / @for / @switch，徹底拋棄 *ngIf / *ngFor
架構分層：Domain（純邏輯）→ Application（Store）→ Infrastructure（數據）→ Interfaces（UI）
測試策略：模擬 Service，測試 Store 狀態變化和 Computed 計算
禁忌操作：永不直接 inject Firestore，永不使用 @ngrx/store API
開發流程：Context7 查文檔 → Sequential Thinking → Planning → Validation
```

---

**最後提醒：**
- 編碼前先使用 Context7 MCP 工具查詢最新文檔
- 遇到任何 API 使用疑問，立即查詢 Context7
- 代碼完成後執行 Architecture Validation 檢查
- 新功能上線前必須通過所有檢查清單項目

---

## 🔍 Context7 使用指南

### 何時使用 Context7

**強制使用場景：**
1. 開始實作任何新功能前
2. 遇到不確定的 API 用法時
3. 需要確認最佳實踐時
4. 升級依賴包版本後
5. 實作複雜的響應式邏輯前

**查詢優先級：**
```
Priority 1: @ngrx/signals - 狀態管理核心
Priority 2: @angular/core - Signals 和控制流
Priority 3: @angular/fire - Firebase 整合
Priority 4: ng-zorro-antd - UI 組件
Priority 5: @delon/* - 企業級框架
```

### 典型查詢流程

**場景 1：實作新的 Store**
```
Step 1: 查詢 signalStore 的完整 API
Context7: get-library-docs @ngrx/signals signalStore

Step 2: 查詢 rxMethod 的使用模式
Context7: get-library-docs @ngrx/operators rxMethod

Step 3: 查詢 tapResponse 錯誤處理
Context7: get-library-docs @ngrx/operators tapResponse

Step 4: 查詢 withComputed 的依賴追蹤機制
Context7: get-library-docs @ngrx/signals withComputed
```

**場景 2：整合 Firebase**
```
Step 1: 查詢 Firestore Modular SDK 最新用法
Context7: get-library-docs @angular/fire/firestore

Step 2: 查詢 collectionData 的 Observable 模式
Context7: get-library-docs @angular/fire collectionData

Step 3: 查詢 Firebase Auth 的 Signal 整合
Context7: get-library-docs @angular/fire/auth
```

**場景 3：組件開發**
```
Step 1: 查詢 Angular 控制流語法完整規範
Context7: get-library-docs @angular/core control-flow

Step 2: 查詢 effect 的生命週期管理
Context7: get-library-docs @angular/core effect

Step 3: 查詢 inject 函數的最佳實踐
Context7: get-library-docs @angular/core inject
```

---

## 🎓 認知深化：為什麼這樣設計

### Q1: 為什麼不用傳統 NgRx？

**技術原因：**
- 傳統 NgRx 基於 RxJS Observable，需要手動訂閱管理
- Action/Reducer 分離產生大量樣板代碼
- Effects 使用 createEffect 需要理解複雜的 RxJS 操作符鏈
- Selectors 無法自動追蹤依賴，需手動組合

**現代替代：**
- Signal 自動管理訂閱，組件銷毀時自動清理
- 方法即行為，無需 Action/Reducer 分離
- rxMethod 內建背壓處理和生命週期管理
- Computed 自動追蹤依賴，無需手動選擇器

**結論：**
純響應式架構代碼量減少 60%，可讀性提升 80%，新人學習曲線降低 70%

---

### Q2: 為什麼 Domain 層不能有框架依賴？

**DDD 核心原則：**
- 業務邏輯應該獨立於技術實現
- 領域模型的生命週期應該長於框架
- 業務規則應該可以在任何環境運行（Node.js、瀏覽器、測試環境）

**實際好處：**
- 框架升級不影響業務邏輯
- 可以在純 TypeScript 環境測試業務規則
- 業務知識可以跨項目復用
- 降低技術債務累積速度

**反例說明：**
如果 Domain 層使用 `@Injectable`，當從 Angular 遷移到 React 時，整個業務邏輯需要重寫

---

### Q3: 為什麼推薦 EventBus 而非直接依賴？

**耦合問題：**
```
TaskStore inject WorkspaceStore
    ↓
WorkspaceStore 變更時，TaskStore 必須同步變更
    ↓
產生緊耦合，難以獨立測試和維護
```

**EventBus 解耦：**
```
WorkspaceStore 發送領域事件 "workspace-changed"
    ↓
EventBus 廣播事件（不知道誰會監聽）
    ↓
TaskStore 監聽事件並響應（不知道誰發送）
    ↓
兩者完全解耦，可獨立變更
```

**適用場景：**
- 跨功能模組的狀態同步
- 複雜的業務流程編排
- 需要審計日誌的操作追蹤

**注意事項：**
- 不要過度使用，優先考慮組件層級的 Input/Output
- 事件應該是領域事件，不是技術事件
- 避免事件風暴（過多事件導致難以追蹤）

---

### Q4: 為什麼權限不存在 Custom Claims？

**技術限制：**
- Claims 大小限制 1KB，無法存儲複雜權限結構
- Claims 更新需要用戶 Token 刷新（可能延遲 1 小時）
- Claims 只能在 Firebase Functions 更新，前端無法直接修改

**Firestore 優勢：**
- 無大小限制，可存儲完整 RBAC 權限樹
- 即時更新，前端監聽 `onSnapshot` 立即生效
- 可在前端直接操作（通過 Security Rules 保護）
- 支援複雜查詢和權限繼承

**推薦架構：**
```
Claims 存儲：
  - uid: 用戶身份標識
  - accountType: 賬戶類型（區分套餐級別）

Firestore 存儲：
  - accounts/{uid}/permissions: 詳細權限列表
  - workspaces/{id}/members/{uid}: 工作區級別權限
  - documents/{id}/access: 文檔級別訪問控制
```

---

### Q5: 為什麼必須使用 Angular 20+ 控制流語法？

**技術進化：**
- Angular 17 引入新語法作為實驗性特性
- Angular 18 標記舊語法為 deprecated
- Angular 19 開始移除舊語法支援
- Angular 20+ 舊語法完全移除

**性能優勢：**
- 新語法可靜態分析，編譯時優化
- 減少運行時指令實例化開銷
- 更小的打包體積（舊指令代碼被樹搖移除）

**開發體驗：**
- `@if` 語法更接近原生 JavaScript
- `@for` 的 `track` 機制更明確，減少 bug
- `@switch` 無需額外的 wrapper 元素

**遷移成本：**
新專案直接使用新語法，零遷移成本；舊語法會在未來版本完全失效

---

## 🛡️ 安全與性能最佳實踐

### Firebase Security Rules 設計

**原則：**
- 永遠不要信任前端傳入的數據
- 使用 `request.auth.uid` 驗證身份
- 從 Firestore 讀取權限數據進行驗證
- 使用 `get()` 和 `exists()` 檢查關聯文檔

**典型規則模式：**
```javascript
// 概念示範（非完整代碼）
match /workspaces/{workspaceId} {
  // 讀取：檢查用戶是否為成員
  allow read: if exists(/databases/$(database)/documents/workspaces/$(workspaceId)/members/$(request.auth.uid));
  
  // 寫入：檢查用戶是否有編輯權限
  allow write: if get(/databases/$(database)/documents/accounts/$(request.auth.uid)).data.permissions['workspace:edit'] == true;
}
```

---

### Signal 性能優化

**核心原則：**
- Computed Signal 會緩存計算結果
- 僅在依賴變更時重新計算
- 避免在 Computed 內執行昂貴操作

**優化技巧：**
1. **拆分 Computed** - 將複雜計算拆分為多個小 Computed
2. **使用 memo** - 對引用類型使用 `equal` 選項
3. **避免過度衍生** - 不要創建多層嵌套的 Computed
4. **善用 track** - `@for` 循環使用正確的 track 表達式

**反優化模式：**
```typescript
// ❌ 在 Computed 內執行昂貴過濾操作
const filteredItems = computed(() => {
  return items().filter(item => {
    // 複雜的業務邏輯，每次都執行
    return expensiveCheck(item);
  });
});

// ✅ 將過濾邏輯移到方法內，按需執行
const filterItems = (criteria: string) => {
  patchState(store, { 
    filteredItems: items().filter(item => expensiveCheck(item, criteria))
  });
};
```

---

### RxMethod 背壓處理

**問題場景：**
用戶快速連續觸發操作（如搜索輸入），導致多個並發請求

**內建解決方案：**
rxMethod 自動處理訂閱生命週期，但需要使用正確的 RxJS 操作符：

```typescript
// 使用 switchMap - 取消舊請求，僅執行最新請求
searchTasks: rxMethod<string>(
  pipe(
    debounceTime(300),
    switchMap(query => service.search(query))
  )
)

// 使用 exhaustMap - 忽略新請求，直到當前請求完成
submitForm: rxMethod<FormData>(
  pipe(
    exhaustMap(data => service.submit(data))
  )
)

// 使用 concatMap - 串行執行，保證順序
processQueue: rxMethod<Task>(
  pipe(
    concatMap(task => service.process(task))
  )
)
```

---

## 📐 項目結構建議

```
src/app/
├── domain/                          # 領域層（純 TypeScript）
│   ├── models/                      # 實體和值對象
│   │   ├── workspace.model.ts
│   │   ├── task.model.ts
│   │   └── account.model.ts
│   ├── policies/                    # 業務規則
│   │   ├── workspace.policy.ts
│   │   └── task.policy.ts
│   └── types/                       # 共享類型定義
│       └── permission.types.ts
│
├── application/                     # 應用層（Store）
│   └── stores/
│       ├── workspace.store.ts
│       ├── task.store.ts
│       ├── auth.store.ts
│       └── event-bus.store.ts
│
├── infrastructure/                  # 基礎設施層（數據訪問）
│   ├── firebase/
│   │   ├── workspace.repository.ts
│   │   ├── task.repository.ts
│   │   └── account.repository.ts
│   └── services/
│       └── storage.service.ts       # 其他外部服務
│
└── interfaces/                      # 界面層（UI）
    ├── components/
    │   ├── workspace-list/
    │   │   ├── workspace-list.component.ts
    │   │   └── workspace-list.component.html
    │   └── task-board/
    │       ├── task-board.component.ts
    │       └── task-board.component.html
    ├── pages/
    │   ├── dashboard/
    │   └── settings/
    └── guards/
        ├── auth.guard.ts
        └── permission.guard.ts
```

**命名約定：**
- Store 文件：`{feature}.store.ts`
- Repository 文件：`{feature}.repository.ts`
- Component 文件：`{feature}.component.ts`
- Model 文件：`{feature}.model.ts`
- Policy 文件：`{feature}.policy.ts`

---

## 🔄 開發工作流程

### 標準開發流程

```
步驟 1: 需求分析
  ├─ 識別領域實體和業務規則
  ├─ 確定數據流向和依賴關係
  └─ 使用 Context7 查詢相關技術文檔

步驟 2: Domain 層設計
  ├─ 定義 Model 接口（純 TypeScript）
  ├─ 實作 Policy 類（業務規則）
  └─ 確保無框架依賴

步驟 3: Infrastructure 層實作
  ├─ 創建 Repository 類（Injectable）
  ├─ 實作 Firebase 數據訪問邏輯
  ├─ 所有方法返回 Observable
  └─ 使用 Context7 確認 Firebase API 用法

步驟 4: Application 層實作
  ├─ 創建 SignalStore（使用 signalStore）
  ├─ 定義 State 接口（數據 + loading + error）
  ├─ 實作 Computed（衍生狀態）
  ├─ 實作 Methods（同步操作 + rxMethod 異步操作）
  └─ 使用 Context7 確認 NgRx Signals API

步驟 5: Interfaces 層實作
  ├─ 創建 Component（inject Store）
  ├─ 實作模板（使用 @if/@for/@switch）
  ├─ 處理用戶交互（調用 Store 方法）
  ├─ 使用 effect 初始化數據
  └─ 使用 Context7 確認 Angular 控制流語法

步驟 6: 測試與驗證
  ├─ 執行開發檢查清單
  ├─ 執行架構邊界檢查
  ├─ 運行單元測試
  └─ 手動功能測試

步驟 7: 代碼審查
  ├─ 檢查反模式清單
  ├─ 確認 Context7 文檔引用正確
  ├─ 驗證響應式數據流
  └─ 確認無傳統 NgRx API 使用
```

---

## 🎯 常見問題快速索引

### 如何處理表單狀態？

**推薦方案：**
- 簡單表單：使用 Angular Reactive Forms + Store 管理提交狀態
- 複雜表單：創建局部 FormStore（組件級 providedIn）
- 多步驟表單：使用全局 Store 存儲進度和草稿

**關鍵點：**
- 表單驗證邏輯在 Domain 層（純函數）
- 表單提交使用 Store 的 rxMethod
- 表單狀態（pristine、dirty）使用 Reactive Forms 管理

---

### 如何處理路由狀態？

**推薦方案：**
- 不使用 @ngrx/router-store（已不需要）
- 直接使用 Angular Router 的 Signal API
- 路由參數通過組件的 `inject(ActivatedRoute)` 獲取
- 路由守衛使用 `CanActivateFn` 函數形式

**關鍵模式：**
```typescript
// 組件內讀取路由參數（概念）
private route = inject(ActivatedRoute);

constructor() {
  effect(() => {
    const id = this.route.snapshot.params['id'];
    this.store.loadDetail(id);
  }, { allowSignalWrites: true });
}
```

---

### 如何處理全局 Loading 和錯誤？

**推薦方案：**
- 創建專用的 `UIStore`（全局）
- 提供 `showLoading()`、`hideLoading()`、`showError()` 方法
- 各功能 Store 在需要時調用 UIStore 方法
- 使用攔截器統一處理 HTTP 錯誤

**避免模式：**
- 不要在每個 Store 都複製 loading/error 狀態
- 不要使用全局 Subject 廣播錯誤
- 不要在組件內直接顯示 HTTP 錯誤（應由 Store 處理）

---

### 如何處理分頁和無限滾動？

**推薦方案：**
- Store 狀態包含：`items: T[]`、`hasMore: boolean`、`cursor: string | null`
- 提供 `loadMore()` 方法（使用 rxMethod）
- 組件使用 `@for` 渲染列表 + IntersectionObserver 觸發載入
- 使用 Firestore 的 `startAfter()` 實現游標分頁

**關鍵點：**
- 不要一次性載入所有數據
- 使用虛擬滾動（ng-zorro 的 `cdk-virtual-scroll`）處理大列表
- 分頁參數存在 Store，不依賴路由參數

---

### 如何處理樂觀更新？

**推薦方案：**
- 立即更新本地 Store 狀態（樂觀）
- 同時發起 Firebase 請求
- 如果請求失敗，回滾本地狀態並顯示錯誤

**實作模式（概念）：**
```typescript
// 在 withMethods 內
deleteTask: rxMethod<string>(pipe(
  tap((id) => {
    // 樂觀更新：立即從列表移除
    patchState(store, {
      tasks: store.tasks().filter(t => t.id !== id)
    });
  }),
  switchMap((id) => service.delete(id).pipe(
    tapResponse({
      next: () => {}, // 成功，無需操作
      error: (err) => {
        // 失敗，回滾 + 顯示錯誤
        patchState(store, {
          tasks: originalTasks, // 需提前保存原始數據
          error: err.message
        });
      }
    })
  ))
))
```

---

## 🎓 學習路徑建議

### 初級階段（第 1-2 週）

**目標：** 理解純響應式架構基礎

**學習清單：**
1. Angular Signals 基礎概念
2. signalStore 的基本用法
3. withState、withComputed、withMethods
4. Angular 20+ 控制流語法

**實作練習：**
- 創建簡單的 Counter Store
- 實作 Todo List（CRUD 操作）
- 使用 @if/@for 渲染列表

---

### 中級階段（第 3-4 週）

**目標：** 掌握異步處理和狀態管理

**學習清單：**
1. rxMethod 的背壓處理機制
2. tapResponse 錯誤處理模式
3. Firebase Firestore 整合
4. DDD 分層架構原則

**實作練習：**
- 整合 Firebase 實作用戶認證
- 創建多層級的工作區管理
- 實作文檔 CRUD 與權限控制

---

### 高級階段（第 5-6 週）

**目標：** 架構設計和性能優化

**學習清單：**
1. EventBus 模式解耦複雜依賴
2. Signal 性能優化技巧
3. 樂觀更新和衝突解決
4. 安全規則和權限設計

**實作練習：**
- 設計跨模組的事件通訊
- 實作即時協作功能
- 優化大列表性能
- 設計細粒度權限系統

---

## 🔗 外部資源清單

### 官方文檔（透過 Context7 訪問）

```
# Angular 官方文檔
Context7: resolve-library-id angular/core
Context7: get-library-docs @angular/core latest

# NgRx Signals 官方文檔
Context7: resolve-library-id ngrx/signals
Context7: get-library-docs @ngrx/signals latest

# Firebase 官方文檔
Context7: resolve-library-id angular/fire
Context7: get-library-docs @angular/fire latest

# NG-ZORRO 官方文檔
Context7: resolve-library-id ng-zorro-antd
Context7: get-library-docs ng-zorro-antd latest
```

### 社群資源

- Angular Blog: 追蹤最新特性和最佳實踐
- NgRx GitHub Discussions: 查看實際使用案例
- Firebase YouTube Channel: 學習進階整合技巧
- Angular Discord: 即時問答和社群支援

---

## ✅ 最終確認檢查表

### 專案初始化確認

- [ ] 僅安裝 `@ngrx/signals` 和 `@ngrx/operators`
- [ ] 確認 `package.json` 無 `@ngrx/store` 相關依賴
- [ ] 確認 Angular 版本為 20.x 或以上
- [ ] 確認 TypeScript 版本為 5.9.x 或以上
- [ ] 設定 ESLint 規則禁用 `*ngIf`/`*ngFor`

### 代碼審查確認

- [ ] 所有 Store 使用 `signalStore()`
- [ ] 所有異步操作使用 `rxMethod()`
- [ ] 所有狀態更新使用 `patchState()`
- [ ] 所有模板使用 `@if`/`@for`/`@switch`
- [ ] 組件不直接注入 `Firestore`
- [ ] Domain 層無 Angular/RxJS 依賴
- [ ] 無手動 `subscribe()` 呼叫
- [ ] Store 之間無直接 `inject` 依賴

### 性能確認

- [ ] 大列表使用虛擬滾動
- [ ] Computed 避免昂貴計算
- [ ] `@for` 使用正確的 `track`
- [ ] Firebase 查詢使用索引
- [ ] 圖片使用懶加載

### 安全確認

- [ ] Firebase Security Rules 已配置
- [ ] 敏感操作有權限檢查
- [ ] 用戶輸入有驗證和清理
- [ ] API 密鑰存在環境變數
- [ ] 生產環境關閉開發工具

---

**🎉 恭喜！您已準備好開始純響應式 Angular 20+ 項目開發**

記住三個核心原則：
1. **Context7 First** - 編碼前先查文檔
2. **Reactive Always** - 拒絕命令式思維
3. **Layer Clear** - 嚴格遵守分層邊界