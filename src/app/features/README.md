# Features

此目錄存放專案各功能模組（Feature Module），代表具體業務或頁面功能。

## 邊界
- 每個子目錄代表一個 feature，例如 auth、dashboard、workspace
- Feature 模組應只處理自己業務邏輯，不直接管理 core 或 shared 的全局狀態
- 可以引用 shared 或 core 中的資源，但不應修改其他 feature 的內部實現

## 常見子目錄
- auth/          → 登入、註冊、登出等認證功能
- dashboard/     → 儀表板及統計頁面
- workspace/     → Workspace 相關功能
- modules/       → 模組化功能
- account/       → 使用者帳號相關頁面
