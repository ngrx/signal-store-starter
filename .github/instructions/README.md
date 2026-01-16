# Copilot Instructions - Master Index

This directory contains instruction files that guide GitHub Copilot in generating code that aligns with this project's architecture and standards.

## 📋 Instruction Files by Category

### Project-Specific Instructions

| File | Scope | Description |
|------|-------|-------------|
| [copilot-instructions.md](./copilot-instructions.md) | `**` | Core project rules and forbidden patterns |
| [angular.instructions.md](./angular.instructions.md) | `**/*.{ts,html,scss,css}` | Angular-specific development patterns |
| [typescript-5-es2022.instructions.md](./typescript-5-es2022.instructions.md) | `**/*.ts` | TypeScript standards and ES2022 features |

### Architecture & Design Instructions

| File | Scope | Description |
|------|-------|-------------|
| [ddd-architecture.instructions.md](./ddd-architecture.instructions.md) | `src/app/core/**/*` | Domain-Driven Design principles |
| [ngrx-signals.instructions.md](./ngrx-signals.instructions.md) | `src/app/core/**/stores/**/*` | NgRx Signals state management |
| [firebase-integration.instructions.md](./firebase-integration.instructions.md) | `src/app/core/**/services/**/*` | Firebase service patterns |

### Code Quality Instructions

| File | Scope | Description |
|------|-------|-------------|
| [self-explanatory-code-commenting.instructions.md](./self-explanatory-code-commenting.instructions.md) | `**` | Comment guidelines |
| [code-review-generic.instructions.md](./code-review-generic.instructions.md) | `**` | Code review standards |
| [performance-optimization.instructions.md](./performance-optimization.instructions.md) | `**` | Performance best practices |

### Security & Best Practices

| File | Scope | Description |
|------|-------|-------------|
| [security-and-owasp.instructions.md](./security-and-owasp.instructions.md) | `**` | Security and OWASP guidelines |
| [a11y.instructions.md](./a11y.instructions.md) | `**/*.{ts,html}` | Accessibility standards |
| [ai-prompt-engineering-safety-best-practices.instructions.md](./ai-prompt-engineering-safety-best-practices.instructions.md) | `**` | AI safety and prompt engineering |

### Process & Workflow Instructions

| File | Scope | Description |
|------|-------|-------------|
| [spec-driven-workflow-v1.instructions.md](./spec-driven-workflow-v1.instructions.md) | `**` | Specification-driven development |
| [task-implementation.instructions.md](./task-implementation.instructions.md) | `.copilot-tracking/**/*.md` | Task plan implementation |
| [update-docs-on-code-change.instructions.md](./update-docs-on-code-change.instructions.md) | `**/*.{md,js,ts,py,java,cs,go}` | Documentation sync rules |

### CI/CD & DevOps Instructions

| File | Scope | Description |
|------|-------|-------------|
| [github-actions-ci-cd-best-practices.instructions.md](./github-actions-ci-cd-best-practices.instructions.md) | `.github/workflows/*.{yml,yaml}` | GitHub Actions patterns |
| [codacy.instructions.md](./codacy.instructions.md) | `**` | Codacy integration rules |

### Meta Instructions

| File | Scope | Description |
|------|-------|-------------|
| [instructions.instructions.md](./instructions.instructions.md) | `**/*.instructions.md` | How to write instruction files |
| [prompt.instructions.md](./prompt.instructions.md) | `**/*.prompt.md` | Prompt file guidelines |
| [agent-skills.instructions.md](./agent-skills.instructions.md) | `.github/skills/**/*` | Agent skill creation |

## 🎯 How Instructions Work

### Scoping with `applyTo`
Each instruction file has a YAML frontmatter with an `applyTo` pattern that determines when it's active:

```yaml
---
description: 'Brief description of the instruction purpose'
applyTo: 'glob pattern for target files'
---
```

**Examples:**
- `applyTo: '**'` - Applies to all files
- `applyTo: '**/*.ts'` - TypeScript files only
- `applyTo: 'src/app/core/**/stores/**/*'` - Store files only

### Instruction Priority
When multiple instructions apply to the same file:
1. More specific patterns take precedence
2. Project-specific instructions override generic ones
3. Forbidden patterns (in `copilot-instructions.md`) are absolute

## 📚 Related Documentation

### Architecture Documentation
- [Architecture Overview](../../docs/architecture/README.md)
- [Account & Identity Layer](../../docs/architecture/02-account-identity.md)
- [Workspace Layer](../../docs/architecture/03-workspace.md)
- [NgRx Signals Architecture](../../docs/architecture/07-ngrx-signals.md)

### Project Documentation
- [Project Specification](../../docs/specification.md)
- [PRD (Product Requirements)](../../docs/prd.md)
- [Project Layer Mapping](../project-layer-mapping.yml)

### Copilot Configuration
- [Main Copilot Instructions](../copilot-instructions.md)
- [Forbidden Instructions](../forbidden-copilot-instructions.md)

## 🚀 Quick Start for Copilot Users

### When Adding New Features
1. Check [Architecture Overview](../../docs/architecture/01-overview.md) for layer boundaries
2. Follow [NgRx Signals patterns](./ngrx-signals.instructions.md) for state
3. Use [Firebase Integration](./firebase-integration.instructions.md) for backend
4. Apply [DDD Architecture](./ddd-architecture.instructions.md) principles

### When Writing Code
1. Start with [Angular instructions](./angular.instructions.md)
2. Follow [TypeScript standards](./typescript-5-es2022.instructions.md)
3. Apply [Code Quality](./code-review-generic.instructions.md) guidelines
4. Ensure [Security](./security-and-owasp.instructions.md) compliance

### When Refactoring
1. Follow [Performance Optimization](./performance-optimization.instructions.md)
2. Maintain [Self-Explanatory Code](./self-explanatory-code-commenting.instructions.md)
3. Update [Documentation](./update-docs-on-code-change.instructions.md)

## ⚠️ Critical Rules

### Forbidden Patterns (Always Enforced)
- ❌ Traditional NgRx (actions, reducers, effects)
- ❌ RxJS operators in state (`switchMap`, `mergeMap`, `concatMap`)
- ❌ Direct state mutation
- ❌ Business logic in components
- ❌ Cross-layer direct access
- ❌ Undefined state initialization

### Required Patterns (Always Follow)
- ✅ Use `@ngrx/signals` for all state
- ✅ Use `patchState` for mutations
- ✅ Use `computed()` for derived state
- ✅ Use `rxMethod` for async operations
- ✅ Respect layer boundaries (Domain → Application → Infrastructure → Interface)
- ✅ Initialize all state values

## 🔧 Maintenance

### Adding New Instructions
1. Create file with descriptive name: `topic.instructions.md`
2. Add YAML frontmatter with `description` and `applyTo`
3. Follow [Instructions Guidelines](./instructions.instructions.md)
4. Update this README with new entry
5. Test with actual code generation

### Updating Instructions
1. Review existing instruction file
2. Make minimal, focused changes
3. Update `description` if scope changes
4. Test with relevant file types
5. Update cross-references if needed

### Removing Instructions
1. Mark as deprecated in description
2. Move to `Archive/` directory
3. Remove from this index
4. Update dependent instructions
