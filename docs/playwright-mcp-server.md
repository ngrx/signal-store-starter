## End-to-End 驗證流程（Playwright MCP）

### A. 認證與前置條件

1. 使用 playwright-mcp-server 啟動端到端測試
2. 導航至 http://localhost:4200/
3. 驗證未驗證狀態下，應自動導向至 /login
4. 在登入頁面輸入測試帳號：
   - Email: ac7x@pm.me
   - Password: 123123
5. 提交登入表單
6. 驗證登入成功條件至少包含以下其一：
   - URL 導向至登入後主頁（如 /dashboard 或 /workspace）
   - 畫面出現使用者識別資訊（如 email、avatar）
   - 認證狀態已建立（localStorage / cookie / auth store）

---

### B. 功能驗證（通用規格）

針對每一個已實施功能，皆需符合以下驗證流程：

1. 從登入後可達的 UI 入口進入該功能
2. 驗證該功能的主要互動流程可正常執行
3. 驗證至少一個可觀察的成功結果，例如：
   - 頁面成功渲染（關鍵元素存在）
   - 資料成功載入或更新
   - 使用者操作後狀態正確改變
4. 確認無未處理錯誤（console error / crash）

---

### C. 測試可擴展性要求

- 新增功能時，需補充對應的：
  - 功能入口
  - 核心操作
  - 成功驗證條件
- 不得修改既有登入流程測試
