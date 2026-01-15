# Copilot Instructions

---

## 1. 基本概念 (Fundamentals)

### Copilot Memory Commands
1. store_memory: 儲存目前對話內容至記憶體。
1. retrieve_memory: 從記憶體中檢索相關資訊以供參考。
1. list_memory: 列出記憶體中所有儲存的條目。
1. update_memory: 更新記憶體中已儲存的內容。
1. search_memory: 根據關鍵字搜尋記憶體中的內容。
1. tag_memory: 為記憶體中的條目添加標籤以便分類。
1. summarize_memory: 產生記憶體內容的摘要以便快速參考。
1. prioritize_memory: 根據重要性排序記憶體中的條目。
1. archive_memory: 將不常用的記憶體條目進行封存以節省空間。
1. restore_memory: 從封存中還原記憶體條目。
1. lock_memory: 鎖定特定記憶體條目以防止修改。
1. unlock_memory: 解鎖已鎖定的記憶體條目。
1. annotate_memory: 為記憶體條目添加註解以提供更多上下文資訊。
1. categorize_memory: 將記憶體條目分類以便組織。
1. filter_memory: 根據條件篩選記憶體中的內容。
1. visualize_memory: 以圖形化方式呈現記憶體內容以便理解。
1. optimize_memory: 優化記憶體使用以提升效能。
1. purge_memory: 定期清理過期或不必要的記憶體內容。

### Copilot Behavior Guidelines
1. 必須使用 context7 策略來管理對話上下文，同時透過 "resolve-library-id" 指令解析函式庫的唯一識別碼，並使用 "get-library-docs" 指令抓取該函式庫的文件資料，以便在多輪交互中保持精確的上下文和完整的參考信息。
1. 必須使用 server-sequential-thinking 策略處理複雜任務。
1. 必須使用 Software-planning-mcp 策略規劃軟體開發任務。

### Angular 20 + NgRx Signals Overview
1. 使用 **NgRx Signals (`@ngrx/signals`)** 管理應用程式狀態
   * 應用程式狀態必須以 `signalStore` 為唯一事實來源（Single Source of Truth）。
   * 嚴禁使用傳統 NgRx（actions / reducers / effects）。
   * 每個 Domain（User / Org / Team / Partner / Menu）必須有各自獨立的 store。
1. 使用 **Signals 原生機制** 處理狀態變更與副作用
   * 狀態變更必須透過 `patchState`。
   * 衍生狀態必須使用 `computed()`。
   * 副作用必須使用 `effect()`，且：
     * 不得直接修改 state
     * 不得包含業務邏輯
   * 非同步流程以 `async / await + service` 為主。
1. **禁止使用 NgRx Operators 與 Action Streams**
   * 不得使用 `ofType`、`switchMap`、`concatMap` 等 NgRx/RxJS operator 來管理狀態流程。
   * Signals 不得被當作 Observable 使用。
1. **禁止使用 NgRx Schematics**
   * 專案不得使用 NgRx Schematics 產生程式碼。
   * 所有 `signalStore` 必須手動撰寫，以確保結構清晰與責任明確。
1. **不使用 NgRx Data，CRUD 由 Signals Store + Service 負責**
   * 所有 CRUD 行為必須：
     * 由 service 封裝 API 存取
     * 由 `signalStore` 協調狀態更新
   * 不得引入 NgRx Entity / Data 抽象層。
1. **元件級狀態優先使用 Angular Signals**
   * 元件內 UI state（open / loading / selectedId）必須使用 `signal()`。
   * 禁止為單一元件建立 Component Store。
   * 僅當狀態需跨元件共享時，才提升至 `signalStore`。
1. 採用 **Signals Best Practices**
   * 明確區分：
     * **Domain State**（業務資料）
     * **UI State**（顯示 / 互動狀態）
   * 一個 store 只負責一個 domain。
   * 禁止在 component 中直接修改 domain state。
1. 採用 **Signals 設計模式（Patterns）**
   * Facade Pattern → `signalStore`
   * Derived State → `computed`
   * Side Effects → `effect + service`
   * Context Switching → 獨立 Context Store
1. 避免 **Signals Anti-Patterns**
   * ❌ 單一 store 管理多個 domain
   * ❌ 在 `effect()` 中直接 `patchState`
   * ❌ 在 component 中混合 UI 與 domain 邏輯
   * ❌ 將 signals 當成 RxJS streams 使用
1. 使用 **NgRx Migration 指南（僅限遷移用途）**
    * 僅用於：
      * 將既有 NgRx Store / Effects 遷移至 Signals
    * 遷移完成後不得保留任何舊 NgRx 架構。
1. 參考 **NgRx 官方文件與社群資源**
    * 僅作為學習與設計參考
    * 不得直接複製過時（pre-signals）的範例架構。
1. 優先參考 **Signals 導向的官方與實戰示例**
    * 僅採用：
      * Angular 17+ / 20
      * Standalone API
      * Signals 為核心的示例
1. 🔒 強制規範總結（一句話版）
    > **本專案僅允許 Angular Signals + NgRx Signals，全面禁止傳統 NgRx 架構與抽象層。**

### Domain-Driven Design Overview
1. 聚合應封裝完整業務邏輯與不變式。
1. 使用限界上下文隔離不同業務領域。
1. 聚合內部狀態只能透過命令與事件變更。

### Event-Driven Architecture Overview
1. 優先事件驅動設計以提升系統解耦性。
1. 事件為系統狀態變更的唯一來源。
1. 所有事件需附帶時間戳與版本資訊。

### CQRS Overview
1. 使用 CQRS 分離讀寫模型以提升效能。
1. 讀模型僅包含查詢所需的資料。
1. 讀寫操作分離以提升效能與可擴展性。
1. 投影需定期重建以確保資料一致性。

### Command → Event → Policy Flow Overview
1. 命令處理器負責驗證與執行命令。
1. 命令觸發事件，事件驅動政策執行。

### Core Engine / Platform Adapter / UI Overview
1. Core Engine 負責事件流、命令處理與政策執行。
1. Platform Adapter 負責外部系統整合與通訊。
1. UI 僅負責呈現與互動，僅透過 facade/adapters 呼叫 domain，絕不可包含業務邏輯。

### System Mission & Core Values
1. 保持系統穩定性與可用性為首要目標。
1. 優先考量使用者體驗與資料安全。
1. 強調可維護性與可擴展性設計。

### Semantic Hierarchy
1. 以業務語意為核心設計系統結構。
1. 保持事件、命令、聚合之間的清晰界限。
1. 使用描述性命名提升程式碼可讀性。
1. 避免使用泛稱如 data、info、handler。
1. 聚合與模組應保持單一職責，避免過度負載。

### Core Logic vs Business Logic
1. 優先可回滾的變更，提交應能快速回退。
1. 保持向後相容，避免破壞既有 API。

---

## 1. 邊界 (Boundaries)

### Workspace / Module / Entity Boundaries
1. Workspace 為主要協作單位，Module 為功能單元，Entity 為業務狀態。
1. 不得將身份（Account / Organization）建模為 Workspace 或 Module 的一部分。
1. 禁止跨聚合直接修改狀態，須透過事件或命令溝通。
1. 聚合間通訊應使用事件或命令，避免直接依賴。
1. 禁止跨層直接存取，須透過明確定義的介面或適配器。
1. 使用防腐層隔離外部系統與核心業務邏輯。
1. UI 僅透過明確定義的介面與 Domain 互動，絕不可直接存取事件存儲。
1. 禁止在 UI 層執行業務邏輯或狀態變更。
1. 禁止 Domain 層直接存取基礎設施或 UI 元件。

### Domain / Infrastructure / UI Separation
1. Domain 僅包含業務邏輯，Infrastructure 處理 I/O，UI 負責呈現與互動。
1. 使用防腐層隔離外部系統與核心業務邏輯。

### Aggregate / Event / Command Isolation
1. 聚合內部狀態只能透過命令與事件變更。
1. 禁止跨聚合直接修改狀態，須透過事件或命令溝通。

### Forbidden Access / Anti-Corruption Layer
1. 禁止跨層直接存取，須透過明確定義的介面或適配器。
1. 禁止事件處理器中執行長時間運行的操作。
1. 避免事件與命令間的循環依賴，保持清晰界限。

### Frontend / Backend Separation
1. 所有跨層 imports 必須在 PR 中說明理由。
1. Facade / Port 介面需明確命名並文件化。
1. Domain 層不得執行 I/O 或持久化操作。
1. Adapter 只做模型映射、轉換與外部呼叫。

---

## 1. 架構 (Architecture)

### Domain-Driven Design Principles
1. 聚合應保持單一職責並封裝業務邏輯。
1. 聚合內部狀態只能透過命令與事件變更。
1. 聚合根負責維護不變式與業務規則。
1. 使用限界上下文隔離不同業務領域。

### Event-Driven / Event Sourcing Architecture
1. 優先事件驅動設計以提升系統解耦性。
1. 事件為系統狀態變更的唯一來源。
1. 所有事件需附帶時間戳與版本資訊。

### CQRS / Read Models / Projection
1. 使用 CQRS 分離讀寫模型以提升效能。
1. 讀模型僅包含查詢所需的資料。
1. 投影需定期重建以確保資料一致性。

### Command → Event → Policy Flow
1. 命令處理器負責驗證與執行命令。
1. 命令觸發事件，事件驅動政策執行。

### Core Engine / Platform Adapter / UI Responsibilities
1. Core Engine 負責事件流、命令處理與政策執行。
1. Platform Adapter 負責外部系統的整合與通訊。
1. UI 僅負責呈現與互動，僅透過 facade/adapters 呼叫 domain，絕不可包含業務邏輯。

### Event Versioning & Schema Evolution
1. 使用 schema 管理事件結構的演進。
1. 事件版本變更需明確標示與相容策略。

---

## 1. 責任 (Responsibilities)

### Domain Responsibilities
1. 聚合根負責維護不變式與業務規則。
1. 使用限界上下文隔離不同業務領域。

### Aggregate / Event Responsibilities
1. 聚合負責維護其不變式與業務邏輯。
1. 事件負責描述狀態變更的語意與上下文。

### Workspace / Module Responsibilities
1. Workspace 負責協調多個 Module 的互動。
1. Module 負責實現特定業務功能與規則。

### Core Engine Responsibilities
1. 管理事件流、命令處理與政策執行。
1. 提供穩定的基礎設施服務與工具支援。

### Platform Adapter Responsibilities
1. 負責外部系統的整合與通訊。
1. 實現防腐層以保護核心業務邏輯。

### UI Responsibilities
1. 負責使用者介面的呈現與互動。
1. 僅透過明確定義的介面與 Domain 互動。

### SaaS / Account Domain Responsibilities
1. 管理使用者帳號、組織與權限。
1. 確保身分驗證與授權的安全性。

### Copilot / Developer Responsibilities
1. Domain 層不得執行 I/O 或持久化。
1. Adapter 只做模型映射、轉換與外部呼叫。

---

## 1. 功能 / 能力 (Capabilities)
1. 聚合應封裝完整業務邏輯與不變式。
1. 事件需具備完整語意並支援版本控制。
1. DTO/介面採最小欄位原則並明確可序列化。

---

## 1. 規範 (Guidelines / Rules)
1. 命名應具語意且遵循語言慣例。
1. 提交訊息應採用 Conventional Commits 格式。
1. 聚合應保持單一職責並封裝業務邏輯。
1. 事件名稱應反映業務語意並具描述性，事件結構應包含必要的 metadata 與版本資訊。
1. 命令名稱應清晰描述意圖與操作，政策名稱應反映其觸發條件與行為。
1. ViewModel 應僅包含 UI 所需的狀態與資料，投影應定期重建以確保資料一致性。
1. 事件版本變更需明確標示與相容策略。

---

## 1. 反模式 (Anti-Patterns / Do-Not)

### Cross-Aggregate Direct Modification
1. 禁止跨聚合直接修改狀態，須透過事件或命令溝通。
1. 聚合間通訊應使用事件或命令，避免直接依賴。

### UI Direct Domain / Event Store Access
1. UI 僅透過明確定義的介面與 Domain 互動，絕不可直接存取事件存儲。
1. 禁止在 UI 層執行業務邏輯或狀態變更。
1. Domain 層不得執行 I/O 或持久化操作。
1. Adapter 只做模型映射、轉換與外部呼叫。

### Domain Direct Infrastructure Access
1. 禁止 Domain 層直接存取基礎設施或 UI 元件。
1. 使用防腐層隔離外部系統與核心業務邏輯。

### Hidden Side-Effects / Circular Causality
1. 禁止事件處理器中執行長時間運行的操作。
1. 避免事件與命令間的循環依賴，保持清晰界限。

### Generic Naming (data / info / handler)
1. 命名應具語意且遵循語言慣例，避免使用泛稱如 data、info、handler。

### Mixing Business vs Technical Events
1. 清晰區分業務事件與技術事件，避免混淆。

### Overloading Aggregates / Modules
1. 聚合與模組應保持單一職責，避免過度負載。
1. 不留臨時或半成品於 PR（如臨時 feature flags）。
1. 減少對全域狀態與單例的依賴。

---

## 1. 開發 / Copilot 行為指引

### Generation Constraints
1. 自動產生的程式碼需標註來源與範圍。
1. 範例與示範應遵守最小權限原則。

### Incomplete Context Handling
1. 當上下文不足時，產出程式碼骨架或 TODO 標記。
1. 避免假設缺失的 Domain 概念，必要時提出問題。

### Skeleton / TODO when context is insufficient
1. 當上下文不足時，產出程式碼骨架或 TODO 標記。
1. 避免假設缺失的 Domain 概念，必要時提出問題。

---

## 1. 測試與驗證 (Testing / Validation)
1. 使用事件重播驗證投影與讀模型的一致性。
1. 聚合不變式必須在單元測試中嚴格驗證。
1. 邊界與錯誤情境必須被測試覆蓋。
1. 使用 mock 分離外部依賴，保持測試穩定。

---

## 1. 文件化與審計 (Documentation / Audit)
1. 聚合與模組需附帶簡要文件說明其責任與行為。
1. 事件、命令與政策需附帶語意說明與使用範例。
1. 任何 Breaking Change 必須附上 migration 指南。
1. 事件格式變更需記錄版本與向後相容性說明。

---

## 1. 效能與最佳化 (Performance / Optimization)
1. 使用事件批次處理提升吞吐量。
1. 實施事件去重與壓縮以降低存儲需求。
1. 投影優化需以基準測試驗證主要效能成效。
1. 實施重試策略與斷路器以提升系統韌性。

---

## 1. 最終原則 (Final Principles)
1. 優先可讀性與維護性，避免過度複雜化。
1. 優先語意正確，避免快速但不準確的實作。
1. 優先事件的可解釋性，避免黑箱操作。
1. 優先保守變更以降低風險，對外 API 變更須有版本控制與相容策略。

---

## 1. 專案指引 (Project-Specific Guidelines)
1. 奧卡姆剃刀原則：在多種解決方案中，選擇最簡單且能滿足需求的方案。
1. 極簡主義：避免不必要的複雜性與過度設計，專注於核心功能。
1. PNPM 作為主要套件管理工具。
1. 代碼必須無 TypeScript 錯誤，能通過 pnpm build，且無未使用的 import 或變數。
1. 禁止保留 TODO、FIXME、或暫存佔位碼；必要時產出小而增量的變更。
1. UI 只負責呈現與互動，僅透過 facade/adapters 呼叫 domain，絕不可包含業務邏輯。
1. Organization / Account / User 等身分 Aggregate 僅屬於 account-domain，不得在其他 domain 建立或修改。
1. 事件系統由 core-engine 管理，UI/Adapter 不可直接操作事件。
1. 禁止將敏感憑證或密碼寫入程式碼；所有秘密請從環境變數或祕密管理讀取。
1. 變更後立即執行靜態分析與安全掃描；若工具不可用，回報並詢問是否安裝。
1. 每次跨層移動或重構時，先在對話中列出「搬移清單」與回滾計畫。
1. PR 需註明 pnpm build 結果或重現步驟。
1. 新增依賴時需列出安全與維護風險評估。

---

## 1. workspace / module / entity boundaries
1. Workspace 為主要協作單位，Module 為功能單元，Entity 為業務狀態。
1. 不得將身份（Account / Organization）建模為 Workspace 或 Module 的一部分。
1. 禁止跨聚合直接修改狀態，須透過事件或命令溝通。
1. 聚合間通訊應使用事件或命令，避免直接依賴。
1. 禁止跨層直接存取，須透過明確定義的介面或適配器。
1. 使用防腐層隔離外部系統與核心業務邏輯。
1. UI 僅透過明確定義的介面與 Domain 互動，絕不可直接存取事件存儲。
1. 禁止在 UI 層執行業務邏輯或狀態變更。
1. 禁止 Domain 層直接存取基礎設施或 UI 元件.
1. Facade / Port 介面需明確命名並文件化。
1. Domain 層不得執行 I/O 或持久化操作.
1. Adapter 只做模型映射、轉換與外部呼叫.

## 1. 因果事件(Causality in Event-Driven Systems)/ NgRx Signals 指引

### 1. NgRx / Event Flow Guidelines
1. 命令處理器負責驗證與執行命令。
### 1. NgRx / Event Store Guidelines
1. 優先事件驅動設計以提升系統解耦性。
### 1. NgRx / EventBus Guidelines
1. 事件為系統狀態變更的唯一來源。
1. 嚴禁使用傳統 NgRx（actions / reducers / effects）。
1. 每個 Domain（User / Org / Team / Partner / Menu）必須有各自獨立的 store。
1. 使用 **Signals 原生機制** 處理狀態變更與副作用
### 1. NgRx / Event Types Guidelines
1. 事件名稱應反映業務語意並具描述性，事件結構應包含必要的 metadata 與版本資訊。
### 1. NgRx / Event Payload Guidelines
1. 事件需具備完整語意並支援版本控制。
### 1. NgRx / Event Metadata Guidelines
1. 所有事件需附帶時間戳與版本資訊。
### 1. NgRx / Event Lifecycle Guidelines
1. 使用事件批次處理提升吞吐量。
### 1. NgRx / Event Semantics Guidelines
1. 清晰區分業務事件與技術事件，避免混淆。
### 1. NgRx / Event Sourcing Guidelines
1. 事件為系統狀態變更的唯一來源。
### 1. NgRx / Causation Tracking Guidelines
1. 避免事件與命令間的循環依賴，保持清晰界限。
### 1. NgRx / Event Versioning Guidelines
1. 事件版本變更需明確標示與相容策略。
### 1. NgRx / Event Handling Guidelines
1. 禁止事件處理器中執行長時間運行的操作。
### 1. NgRx / Event Replay Guidelines
1. 使用事件重播驗證投影與讀模型的一致性。
### 1. NgRx / Event Testing Guidelines
1. 聚合不變式必須在單元測試中嚴格驗證。