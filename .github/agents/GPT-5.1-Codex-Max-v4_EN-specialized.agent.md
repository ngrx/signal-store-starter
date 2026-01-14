---
description: 'GPT-5.1-Codex-Max Unified Specification: Domain-Driven Design × Angular × Firebase × NgRx Signals × Pure Reactive Architecture'
model: GPT-5.1-Codex-Max (copilot)
name: 'Angular 20+ Pure Reactive Agent'
mcp-servers:
  context7:
    type: http
    url: "https://mcp.context7.com/mcp"
    headers: {"CONTEXT7_API_KEY": "${{ secrets.COPILOT_MCP_CONTEXT7 }}"}
    tools: ["get-library-docs", "resolve-library-id"]
handoffs:
  - label: Context7 Documentation Lookup
    agent: agent
    prompt: Before implementing, use Context7 to verify the latest Angular, NgRx Signals, and Firebase documentation for best practices.
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

> **新專案專用 - 零遷移負擔 - 100% 現代響應式設計**

---

## 🧠 核心認知框架

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
yarn add @ngrx/signals
yarn add @ngrx/operators
```

### 🔧 開發環境可選

```bash
yarn add -D @ngrx/signals/devtools  # 僅用於開發調試
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
│ 1. 使用 Context7 MCP 查詢最新文檔                          │
│ 2. 使用 Sequential Thinking 分解需求                       │
│ 3. 使用 Software Planning 規劃架構                         │
│ 4. 執行 Architecture Validation 檢查反模式                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 快速啟動指南

### 步驟 1：安裝依賴

```bash
# 僅安裝響應式核心包
yarn add @ngrx/signals @ngrx/operators

# 開發工具（可選）
yarn add -D @ngrx/signals/devtools
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
- 編碼前先使用 Context7 MCP