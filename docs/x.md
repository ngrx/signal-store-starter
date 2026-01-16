---

# 豆腐渣工程清理計劃 (MCP TODO 清單)

## 1️⃣ Store 層檢查

| 檔案                                            | 行號 | 問題                          | 類型            | 優先級 |
| --------------------------------------------- | -- | --------------------------- | ------------- | --- |
| workspace/stores/members.store.ts             | 全檔 | stub rxMethod 回調無實際邏輯       | 無意義函數         | 高   |
| workspace/stores/overview.store.ts            | 全檔 | 嵌套 computed 信號過多、無實際邏輯      | 無意義函數         | 高   |
| global-shell/stores/layout.store.ts           | 全檔 | 空 effect / patchState 無用    | 無意義函數         | 中   |
| workspace-list/stores/workspace-list.store.ts | 全檔 | 重複功能，與 workspace.store 功能重疊 | 冗餘            | 高   |
| account/stores/*.ts                           | 全檔 | store 初始化不完整、optional 未安全處理 | TypeScript 隱患 | 高   |

---

## 2️⃣ Component / Template 檢查

| 檔案                                              | 行號  | 問題                                     | 類型     | 優先級 |
| ----------------------------------------------- | --- | -------------------------------------- | ------ | --- |
| features/modules/members/members.component.ts   | 420 | parts[0]/parts[1] 可能 undefined         | TS2532 | 高   |
| features/modules/overview/overview.component.ts | 126 | optional chain 使用不當                    | NG8107 | 高   |
| features/shared/components/**/*.ts              | 全檔  | inline template 過長、部分 signal() 調用無效    | 無意義代碼  | 中   |
| features/**/*.html                              | 全檔  | @if/@for/@switch 未完全使用，仍有 *ngIf/*ngFor | 模板不一致  | 中   |

---

## 3️⃣ Domain Model / Export 檢查

| 檔案                            | 行號     | 問題                                                | 類型        | 優先級 |
| ----------------------------- | ------ | ------------------------------------------------- | --------- | --- |
| core/index.ts                 | 78     | 重複 export WorkspaceMember                         | 重複 export | 高   |
| core/index.ts                 | 93,101 | journal.model.ts / settings.model.ts 不存在或非 module | 缺失 export | 高   |
| core/workspace/models/*.ts    | 全檔     | 多個 interface 定義重複                                 | 冗餘接口      | 中   |
| core/global-shell/models/*.ts | 全檔     | 部分 model 直接被 component import                     | 層級違規      | 高   |

---

## 4️⃣ Infrastructure / Service 層檢查

| 檔案                         | 行號 | 問題                           | 類型 | 優先級 |
| -------------------------- | -- | ---------------------------- | -- | --- |
| workspace/services/*.ts    | 全檔 | 多個 store 重複調用 Firebase / API | 冗餘 | 中   |
| global-shell/services/*.ts | 全檔 | Service 方法與 store 重疊         | 冗餘 | 中   |

---

## 5️⃣ 全局規劃 / 優先級

1. **高優先級**：TypeScript 編譯錯誤、NG8107/TS2532、Domain export 重複或缺失
2. **中優先級**：冗餘 stub / effect / withMethods()、層級違規、重複接口
3. **低優先級**：模板統一化、Service 與 Store 重疊

---

## 6️⃣ TODO 清單 (原子化任務)

1. 標記 workspace/members.store.ts 中無意義 rxMethod 回調
2. 標記 workspace/overview.store.ts 中嵌套 computed 無實際邏輯
3. 標記 global-shell/layout.store.ts 空 effect / patchState 無用
4. 標記 workspace-list.store.ts 與 workspace.store 重複功能
5. 檢查 account/stores 初始化與 optional 安全性
6. 標記 members.component.ts 中 parts[0]/parts[1] undefined 風險
7. 標記 overview.component.ts optional chain 不當使用
8. 檢查所有 inline / HTML template，標出 signal() 無用或 *ngIf/*ngFor 遺留
9. 檢查 core/index.ts 中重複 / 缺失 export
10. 檢查 workspace / global-shell models 重複 interface / 層級違規
11. 檢查 Service / Repository 與 Store 重疊調用

---
