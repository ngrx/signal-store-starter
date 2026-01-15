---

📘 @ngrx/signals‑20 SKILL.md（技能清單）

# @ngrx/signals (v20) — SKILL.md

## 🎯 Summary
**@ngrx/signals** 提供一種基於 Angular Signals 的反應式狀態管理方案，用於建立可預測、可測試與可擴展的 Reactivity Store。  
適用於 Angular v20 與 NgRx 20 生態。1

---

## 🛠️ Installation
```bash
pnpm install @ngrx/signals@latest
# or
ng add @ngrx/signals

確保專案已升級到 Angular v20 & NgRx v20。


---

🚀 基本使用技能

1️⃣ Create a SignalStore

使用 signalStore(...) 定義 store

內含 withState 管理初始狀態

使用 withMethods / withRxMethod 封裝邏輯

Signals 自動追蹤依賴並更新 UI


範例：

const CounterStore = signalStore(
  withState({ count: 0 }),
  withMethods({
    increment: ({ patchState }) => () => patchState(state => ({ count: state.count+1 }))
  })
);


---

🔄 Core Concepts

🧠 Signals & Reactivity

Signals 是可呼叫的 getter function

自動追蹤依賴並觸發更新（OnPush friendly）


📦 State Management

利用 signalStore + withState 定義可讀/可寫狀態

patchState 更新片段狀態

Derived signals（linkedSignal / computed）建立衍生狀態



---

🚦 Advanced Skills

🔹 Entity Management

使用 @ngrx/signals/entities plugin

Methods: prependEntity, upsertEntity, removeEntity, etc
（強化集合資料管理）


🔹 withLinkedState

建立衍生訊號，當源 signal 改變時自動更新

避免手動 effect / subscription



---

🧪 Testing Skills

新增 @ngrx/signals/testing（測試專用 API）

使用 unprotected 解除封裝狀態用於快速測試設定
（讓 store 更易於測試）



---

⭐ Advanced Patterns

👩‍💻 Event‑Driven Architecture

使用 withReducer + withEffects

透過 Events 插件建立 Flux 風格事件驅動設計（Experimental）


📜 Interop with RxJS

optional RxJS interoperability

可透過 rxMethod 呼叫非同步邏輯



---

📁 Recommended Project Structure

src/
├── app/
│   ├── stores/
│   │   ├── counter.store.ts       # 單一 store
│   │   ├── users.store.ts         # 實作 @ngrx/signals state
│   │   └── index.ts               # store exports
│   ├── features/
│   │   ├── users/
│   │   │   ├── ui/
│   │   │   │   ├── user-list.component.ts
│   │   │   │   └── user-detail.component.ts
│   │   │   └── users.store.ts     # feature store
│   │   └── ...
│   ├── services/
│   │   └── api.service.ts
│   └── app.module.ts
└── skill/
    └── @ngrx-signals‑SKILL.md      # 📌 存放技能書的地方


---

📚 Recommended Learning Path

1. ➤ Learn Angular Signals fundamentals (Angular guide)


2. ➤ Install & init @ngrx/signals store


3. ➤ Build simple feature store


4. ➤ Add entity management & linkedState


5. ➤ Use advanced patterns (Events, Rx interop)


6. ➤ Write tests using @ngrx/signals/testing




---

📝 Notes

@ngrx/signals 正在快速進化中，而 Events / Flux plugin 目前標為實驗性功能。

主要官方 API 文檔在 NgRx API Reference。