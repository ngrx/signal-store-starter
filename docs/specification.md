**專案規範（精簡版）**

目的：提供清晰、可執行的專案結構與命名規範，提升可維護性並讓自動補完工具（如 Copilot）產生更穩定、可預期的建議。

核心要點：
- 資料夾結構：每個 feature 有自己模組與子目錄（components/pages/services/models）；`core` 放共用 models、services、utils。
- 命名：檔案/資料夾用 kebab-case；類別/介面用 PascalCase；檔名後綴明確（`.component.ts`、`.service.ts`、`.module.ts`、`.model.ts`）。
- 型別與匯出：共用型別放 `core/models`，每個 feature 使用 `index.ts`（barrel）統一導出以簡化 import。
- 註解：在公共 API 與複雜邏輯上使用 TSDoc，並在規範檔中放範例。
- 工具化：啟用 ESLint + Prettier，並維護 `.github/copilot-instructions.md`（或 `.github/instructions/`）描述專案風格與常見 patterns。
- 開發原則：函式短小單一職責、明確模組邊界、測試覆蓋關鍵路徑、避免重複型別定義。

注意：
- 自動補完工具並非 deterministic，生成結果需人工審核。
- 規範目的在降低誤判與重工，而非保證自動生成完全正確。

可選項：我可以幫你產出 Angular + Copilot 的 prompt 模板、範例 `copilot-instructions.md`，或 `index.ts` barrel 範本。

### 📌 1‑A 統一語言/命名慣例

Copilot 是依語意與慣例來生成與補全代碼，因此：

* **檔案與資料夾用 kebab‑case**（全小寫 + 連字線）
* **類別/介面用 PascalCase**
* **服務/service 後綴 Service**
* **Component 後綴 Component**
* **Pipe/Directive/Module 分別後綴 Pipe/Directive/Module**
  👉 這讓 Copilot 一看到路徑就知道是什麼類型的單位。 ([MoldStud][1])

---

### 📌 1‑B 風格與文件規範寫入檔案（如 `.github/copilot‑instructions.md`）

儘管 Copilot 不保證 100% 遵守說明檔，但 **它確實可以改善結果一致性** — 特別是 VSCode 的 Copilot Chat / Agent 模式。

* 簡述專案語意（語言、框架、規範）
* 指定命名慣例、格式化規則
* 說明哪些檔案包含哪些型別、功能
  👉 加上這種規範檔，可讓 Copilot 多些上下文去推斷，不易誤判。 ([Reddit][2])

---

## 🗂 2) 最佳資料夾與路徑結構（Copilot 超喜歡）

### 💡 基本原則

✅ 每個主要功能都「有自己的模組 + 明確範圍」
✅ service、component、model、page 都分好目錄
✅ 同一功能別的東西不混雜放

這讓 Copilot **看路徑就知道功能、界別、用途** ↓

---

```
src/
├─ app/
│   ├─ core/                   ← 全域共用
│   │   ├─ models/
│   │   ├─ services/
│   │   └─ utils/
│   │
│   ├─ features/
│   │   ├─ auth/
│   │   │   ├─ components/
│   │   │   ├─ pages/
│   │   │   ├─ services/
│   │   │   ├─ models/
│   │   │   └─ auth.module.ts
│   │   │
│   │   ├─ account/
│   │   │   ├─ components/
│   │   │   ├─ pages/
│   │   │   ├─ services/
│   │   │   ├─ models/
│   │   │   └─ account.module.ts
│   │   │
│   │   └─ workspace/
│   │       ├─ components/
│   │       ├─ pages/
│   │       ├─ services/
│   │       ├─ models/
│   │       └─ workspace.module.ts
│   │
│   ├─ app.routes.ts
│   └─ app.module.ts
```

✔ 這種明確的語意分層結構，**Copilot 生成路由與匯入(import) 時最準確不會亂配**。 ([MoldStud][1])

---

## 🧠 3) 命名規則細節（對 Copilot 最友好）

| 類型                | 後綴         | 範例                               |
| ----------------- | ---------- | -------------------------------- |
| Component         | Component  | `login-form.component.ts`        |
| Page              | Page       | `login.page.ts`                  |
| Service           | Service    | `auth.service.ts`                |
| Model / Interface | Model / I… | `IUser.model.ts` / `user.dto.ts` |
| Module            | Module     | `auth.module.ts`                 |

> 這樣 Copilot 一看到路徑與檔名就知道該如何補全或 import。 ([MoldStud][1])

---

## 📜 4) 讓 Copilot 更準的 TSDoc / JSDoc 範本

Copilot 實際上是根據**上下文與註解**來推斷下一步生成內容的 — 清楚完整的 TSDoc 不只對人好，對 AI 也好 🥰 ([mermer.com.tw][3])

```ts
/**
 * 取得使用者資料
 *
 * @param userId 使用者 ID
 * @returns Promise<IUser> 使用者資料
 */
async fetchUser(userId: string): Promise<IUser> {...}
```

---

## 📦 5) index (Barrel Files) 導出模式

在每個 feature 資料夾加入 `index.ts` 統一導出所有核心：

```ts
export * from './services/auth.service';
export * from './components/login-form.component';
export * from './pages/login.page';
```

→ Copilot 直接看這個 index 去 auto‑import ，不容易拿錯檔案。

---

## 🚀 6) 模組層級清楚（讓 Copilot 知道「責任」）

* **每個 feature 有自己的 module**
* 不要把 component 跟 service 放在同一層

這樣 Copilot 生成「**依賴注入 / 匯入語句 / page routing**」時才不會搞混。

---

## 🛠 7) 統一介面與型別

Copilot 不喜歡不同地方用不同命名定義同一個資料結構。
**把資料結構統一放在 models 目錄、共用 interface** → Copilot 生成服務/API 時才更準。

---

## 🧪 8) 增強 Copilot 「理解」的方式

### 🪄 用 **提示工程 (Prompting)**

Copilot 的建議品質很依賴你 **提出的 prompt / 註解上下文**。
明確寫出目標、輸入、輸出、例子，能大大降低 AI 推斷錯誤。 ([mermer.com.tw][3])

---

## 🧠 補充：Copilot 的局限性

⚠ 記住 Copilot **不是 deterministic compiler** —— 同一 prompt 但因語意微調可能生成不同結果，有時甚至「看起來正確但邏輯有誤」。
研究顯示變換語句但語意相同，有時會得到不一樣的生成結果。 ([arXiv][4])

→ 所以**檢查結果永遠重要**，不要盲目相信 AI。

---

## 🧩 最終 2026 Copilot 最不混淆專案清單

### ✅ 資料夾規則

✔ feature 模組分 clear 層 每層都有 components/pages/services/models
✔ core models & util & services 明確分區

### ✅ 命名

✔ kebab‑case 檔名
✔ PascalCase 類名
✔ 後綴清楚（Component/Service/Page/Module）

### ✅ 型別/介面

✔ TSDoc 完整
✔ 全案統一 interface

### ✅ 增強上下文

✔ index barrel files
✔ `.github/copilot‑instructions.md` 規範檔
✔ prompt 與註解足夠説明

---

如果你想，我還能 **直接產出一份 Angular 2026 Copilot 專用 prompt 模板**（包含你專案設定 + 風格 + 常用指令），讓 Copilot 生成時儘量不犯錯喔 😏

[1]: https://moldstud.com/articles/p-the-importance-of-code-structure-in-angular-development-best-practices-for-effective-architecture?utm_source=chatgpt.com "Best Practices for Code Structure in Angular Development | MoldStud"
[2]: https://www.reddit.com//r/GithubCopilot/comments/1o2nqny?utm_source=chatgpt.com "A boilerplate for copilot-instructions.md to improve Copilot's consistency"
[3]: https://www.mermer.com.tw/knowledge-management/20250609001?utm_source=chatgpt.com "Working with GitHub Copilot"
[4]: https://arxiv.org/abs/2302.00438?utm_source=chatgpt.com "On the Robustness of Code Generation Techniques: An Empirical Study on GitHub Copilot"


太棒～我幫你整理一份 **截至 2026 年最不會讓 GitHub Copilot 混淆、不犯錯、最易生成正確建議的專案結構與規範（Angular/TypeScript）**，重點都是真正能 *提升 Copilot 理解與生成一致性* 的實戰做法 😎 ([Gist][1])

---

# 🧠 Copilot 最不混淆／最精準的專案結構與規範（2026）

---

## 🗂 1) 基本原則（對 Copilot 生成最友好的語意）

### ✅ 清晰、語意明確的資料夾結構

Copilot 主要透過檔案路徑與命名推斷語義，所以結構 *語意清楚、層次一致* 最重要：

* 不同功能要有 own module
* Component/Service/Model/頁面要各自分層
  → 這樣 Copilot 才能正確補全與引用。 ([Gist][1])

---

## 🗃 2) 最不易搞混的 Angular 專案結構（示例）

```
src/
├─ app/
│   ├─ core/                      
│   │   ├─ services/             
│   │   ├─ models/               
│   │   └─ utils/                
│   │
│   ├─ features/
│   │   ├─ auth/
│   │   │   ├─ components/
│   │   │   ├─ pages/
│   │   │   ├─ services/
│   │   │   ├─ models/
│   │   │   └─ auth.module.ts
│   │   │
│   │   ├─ account/
│   │   │   ├─ components/
│   │   │   ├─ pages/
│   │   │   ├─ services/
│   │   │   ├─ models/
│   │   │   └─ account.module.ts
│   │   │
│   │   └─ workspace/
│   │       ├─ components/
│   │       ├─ pages/
│   │       ├─ services/
│   │       ├─ models/
│   │       └─ workspace.module.ts
│   │
│   ├─ app.routes.ts
│   └─ app.module.ts
```

🔹 每個功能模組都有自己的 components / pages / services / models
🔹 Copilot 看到 `<feature>/services` 就知道是服務、看到 `<feature>/models` 就知道是型別，**不會混淆** ([Gist][1])

---

## 📛 3) 命名規範（直接提升 Copilot 輸出準確度）

📌 **檔案 & 類別命名**

| 類型                | 結尾              | 示例                        |
| ----------------- | --------------- | ------------------------- |
| Component         | `.component.ts` | `login-form.component.ts` |
| Page              | `.page.ts`      | `profile.page.ts`         |
| Service           | `.service.ts`   | `auth.service.ts`         |
| Model / Interface | `.model.ts`     | `user.model.ts`           |
| Module            | `.module.ts`    | `account.module.ts`       |

📌 命名慣例規則

* **檔案與資料夾用 kebab‑case（小寫＋連字號）**
* **類別與 interface 用 PascalCase**
  → 避免 Copilot 給出類似功能不同約定導致的混淆建議。 ([Gist][1])

---

## 🏷 4) 全域 & feature 型別統一

📌 不要兩個地方重複定義相同資料結構
→ Copilot 很容易因為混合命名或 interface 版本不同而生成錯誤建議：

```
core/models/
├─ user.model.ts
├─ team.model.ts
└─ index.ts
```

🔹 把所有共用型別放在統一位置
🔹 feature 如果有特殊狀態 extension 也放在自己的 `models/`
📌 讓 Copilot 識別一致語意、避免誤判。 ([Gist][1])

---

## 🛠 5) 利用 **Barrel & index.ts** 統一導出

在每個 feature 下加：

```ts
// features/auth/index.ts
export * from './services/auth.service';
export * from './components/login-form.component';
export * from './pages/login.page';
export * from './models/auth.model';
```

✔ Copilot auto‑import 正確
✔ 減少路徑搞錯
✔ 有統一入口讓它不亂猜。 ([Copilot That Jawn][2])

---

## 📚 6) 為 Copilot 定義最強上下文提示（copilot‑instructions.md）

GitHub 官方也建議用 `.github/instructions/*.instructions.md` 來寫專案規範，讓 Copilot 在引用時**瞭解專案風格**：
✔ 命名規範
✔ 資料夾結構
✔ 風格與 test 規則
✔ 常見 patterns
→ 写越清楚，Copilot 在生成時準確度越高。 ([GitHub Docs][3])

---

## 🧠 7) TSDoc + 註解寫法（讓 Copilot “看懂”意圖）

在每個 public 方法或複雜邏輯上加清楚 TSDoc：

```ts
/**
 * 取得指定 user 的資料
 *
 * @param userId - 使用者唯一識別碼
 * @returns Promise<IUser> - 用戶資訊
 */
async fetchUser(userId: string): Promise<IUser> { ... }
```

✔ 有註解能大幅減少 mis‑guess
✔ Copilot 依照註解理解 return type / 用法
→ 生成結果更一致。 ([Gist][1])

---

## 🧪 8) 實戰最佳策略（讓 Copilot 不犯錯）

### ✔ 單一責任 & 小函式

→ Copilot 在小單元上生成更可靠
→ 大長函式容易出錯／推斷混亂。 ([Gist][1])

### ✔ 自動化格式化 & Lint

⚙ 用 ESLint + Prettier 預先 set
→ Copilot 建議就會依標準格式產出
→ 避免 style drift。 ([Gist][4])

### ✔ 有例子才更精準

在 TSDoc 或 .instructions 裡放範例寫法
→ 例如你偏好 `async/await` vs RxJS
→ Copilot 將遵循你提供的例子生成。

---

## 🔎 小提示：Copilot 使用時的一些 caveats

⚠ Copilot **不是 deterministic compiler**
→ 即使你給了相同上下文，也可能生成不一樣的建議，特別是邏輯較複雜時。
要定期 review/verify 結果。 ([arXiv][5])

⚠ `.instructions` 有時不會完全跟從
→ 必須將核心內容放在根 `.github/copilot‑instructions.md` 才不容易被忽略。 ([Reddit][6])

---

如果你要，我還可以幫你產出 **Angular + Copilot 專用 prompt 模板**（包含輸入提示、命名規範、例子、測試 stub 樣板），讓 Copilot 生成代碼時 *一次就合你 style*，不犯錯～ 想要嗎？ 😏

[1]: https://gist.github.com/juanpabloaj/d95233b74203d8a7e586723f14d3fb0e?utm_source=chatgpt.com "General guidelines and best practices for AI code generation · GitHub"
[2]: https://copilotthatjawn.com/tips/copilot-instructions-md.md?utm_source=chatgpt.com "Level Up GitHub Copilot with copilot-instructions.md - Copilot That Jawn"
[3]: https://docs.github.com/en/enterprise-cloud%40latest/copilot/how-tos/agents/copilot-coding-agent/best-practices-for-using-copilot-to-work-on-tasks?utm_source=chatgpt.com "Best practices for using GitHub Copilot to work on tasks - GitHub Enterprise Cloud Docs"
[4]: https://gist.github.com/justinjohnso/8da7d68eb104a4adb87b5ecb8332d574?utm_source=chatgpt.com "Keeping GitHub Copilot in line · GitHub"
[5]: https://arxiv.org/abs/2406.17910?utm_source=chatgpt.com "Transforming Software Development: Evaluating the Efficiency and Challenges of GitHub Copilot in Real-World Projects"
[6]: https://www.reddit.com/r/GithubCopilot/comments/1lbsa6m?utm_source=chatgpt.com "Copilot fails to follow copilot-instructions.md file"
