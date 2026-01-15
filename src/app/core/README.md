# Core

此目錄存放專案核心模組和服務，負責全局應用狀態與基礎功能。

## 邊界
- 核心模組提供全局可共用功能，但不包含特定 UI feature
- 應保持穩定，盡量少變動
- Feature 模組可以依賴 core，但 core 不應依賴 feature

## 常見子目錄
- auth/          → 認證服務、Session 管理
- account/       → 全局使用者資料管理
- workspace/     → Workspace 狀態管理
- team/          → 團隊資料與狀態
- project/       → 專案資料與狀態
- organization/  → 組織資料管理
- partner/       → 外部夥伴管理
- modules/       → 核心模組管理
- context/       → 全局上下文管理
- event-bus/     → 事件總線
- index.ts       → 導出核心功能
