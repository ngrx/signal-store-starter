# Environments

此目錄存放專案的環境配置文件，用於區分不同部署環境（開發、測試、正式等）。

## 邊界
- 只包含環境變數與設定檔，例如 API_URL、Feature Flags
- 不存放程式邏輯、UI 組件或服務
- 專案中各模組可引用此目錄的配置，但不應修改此資料夾內文件

## 範例
- `environment.ts`         → 開發環境配置
- `environment.prod.ts`    → 生產環境配置
