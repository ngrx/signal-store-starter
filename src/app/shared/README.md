# Shared

此目錄存放專案中可重用的組件、型別、服務、工具與其他共用資源。

## 邊界
- 僅存放 **全局可重用資源**，不包含特定 feature 的業務邏輯
- 可被多個 feature 或 core 模組引用
- 職責分離，保持單一用途

## 常見子目錄
- components/    → 可重用 UI 組件
- layouts/       → App Header / Footer / Sidebar 等通用布局
- services/      → 全局 service (AvatarService, MenuService)
- models/        → TypeScript 型別 / interface / DTO
- enums/         → 列舉型別
- constants/     → 常量
- directives/    → 自訂 directive
- pipes/         → 自訂 pipe
- validators/    → 表單驗證
- utils/         → 工具函數
- interceptors/  → HttpInterceptor
- guards/        → Route Guard
- configs/       → 前端設定 / JSON
