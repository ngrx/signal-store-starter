# Modules

此目錄定義「業務模組（Business Modules）」層級，  
用來承載 **Workspace 內的功能領域**，並作為 Feature 與 Entity 之間的清晰邊界。

## 職責定位

Modules 關注的是：
- **做什麼（What）**
- **在什麼業務領域（Domain）**
- **不關心誰登入、也不直接操作底層基礎設施**

## 設計原則

- 一個 Module = 一個明確的業務語意
- 僅組合 Feature / Entity，不處理 Identity
- 狀態以 Signals / Store 為主，避免跨模組耦合
- 可被 Workspace 動態掛載 / 卸載
