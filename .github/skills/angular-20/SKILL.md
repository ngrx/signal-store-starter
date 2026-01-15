---

📌 Angular 20 技能 Skill (SKILL.md)

---
name: angular-20-skill
description: >
  Angular 20 knowledge and best practices. Use this skill when asked about Angular 20 development,
  architecture, components, routing, state management, performance, testing, and deployment.
license: MIT
---

# Angular 20 Skill for AI Agents

## 🧩 Purpose
This skill provides structured guidance and best practices for Angular 20 development, including typical workflows,
common patterns, quality standards, and example templates.

## 🛠️ Angular 20 Core Concepts
- Angular 20 features & changes  
- TypeScript-first architecture  
- Standalone components  
- Signals and reactivity  
- Composition API  
- Angular CLI workflows

## 📚 Key Tasks & When to Use
### 1) Create a new Angular 20 app
Use Angular CLI to bootstrap projects, follow style/architecture rules:
```bash
ng new your-app --routing --style=scss

2) Component & Template Patterns

Use standalone components where possible

Keep templates clean & concise

Enforce accessibility (a11y) guidelines


🚦 Routing & Navigation

Setup RouterModule.forRoot(routes)

Use lazy-loaded routes for large modules

Prefetching strategies for performance


🔄 State & Reactivity

Prefer Signals for local state

Consider NgRx or other patterns for large global stores

Manage effects/rx workflows carefully


📦 HTTP & REST

Use HttpClient with typed responses

Centralize API service layer with error handling


📑 Testing

Unit test with Jest or Vitest

E2E tests with Playwright or Protractor replacement


🎯 Performance

Use AOT compilation

Optimize bundle with ng build --prod

Use onPush change detection where applicable


🚀 Deployment

Build artifacts: ng build

Serve with static hosts / CDNs

Configure environment-specific settings


📌 Examples & Code Snippets

Example standalone component

Example reactive form

Example API service


Refer to official Angular docs and community standards for evolving best practices.

---

## 📂 推薦存放路徑（讓 Copilot agent 正確載入）

🎯 **專案內技能（對這個 Repo 專用）**

/.github/skills/angular-20-skill/SKILL.md

🎯 **個人全局技能（跨專案共用）**

~/.copilot/skills/angular-20-skill/SKILL.md

💡 Copilot agent 會根據你 prompt 的內容，自動決定何時載入這份技能文件。技能必須放在 `skills` 子資料夾並命名為 `SKILL.md`。1

---