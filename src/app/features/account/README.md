# Account Feature

此目錄負責 **帳戶（Account / Identity）相關功能**，  
定義「我是誰、怎麼登入、如何管理自己」這一層的所有行為。

> Account = Identity  
> 關心 **使用者本身**，不關心他在哪個 Workspace、做哪個業務。

---

## 職責範圍

Account Feature 只處理：
- 身份驗證（Authentication）
- 帳戶安全流程
- 使用者個人資料與偏好設定

不處理：
- Workspace / Module 業務邏輯
- 權限下的實體資料（Entity）
- 跨組織、跨專案狀態

---

## 目錄結構說明

### auth/

處理所有 **登入 / 驗證流程**，通常對應 Firebase Auth 或其他 Identity Provider。

```txt
auth/
├─ login/            使用者登入
├─ logout/           登出與 session 清理
├─ register/         註冊帳戶
├─ verify-email/     Email 驗證
├─ forgot-password/ 忘記密碼請求
└─ reset-password/  密碼重設
````

特性：

* 每個流程一個獨立 Feature
* 不共享 UI 狀態，避免流程污染
* 可獨立 routing、獨立 lazy-load

---

### profile/

```txt
profile/
└─ profile.component.ts
```

用途：

* 使用者個人資訊（顯示 / 編輯）
* 與 Auth 解耦，不直接操作登入流程

---

### settings/

```txt
settings/
└─ settings.component.ts
```

用途：

* 使用者偏好設定（語言、主題、安全選項）
* 僅影響 Account 本身，不影響 Workspace

---

## 設計原則

* **Account 是全域唯一 Identity**
* UI 與 Auth 流程一對一，避免「萬用登入頁」
* 不在此層保存業務資料（Firestore Entity）
* 可在未進入 Workspace 前單獨存在

---

## 與其他層級關係

* **core/**
  提供 Auth Service、Token、Session、Guards

* **features/workspace/**
  在 Account 驗證完成後才進入

* **features/modules/**
  完全不依賴 Account UI，只信任 Identity 狀態

> Account 是入口，不是舞台中央。
