# Angular 20+ @angular/fire NgRx 純響應式架構規範文件

## 核心概念層次
Account → Workspace → Module → Entity
身份 → 容器 → 功能 → 狀態

## 身份與認證層 (Account Layer)

Account 代表系統中的身份實體，包含四種類型：
- User：個人用戶
- Organization：組織實體
- Bot：自動化代理
- Subunit：子單位（Team 或 Partner）

技術實作：使用 @angular/fire/auth 處理身份驗證、令牌管理、會話控制和自訂聲明

Team 定義為內部子單位，使用 @angular/fire/firestore 的集合、查詢和安全規則進行管理

Partner 定義為外部子單位，使用 @angular/fire/firestore 進行集合管理、Webhook 綁定和訪問規則控制

## 工作空間層 (Workspace Layer)

Workspace 為邏輯容器，包含：
- Resources：資源管理
- Permissions：權限控制
- Modules：功能模組
- SharedContext：共享上下文

技術實作：使用 @angular/fire/firestore 的文檔、子集合和規則範圍

## 功能模組層 (Module Layer)

Module 代表功能單元和限界上下文，使用 @angular/fire/firestore 的集合組、索引和查詢計劃

系統包含八個核心模組：

### overview 模組
工作空間摘要，包含儀表板、健康狀態和使用情況
技術實作：使用 @angular/fire/firestore 的聚合、計數和查詢功能

### documents 模組
內容管理系統，處理文件、版本和權限
技術實作：
- @angular/fire/storage 處理對象存儲、上傳、下載和元數據
- @angular/fire/firestore 處理索引和引用

### tasks 模組
工作管理系統，處理任務、工作流和狀態
技術實作：使用 @angular/fire/firestore 的事務、批次操作和查詢

### members 模組
身份映射系統，管理用戶、團隊、合作夥伴和角色
技術實作：使用 @angular/fire/firestore 的安全規則、查找和索引

### permissions 模組
訪問控制系統，管理角色、策略和範圍
技術實作：使用 @angular/fire/firestore 的安全規則、自訂聲明和規則測試

### audit 模組
可追溯性系統，管理審計日誌、合規性和歷史記錄
技術實作：使用 @angular/fire/firestore 的只附加模式、TTL 和分區

### settings 模組
配置系統，管理偏好設置、功能標誌和配額
技術實作：使用 @angular/fire/remote-config 的實時配置、緩存和條件控制

### journal 模組
事件日誌系統，管理活動、時間軸和變更日誌
技術實作：使用 @angular/fire/firestore 的變更流、排序和游標

## 實體層 (Entity Layer)

Entity 代表狀態對象，包含數據和行為
技術實作：使用 @angular/fire/firestore 的文檔、實時同步和轉換器

## CQRS 模式

### Command（命令）
表示變更意圖和驗證請求
技術實作：使用 @angular/fire/functions 的可調用函數和認證上下文

### Query（查詢）
表示讀取模型、視圖和投影
技術實作：使用 @angular/fire/firestore 的查詢、快照和轉換器

## 授權與守衛

### Policy（策略）
授權規則，包含範圍、角色和約束
技術實作：使用 @angular/fire/firestore 的安全規則和模擬器

### Permission（權限）
能力定義，指定操作和資源
技術實作：使用 @angular/fire/auth 的自訂聲明

### Guard（守衛）
運行時執行，包含訪問控制、配額和速率限制
技術實作：使用 @angular/fire 的 authGuard、路由守衛和聲明檢查

## 事件驅動架構

### SharedContext（共享上下文）
跨模組上下文，包含事件總線、架構、契約和語義
技術實作：使用 @angular/fire/firestore 的共享集合和架構版本控制

### EventBus（事件總線）
核心骨幹，實現跨模組通信和解耦
技術實作：使用 @angular/fire/functions 的 PubSub 觸發器和事件橋接

### EventFlow（事件流）
流處理，包含方向、順序和背壓
技術實作：使用 @angular/fire/functions 的背景觸發器和重試策略

### EventStore（事件存儲）
持久化層，實現只附加、重放和快照
技術實作：使用 @angular/fire/firestore 的不可變日誌和快照文檔

### EventBusType（事件總線類型）
支援內存、消息隊列和流
技術實作：使用 @angular/fire/functions 的 PubSub 和調度器

### EventPayload（事件負載）
領域數據，包含狀態變更、意圖和事實
技術實作：使用 @angular/fire/firestore 的序列化器和轉換器

### EventMetadata（事件元數據）
包含追蹤、關聯、版本、時間戳、生產者和架構
技術實作：使用 @angular/fire/firestore 的字段轉換和服務器時間戳

### EventLifecycle（事件生命週期）
Created → Validated → Published → Consumed → Archived
技術實作：使用 @angular/fire/functions 的管道

### EventSemantics（事件語義）
管理含義、契約、兼容性和演化
技術實作：使用 @angular/fire/firestore 的架構版本控制

### EventSourcing（事件溯源）
從事件派生狀態
技術實作：使用 @angular/fire/firestore 的事件重放和游標查詢

### CausalityTracking（因果追蹤）
包含 CorrelationId、CausationId 和追蹤鏈
技術實作：使用 @angular/fire/functions 的上下文傳播

## 可觀測性

### Metric（指標）
測量吞吐量、延遲、錯誤率和飽和度
技術實作：使用 @angular/fire/performance 的追蹤和指標

### Log（日誌）
結構化記錄，包含審計、調試、安全和業務日誌
技術實作：使用 @angular/fire/analytics 的事件和參數

### Health（健康檢查）
探針檢查，包含存活性、就緒性、依賴性和降級
技術實作：使用 @angular/fire/functions 的健康檢查端點

## 技術堆疊

### 認證堆疊（不使用 @delon）
@angular/fire/auth 處理認證和身份提供者
直接使用 Angular Router Guards 進行路由保護
直接使用 HTTP Interceptors 進行令牌處理

### 數據堆疊
@angular/fire/firestore 處理數據庫、查詢和離線支援
@angular/fire/storage 處理對象存儲、上傳和下載

### 狀態管理堆疊
- @ngrx/store：全局狀態、Reducer 和 Selector
- @ngrx/effects：副作用、異步流和整合
- @ngrx/entity：正規化、適配器和 CRUD
- @ngrx/router-store：路由狀態和同步
- @ngrx/component-store：本地狀態和隔離
- @ngrx/store-devtools：時間旅行、調試和追蹤

## NgRx 架構邊界

UI 層通過 Command 和 Query 與 Store 通信
Store 通過 Reducer 和 Selector 管理狀態
Effect 處理 IO 和整合
EventBus 處理發布和消費

## NgRx 嚴格規則

1. 組件不直接執行 IO 操作
2. Reducer 不執行副作用
3. 禁止跨模組直接訪問狀態
4. 禁止直接修改 Store
5. 禁止循環功能依賴

## NgRx 映射關係

- Workspace → FeatureShell
- Module → FeatureSlice
- Entity → EntityAdapter
- Command → Action
- Query → Selector
- Event → EffectStream
- Policy → GuardSelector

## 狀態層次

### GlobalShell（全局外殼）
管理 Auth、Config、Layout 和 Router
技術實作：@angular/fire/auth + @angular/fire/remote-config

### WorkspaceScope（工作空間範圍）
管理 Context、Permission 和 Preference
技術實作：@angular/fire/firestore

### FeatureSlice（功能切片）
管理模組狀態
技術實作：@angular/fire/firestore 的查詢同步

### EntityCache（實體緩存）
使用 NgRx EntityAdapter
技術實作：@angular/fire/firestore 的本地緩存

## API 層

使用 @angular/fire 的：
- Firestore 查詢
- 可調用函數
- 安全規則
- 架構網關

## 整合層

使用 @angular/fire 的：
- Cloud Function Webhook
- 調度器
- PubSub
- 擴展

## 緩存層

使用 @angular/fire 的：
- 離線緩存
- IndexedDB
- 內存緩存
- TTL

## 配置層

使用 @angular/fire 的：
- Remote Config
- 環境配置
- Secret Manager

## 功能開關

使用 @angular/fire 的：
- Remote Config 標誌
- A/B 測試
- 漸進式推出