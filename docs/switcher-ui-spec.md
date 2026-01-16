# 切換器 UI/UX 規格補充文件

## 📐 設計原則

### 核心理念
- **一致性**: 所有切換器使用統一的視覺語言和互動模式
- **直觀性**: 用戶無需學習即可理解當前上下文和切換方式
- **效率性**: 最少點擊次數完成切換，支援鍵盤快捷鍵
- **可見性**: 當前選擇的身份/工作區始終清晰可見
- **Material Design**: 遵循 Material Design 3 規範

---

## 🎯 1. 身份切換器 (Account Switcher)

### 1.1 功能定位

**用途**: 在 User / Organization / Team / Partner 等不同身份之間切換

**位置**: Header 右上角，工作區切換器右側

**觸發方式**: 點擊觸發 MatMenu (Material Menu)

**鍵盤快捷鍵**: `Ctrl/Cmd + Shift + A`

### 1.2 視覺設計

#### 觸發按鈕 (Trigger Button)
```typescript
// 組件選擇
Component: mat-button + [matMenuTriggerFor]

// 視覺結構
┌──────────────────────────────────┐
│ [Avatar] AccountName [▼]         │
│  32x32   14px medium  Icon       │
└──────────────────────────────────┘

// 樣式規格
- Container:
  - Height: 48px
  - Padding: 8px 12px
  - Border-radius: 24px (pill shape)
  - Background: transparent
  - Hover background: rgba(0,0,0,0.04)
  - Active background: rgba(0,0,0,0.08)
  
- Avatar:
  - Size: 32x32px
  - Border-radius: 50%
  - Object-fit: cover
  - Margin-right: 8px
  
- AccountName:
  - Font: 14px / 500 (medium)
  - Color: rgba(0,0,0,0.87)
  - Max-width: 120px
  - Text-overflow: ellipsis
  - White-space: nowrap
  
- Dropdown Icon:
  - mat-icon: expand_more
  - Size: 20px
  - Transition: transform 200ms ease
  - Rotate 180deg when menu open
```

#### 狀態指示器
```typescript
// Avatar 根據 AccountType 顯示
AccountType.User → 用戶頭像照片 (photoURL)
AccountType.Organization → 公司 Logo (orgLogo)
AccountType.Team → Material Icon: groups
AccountType.Partner → Material Icon: handshake

// 當前身份標記
- 在 Avatar 右下角顯示小徽章 (8x8px)
  - User: 無徽章
  - Organization: 藍色圓點
  - Team: 橙色圓點
  - Partner: 綠色圓點
```

### 1.3 下拉選單 (MatMenu)

#### 選單結構
```typescript
// 組件
Component: mat-menu

// 寬度與定位
Width: 280px
Max-height: 400px (超過則滾動)
Position: below, aligned to trigger button right edge
Elevation: mat-elevation-z8
Border-radius: 8px
Padding: 8px 0

// 選單內容分組
┌────────────────────────────────────────┐
│ 【個人帳號】                            │
│ ✓ [Avatar] Your Name                  │
│    User                                │
├────────────────────────────────────────┤
│ 【組織】                                │
│   [Logo] Acme Corp                     │
│    Organization · Owner                │
│   [Logo] Tech Startup                  │
│    Organization · Admin                │
├────────────────────────────────────────┤
│ 【團隊】                                │
│   [Icon] Engineering Team              │
│    Team · Member                       │
│   [Icon] Design Team                   │
│    Team · Admin                        │
├────────────────────────────────────────┤
│ 【合作夥伴】                            │
│   [Icon] Partner Inc.                  │
│    Partner · Collaborator              │
├────────────────────────────────────────┤
│ [Icon] 管理帳號...                      │
└────────────────────────────────────────┘
```

#### 選單項目 (mat-menu-item)
```typescript
// 每個帳號項目結構
Structure:
- Container (height: 56px, padding: 8px 16px)
  - Left: Avatar/Icon (32x32px)
  - Middle: 
    - Line 1: Account Name (14px / 500)
    - Line 2: Account Type + Role (12px / 400, opacity 0.6)
  - Right: Check Icon (當前選中, 20px)

// 樣式狀態
Default:
  - Background: transparent
  
Hover:
  - Background: rgba(0,0,0,0.04)
  - Cursor: pointer
  
Active (Current):
  - Background: rgba(63,81,181,0.08) // Primary color with opacity
  - Check icon visible (mat-icon: check, color: primary)
  - Font-weight: 500

// 分組標題 (mat-menu-item disabled)
Style:
  - Font: 12px / 500
  - Color: rgba(0,0,0,0.6)
  - Text-transform: uppercase
  - Letter-spacing: 0.5px
  - Padding: 8px 16px
  - Height: 32px
  - Not clickable
```

#### 空狀態處理
```typescript
// 當某分組無項目時
Display:
  - 顯示灰色提示文字
  - Font: 12px / 400
  - Color: rgba(0,0,0,0.38)
  - Padding: 12px 16px
  
Example:
  "【團隊】"
  "尚未加入任何團隊"
```

### 1.4 互動行為

#### 切換流程
```typescript
1. 點擊觸發按鈕
   → 展開 MatMenu
   → 載入所有可切換的身份列表

2. 選擇目標身份
   → 關閉 MatMenu
   → 顯示載入指示器 (mat-progress-spinner, 在按鈕內)
   → 執行切換邏輯:
      - GlobalShell.switchAccount(accountId)
      - WorkspaceListStore.reset()
      - WorkspaceStore.reset()
      - 重新載入工作區列表
   → 更新觸發按鈕顯示
   → 顯示成功提示 (MatSnackBar)

3. 錯誤處理
   → 切換失敗時保持原身份
   → 顯示錯誤訊息 (MatSnackBar)
   → 記錄錯誤日誌
```

#### 載入狀態
```typescript
// 載入中狀態
Show: mat-progress-spinner (diameter: 16px) 替代 dropdown icon
Disable: 觸發按鈕
Block: 用戶操作

// 完成狀態
Duration: 200ms fade transition
Success indicator: Brief check icon animation
```

### 1.5 響應式設計

#### Desktop (> 1024px)
```typescript
Trigger Button:
  - Full display: Avatar + Name + Icon
  - Width: auto (max 200px)

Menu:
  - Width: 280px
  - Position: below right
```

#### Tablet (768px - 1023px)
```typescript
Trigger Button:
  - Display: Avatar + Icon only
  - Name hidden
  - Width: 48px (square)

Menu:
  - Width: 280px
  - Position: below right
```

#### Mobile (< 768px)
```typescript
Trigger Button:
  - Display: Avatar only
  - Width: 40px
  - Height: 40px

Menu:
  - Width: 100vw (full screen)
  - Position: bottom sheet (mat-bottom-sheet)
  - Slide up animation
```

---

## 🏢 2. 工作區切換器 (Workspace Switcher)

### 2.1 功能定位

**用途**: 在不同 Workspace 之間快速切換

**位置**: Header 左上角，Logo/品牌名稱右側

**觸發方式**: 點擊觸發 MatMenu

**鍵盤快捷鍵**: `Ctrl/Cmd + K` (打開 Command Palette 式快速切換器)

### 2.2 視覺設計

#### 觸發按鈕 (Trigger Button)
```typescript
// 組件選擇
Component: mat-button + [matMenuTriggerFor]

// 視覺結構
┌────────────────────────────────────┐
│ [Icon] Workspace Name [▼]          │
│  24x24  16px/600      Icon         │
└────────────────────────────────────┘

// 樣式規格
- Container:
  - Height: 48px
  - Padding: 8px 16px
  - Border-radius: 8px
  - Background: transparent
  - Border: 1px solid rgba(0,0,0,0.12)
  - Hover:
    - Background: rgba(0,0,0,0.04)
    - Border-color: rgba(0,0,0,0.24)
  
- Workspace Icon:
  - Size: 24x24px
  - Border-radius: 4px
  - Background: gradient or solid color
  - Margin-right: 12px
  - Display: workspace.avatar OR first letter of name
  
- Workspace Name:
  - Font: 16px / 600 (semi-bold)
  - Color: rgba(0,0,0,0.87)
  - Max-width: 200px
  - Text-overflow: ellipsis
  
- Dropdown Icon:
  - mat-icon: unfold_more
  - Size: 20px
```

#### 工作區類型指示
```typescript
// Icon 背景色根據 WorkspaceType
WorkspaceType.Project → Blue gradient
WorkspaceType.Department → Purple gradient
WorkspaceType.Client → Green gradient
WorkspaceType.Campaign → Orange gradient
WorkspaceType.Product → Red gradient
WorkspaceType.Internal → Gray gradient

// Gradient 範例
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
```

### 2.3 下拉選單 (MatMenu)

#### 選單結構
```typescript
// 組件
Component: mat-menu

// 尺寸與定位
Width: 360px
Max-height: 480px
Position: below, aligned to trigger button left edge
Elevation: mat-elevation-z8
Border-radius: 12px
Padding: 0

// 選單佈局
┌────────────────────────────────────────┐
│ ┌────────────────────────────────────┐ │
│ │ [Icon] 搜尋工作區...                 │ │ ← 搜尋框
│ └────────────────────────────────────┘ │
├────────────────────────────────────────┤
│ 【最近使用】                            │
│ ✓ [Icon] Current Workspace             │
│    Project · 5 members                 │
│   [Icon] Marketing Campaign            │
│    Campaign · 12 members               │
├────────────────────────────────────────┤
│ 【我的工作區】                          │
│   [Icon] Personal Projects             │
│    Project · Owner                     │
├────────────────────────────────────────┤
│ 【共享工作區】                          │
│   [Icon] Team Engineering              │
│    Department · Member                 │
├────────────────────────────────────────┤
│ 【已封存】(可展開/收合)                 │
│   [Icon] Old Project                   │
│    Project · Archived                  │
├────────────────────────────────────────┤
│ [+] 建立新工作區                        │
└────────────────────────────────────────┘
```

#### 搜尋框 (mat-form-field)
```typescript
// 組件
Component: mat-form-field + input

// 樣式
Appearance: outline
Height: 48px
Padding: 12px 16px
Margin: 8px

// 功能
- Placeholder: "搜尋工作區..."
- Prefix icon: mat-icon: search
- 即時搜尋 (debounce 300ms)
- 支援鍵盤導航 (↑↓ 選擇, Enter 確認)
- 快捷鍵: 自動 focus (選單開啟時)

// 搜尋邏輯
Filter by:
  - Workspace name (fuzzy match)
  - Workspace type
  - Member names
```

#### 工作區項目 (mat-menu-item)
```typescript
// 結構
Container:
  - Height: 64px
  - Padding: 12px 16px
  - Display: flex
  - Align-items: center

Layout:
  - Left: Workspace Icon (40x40px, border-radius: 8px)
  - Middle:
    - Line 1: Workspace Name (14px / 500)
    - Line 2: Type + Member count (12px / 400, opacity 0.6)
  - Right: 
    - Favorite icon (star, 可點擊)
    - Current indicator (check icon)

// 樣式狀態
Default:
  - Background: transparent

Hover:
  - Background: rgba(0,0,0,0.04)
  - Transform: translateX(4px)
  - Transition: all 200ms ease

Active (Current):
  - Background: rgba(63,81,181,0.08)
  - Border-left: 3px solid primary color
  - Check icon visible

Favorite:
  - Star icon filled (color: #FFC107)
  - Click to toggle favorite status
```

#### 分組標題
```typescript
// 樣式
Component: div (not clickable)

Style:
  - Font: 11px / 600
  - Color: rgba(0,0,0,0.6)
  - Text-transform: uppercase
  - Letter-spacing: 1px
  - Padding: 16px 16px 8px 16px
  - Display: flex
  - Justify-content: space-between

// 功能
- 顯示分組名稱
- 顯示項目數量 (badge)
- 可展開/收合 (Archived 分組)
```

#### 建立新工作區按鈕
```typescript
// 組件
Component: mat-menu-item

// 樣式
Height: 48px
Padding: 12px 16px
Border-top: 1px solid rgba(0,0,0,0.12)
Font: 14px / 500
Color: primary color

Icon:
  - mat-icon: add_circle_outline
  - Size: 20px
  - Color: primary

Hover:
  - Background: rgba(63,81,181,0.04)
  - Icon color: darken primary

// 行為
Click → 開啟建立工作區 Dialog (mat-dialog)
```

### 2.4 命令面板模式 (Command Palette)

#### 觸發方式
```typescript
// 快捷鍵
Keyboard: Ctrl/Cmd + K

// 組件
Component: mat-dialog (fullscreen on mobile, centered on desktop)

// 視覺
┌──────────────────────────────────────────────┐
│ ┌──────────────────────────────────────────┐ │
│ │ [Icon] 快速切換工作區 或 執行動作...      │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ 【建議動作】                                  │
│ ⌘ K  切換工作區                               │
│ ⌘ N  建立新工作區                             │
│ ⌘ /  搜尋文件                                 │
│                                              │
│ 【最近工作區】                                │
│ ↵  [Icon] Marketing Campaign                │
│    [Icon] Personal Projects                 │
│                                              │
│ 【所有工作區】                                │
│    [Icon] Team Engineering                  │
│    [Icon] Client Work                       │
└──────────────────────────────────────────────┘

// 尺寸
Desktop:
  - Width: 640px
  - Max-height: 480px
  - Border-radius: 16px
  - Backdrop: rgba(0,0,0,0.6)

Mobile:
  - Width: 100vw
  - Height: 100vh
  - Border-radius: 0
  - Position: bottom-sheet
```

#### 搜尋功能
```typescript
// 多功能搜尋
Input supports:
  - Workspace search
  - Command search (以 '>' 開頭)
  - File search (以 '@' 開頭)
  - Member search (以 '#' 開頭)

Examples:
  "marketing"        → 搜尋工作區
  ">create task"     → 搜尋命令
  "@design-doc"      → 搜尋文件
  "#john"            → 搜尋成員

// 鍵盤導航
↑↓   - 選擇項目
Enter - 執行選擇
Esc   - 關閉面板
Tab   - 切換搜尋模式
```

### 2.5 互動行為

#### 切換流程
```typescript
// 基本切換
1. 點擊目標工作區
   → 顯示載入指示器
   → WorkspaceStore.switchWorkspace(workspaceId)
   → 清空當前工作區相關 Store
   → 載入新工作區資料
   → 更新 URL (router.navigate)
   → 關閉選單
   → 顯示成功提示

// 快速切換 (Command Palette)
1. 按下 Ctrl/Cmd + K
   → 開啟命令面板
   → 自動 focus 搜尋框
   
2. 輸入關鍵字
   → 即時過濾結果
   → 高亮匹配文字
   
3. 選擇工作區
   → 執行切換
   → 關閉面板

// 我的最愛切換
Right-click on trigger button:
  → 顯示最愛工作區快速選單
  → 最多顯示 5 個
  → 一鍵快速切換
```

#### 載入狀態
```typescript
// Optimistic UI
Immediately:
  - 更新觸發按鈕顯示新工作區
  - 顯示骨架屏 (skeleton)
  - 鎖定切換器

Loading:
  - 載入工作區資料
  - 載入成員列表
  - 載入權限設定

Complete:
  - 隱藏骨架屏
  - 顯示實際內容
  - 解鎖切換器

Error:
  - 恢復原工作區顯示
  - 顯示錯誤訊息
  - 記錄錯誤日誌
```

### 2.6 響應式設計

#### Desktop (> 1024px)
```typescript
Trigger:
  - Full display: Icon + Name + Dropdown
  - Width: auto (max 280px)

Menu:
  - Width: 360px
  - Position: below left

Command Palette:
  - Width: 640px
  - Centered overlay
```

#### Tablet (768px - 1023px)
```typescript
Trigger:
  - Display: Icon + Abbreviated Name + Dropdown
  - Max-width: 180px

Menu:
  - Width: 320px
  - Position: below left
```

#### Mobile (< 768px)
```typescript
Trigger:
  - Display: Icon only
  - Width: 40px
  - Height: 40px

Menu:
  - Full-screen bottom sheet (mat-bottom-sheet)
  - Slide-up animation
  - Search bar sticky at top

Command Palette:
  - Full-screen overlay
  - Slide-up animation
```

---

## 🎨 3. 統一設計規範

### 3.1 顏色系統 (Material Theme)

```typescript
// Primary Palette
Primary: #3F51B5 (Indigo 500)
Primary Light: #7986CB (Indigo 300)
Primary Dark: #303F9F (Indigo 700)

// Accent Palette
Accent: #FF4081 (Pink A200)
Accent Light: #FF80AB (Pink A100)
Accent Dark: #F50057 (Pink A400)

// Warn Palette
Warn: #F44336 (Red 500)

// Background
Background: #FAFAFA
Surface: #FFFFFF
Card: #FFFFFF

// Text
Primary Text: rgba(0,0,0,0.87)
Secondary Text: rgba(0,0,0,0.54)
Disabled Text: rgba(0,0,0,0.38)
Hint Text: rgba(0,0,0,0.38)

// Divider
Divider: rgba(0,0,0,0.12)
```

### 3.2 字體系統

```typescript
// Font Family
Primary: 'Roboto', 'Noto Sans TC', sans-serif
Monospace: 'Roboto Mono', monospace

// Font Sizes
Display Large: 57px / 400
Display Medium: 45px / 400
Display Small: 36px / 400
Headline Large: 32px / 400
Headline Medium: 28px / 400
Headline Small: 24px / 400
Title Large: 22px / 400
Title Medium: 16px / 500
Title Small: 14px / 500
Body Large: 16px / 400
Body Medium: 14px / 400
Body Small: 12px / 400
Label Large: 14px / 500
Label Medium: 12px / 500
Label Small: 11px / 500

// Line Heights
Display: 1.2
Headline: 1.3
Title: 1.4
Body: 1.5
Label: 1.4
```

### 3.3 間距系統

```typescript
// Spacing Scale (4px base)
4px   → Extra small (xs)
8px   → Small (sm)
12px  → Medium small (md-sm)
16px  → Medium (md)
24px  → Medium large (md-lg)
32px  → Large (lg)
48px  → Extra large (xl)
64px  → 2X Extra large (2xl)
96px  → 3X Extra large (3xl)

// Component Specific
Button padding: 8px 16px
Input padding: 12px 16px
Card padding: 16px
List item padding: 12px 16px
Section gap: 24px
Page margin: 16px (mobile) / 24px (desktop)
```

### 3.4 圓角系統

```typescript
// Border Radius
None: 0px
Small: 4px
Medium: 8px
Large: 12px
Extra Large: 16px
Full: 9999px (pill/circle)

// Component Specific
Button: 4px
Card: 8px
Dialog: 12px
Bottom Sheet: 16px (top corners only)
Avatar: 50% (circle)
Badge: 12px
Chip: 16px
Menu: 8px
```

### 3.5 陰影系統 (Material Elevation)

```typescript
// Elevation Levels
0: none
1: 0px 2px 1px -1px rgba(0,0,0,0.2),
   0px 1px 1px 0px rgba(0,0,0,0.14),
   0px 1px 3px 0px rgba(0,0,0,0.12)
   
2: 0px 3px 1px -2px rgba(0,0,0,0.2),
   0px 2px 2px 0px rgba(0,0,0,0.14),
   0px 1px 5px 0px rgba(0,0,0,0.12)
   
4: 0px 2px 4px -1px rgba(0,0,0,0.2),
   0px 4px 5px 0px rgba(0,0,0,0.14),
   0px 1px 10px 0px rgba(0,0,0,0.12)
   
8: 0px 5px 5px -3px rgba(0,0,0,0.2),
   0px 8px 10px 1px rgba(0,0,0,0.14),
   0px 3px 14px 2px rgba(0,0,0,0.12)

// Component Specific
Card: elevation-2
Menu: elevation-8
Dialog: elevation-24
Bottom Sheet: elevation-16
App Bar: elevation-4 (scrolled) / elevation-0 (top)
```

### 3.6 動畫系統

```typescript
// Duration
Instant: 0ms
Fast: 100ms
Normal: 200ms
Slow: 300ms
Slower: 400ms

// Easing
Standard: cubic-bezier(0.4, 0.0, 0.2, 1)
Decelerate: cubic-bezier(0.0, 0.0, 0.2, 1)
Accelerate: cubic-bezier(0.4, 0.0, 1, 1)
Sharp: cubic-bezier(0.4, 0.0, 0.6, 1)

// Common Animations
Fade In: opacity 0 → 1, 200ms standard
Fade Out: opacity 1 → 0, 200ms standard
Slide Up: transform translateY(100%) → 0, 300ms decelerate
Slide Down: transform translateY(-100%) → 0, 300ms decelerate
Scale In: transform scale(0.9) → 1, 200ms standard
Ripple: Material ripple effect (built-in)
```

---

## 🔧 4. 技術實作規範

### 4.1 NgRx Signals Store 架構

#### GlobalShell Store (身份管理)
```typescript
// Store 結構
interface GlobalShellState {
  // 當前身份
  currentAccount: Account | null;
  
  // 所有可切換的身份
  availableAccounts: Account[];
  
  // 載入狀態
  accountsLoading: boolean;
  accountSwitching: boolean;
  
  // 錯誤狀態
  error: string | null;
}

// Store 定義
export const GlobalShell = signalStore(
  { providedIn: 'root' },
  
  withState<GlobalShellState>({
    currentAccount: null,
    availableAccounts: [],
    accountsLoading: false,
    accountSwitching: false,
    error: null
  }),
  
  withComputed((store) => ({
    // 依類型分組的帳號
    userAccounts: computed(() => 
      store.availableAccounts().filter(a => a.type === 'User')
    ),
    
    organizationAccounts: computed(() => 
      store.availableAccounts().filter(a => a.type === 'Organization')
    ),
    
    teamAccounts: computed(() => 
      store.availableAccounts().filter(a => a.type === 'Team')
    ),
    
    partnerAccounts: computed(() => 
      store.availableAccounts().filter(a => a.type === 'Partner')
    ),
    
    // 當前身份資訊
    currentAccountType: computed(() => 
      store.currentAccount()?.type ?? null
    ),
    
    currentAccountName: computed(() => 
      store.currentAccount()?.name ?? ''
    ),
    
    currentAccountAvatar: computed(() => 
      store.currentAccount()?.avatar ?? ''
    ),
    
    // UI 狀態
    isReady: computed(() => 
      !store.accountsLoading() && store.currentAccount() !== null
    )
  })),
  
  withMethods((store, firestore = inject(Firestore), auth = inject(Auth)) => ({
    // 載入所有可用身份
    loadAvailableAccounts: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { accountsLoading: true, error: null })),
        switchMap(() => {
          const userId = auth.currentUser?.uid;
          if (!userId) {
            return of({ accounts: [], error: 'Not authenticated' });
          }
          
          // 從 Firestore 載入用戶的所有身份關聯
          return collectionData(
            query(
              collection(firestore, 'accountMemberships'),
              where('userId', '==', userId),
              where('status', '==', 'Active')
            ),
            { idField: 'id' }
          ).pipe(
            switchMap((memberships) => {
              // 載入每個身份的詳細資訊
              const accountIds = memberships.map(m => m.accountId);
              return forkJoin(
                accountIds.map(id => 
                  docData(doc(firestore, 'accounts', id), { idField: 'id' })
                )
              );
            }),
            map(accounts => ({ accounts, error: null })),
            catchError(error => of({ accounts: [], error: error.message }))
          );
        }),
        tap(({ accounts, error }) => {
          patchState(store, {
            availableAccounts: accounts,
            accountsLoading: false,
            error
          });
        })
      )
    ),
    
    // 切換身份
    switchAccount: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { accountSwitching: true, error: null })),
        switchMap((accountId) => {
          // 從可用身份中找到目標身份
          const targetAccount = store.availableAccounts()
            .find(a => a.id === accountId);
          
          if (!targetAccount) {
            return of({ account: null, error: 'Account not found' });
          }
          
          // 更新 Firebase Auth Custom Claims (通過 Cloud Function)
          const updateClaims = httpsCallable(
            inject(Functions),
            'updateAccountContext'
          );
          
          return from(updateClaims({ accountId })).pipe(
            map(() => ({ account: targetAccount, error: null })),
            catchError(error => of({ account: null, error: error.message }))
          );
        }),
        tap(({ account, error }) => {
          if (account) {
            patchState(store, {
              currentAccount: account,
              accountSwitching: false,
              error: null
            });
            
            // 通知其他 Store 重置
            // (透過事件或直接調用)
          } else {
            patchState(store, {
              accountSwitching: false,
              error
            });
          }
        })
      )
    ),
    
    // 設定當前身份 (初始化用)
    setCurrentAccount(account: Account) {
      patchState(store, { currentAccount: account });
    }
  }))
);
```

#### WorkspaceListStore (工作區列表)
```typescript
// Store 結構
interface WorkspaceListState {
  // 所有工作區
  workspaces: Workspace[];
  
  // 當前選中的工作區 ID
  currentWorkspaceId: string | null;
  
  // 我的最愛工作區 ID 列表
  favoriteWorkspaceIds: string[];
  
  // 最近使用的工作區 ID 列表 (最多 5 個)
  recentWorkspaceIds: string[];
  
  // 載入狀態
  loading: boolean;
  switching: boolean;
  
  // 搜尋關鍵字
  searchQuery: string;
  
  // 錯誤狀態
  error: string | null;
}

// Store 定義
export const WorkspaceListStore = signalStore(
  { providedIn: 'root' },
  
  withState<WorkspaceListState>({
    workspaces: [],
    currentWorkspaceId: null,
    favoriteWorkspaceIds: [],
    recentWorkspaceIds: [],
    loading: false,
    switching: false,
    searchQuery: '',
    error: null
  }),
  
  withComputed((store, globalShell = inject(GlobalShell)) => ({
    // 當前工作區
    currentWorkspace: computed(() => {
      const id = store.currentWorkspaceId();
      return store.workspaces().find(w => w.id === id) ?? null;
    }),
    
    // 依擁有權分組
    ownedWorkspaces: computed(() => 
      store.workspaces().filter(w => 
        w.ownerId === globalShell.currentAccount()?.id
      )
    ),
    
    memberWorkspaces: computed(() => 
      store.workspaces().filter(w => 
        w.ownerId !== globalShell.currentAccount()?.id &&
        w.status === 'Active'
      )
    ),
    
    archivedWorkspaces: computed(() => 
      store.workspaces().filter(w => w.status === 'Archived')
    ),
    
    // 我的最愛工作區
    favoriteWorkspaces: computed(() => {
      const ids = store.favoriteWorkspaceIds();
      return store.workspaces().filter(w => ids.includes(w.id));
    }),
    
    // 最近使用的工作區
    recentWorkspaces: computed(() => {
      const ids = store.recentWorkspaceIds();
      return ids
        .map(id => store.workspaces().find(w => w.id === id))
        .filter((w): w is Workspace => w !== undefined);
    }),
    
    // 搜尋結果
    searchResults: computed(() => {
      const query = store.searchQuery().toLowerCase().trim();
      if (!query) return store.workspaces();
      
      return store.workspaces().filter(w =>
        w.name.toLowerCase().includes(query) ||
        w.type.toLowerCase().includes(query) ||
        w.description?.toLowerCase().includes(query)
      );
    }),
    
    // 依類型分組
    workspacesByType: computed(() => {
      const workspaces = store.workspaces();
      const grouped = new Map<string, Workspace[]>();
      
      workspaces.forEach(w => {
        const type = w.type;
        if (!grouped.has(type)) {
          grouped.set(type, []);
        }
        grouped.get(type)!.push(w);
      });
      
      return grouped;
    })
  })),
  
  withMethods((store, firestore = inject(Firestore), globalShell = inject(GlobalShell)) => ({
    // 載入工作區列表
    loadWorkspaces: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() => {
          const accountId = globalShell.currentAccount()?.id;
          if (!accountId) {
            return of({ workspaces: [], error: 'No account selected' });
          }
          
          // 從 Firestore 載入該身份有權限訪問的所有工作區
          return collectionData(
            query(
              collection(firestore, 'workspaceMemberships'),
              where('accountId', '==', accountId),
              where('status', '==', 'Active')
            ),
            { idField: 'id' }
          ).pipe(
            switchMap((memberships) => {
              const workspaceIds = memberships.map(m => m.workspaceId);
              
              if (workspaceIds.length === 0) {
                return of([]);
              }
              
              // 載入工作區詳細資訊
              return collectionData(
                query(
                  collection(firestore, 'workspaces'),
                  where('__name__', 'in', workspaceIds)
                ),
                { idField: 'id' }
              );
            }),
            map(workspaces => ({ workspaces, error: null })),
            catchError(error => of({ workspaces: [], error: error.message }))
          );
        }),
        tap(({ workspaces, error }) => {
          patchState(store, {
            workspaces,
            loading: false,
            error
          });
        })
      )
    ),
    
    // 切換工作區
    switchWorkspace: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { switching: true, error: null })),
        switchMap((workspaceId) => {
          const workspace = store.workspaces().find(w => w.id === workspaceId);
          
          if (!workspace) {
            return of({ success: false, error: 'Workspace not found' });
          }
          
          // 更新最近使用列表
          const recentIds = [
            workspaceId,
            ...store.recentWorkspaceIds().filter(id => id !== workspaceId)
          ].slice(0, 5);
          
          patchState(store, {
            currentWorkspaceId: workspaceId,
            recentWorkspaceIds: recentIds
          });
          
          // 持久化到 localStorage
          localStorage.setItem('currentWorkspaceId', workspaceId);
          localStorage.setItem('recentWorkspaceIds', JSON.stringify(recentIds));
          
          return of({ success: true, error: null });
        }),
        tap(({ success, error }) => {
          patchState(store, {
            switching: false,
            error
          });
          
          if (success) {
            // 觸發其他 Store 重新載入
            // inject(WorkspaceStore).loadWorkspace();
          }
        })
      )
    ),
    
    // 切換我的最愛
    toggleFavorite: rxMethod<string>(
      pipe(
        switchMap((workspaceId) => {
          const favorites = store.favoriteWorkspaceIds();
          const isFavorite = favorites.includes(workspaceId);
          
          const newFavorites = isFavorite
            ? favorites.filter(id => id !== workspaceId)
            : [...favorites, workspaceId];
          
          patchState(store, { favoriteWorkspaceIds: newFavorites });
          
          // 持久化到 Firestore
          const accountId = globalShell.currentAccount()?.id;
          if (accountId) {
            const userPrefsRef = doc(firestore, 'userPreferences', accountId);
            return from(
              setDoc(userPrefsRef, { favoriteWorkspaceIds: newFavorites }, { merge: true })
            );
          }
          
          return of(null);
        })
      )
    ),
    
    // 設定搜尋關鍵字
    setSearchQuery(query: string) {
      patchState(store, { searchQuery: query });
    },
    
    // 重置 Store
    reset() {
      patchState(store, {
        workspaces: [],
        currentWorkspaceId: null,
        loading: false,
        switching: false,
        searchQuery: '',
        error: null
      });
    }
  }))
);
```

### 4.2 組件實作範例

#### 身份切換器組件
```typescript
// account-switcher.component.ts
import { Component, inject, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GlobalShell } from '@/stores/global-shell.store';

@Component({
  selector: 'app-account-switcher',
  standalone: true,
  imports: [
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <button 
      mat-button 
      [matMenuTriggerFor]="accountMenu"
      class="account-switcher-trigger"
      [disabled]="globalShell.accountSwitching()">
      
      <!-- Avatar -->
      <img 
        [src]="globalShell.currentAccountAvatar()" 
        [alt]="globalShell.currentAccountName()"
        class="avatar">
      
      <!-- Account Name -->
      <span class="account-name">
        {{ globalShell.currentAccountName() }}
      </span>
      
      <!-- Loading Spinner or Dropdown Icon -->
      @if (globalShell.accountSwitching()) {
        <mat-spinner diameter="16"></mat-spinner>
      } @else {
        <mat-icon>expand_more</mat-icon>
      }
    </button>

    <mat-menu #accountMenu="matMenu" class="account-menu">
      <!-- 個人帳號 -->
      @if (globalShell.userAccounts().length > 0) {
        <div class="menu-section-header">個人帳號</div>
        @for (account of globalShell.userAccounts(); track account.id) {
          <button 
            mat-menu-item 
            (click)="switchAccount(account.id)"
            [class.active]="account.id === globalShell.currentAccount()?.id">
            
            <img [src]="account.avatar" [alt]="account.name" class="item-avatar">
            
            <div class="item-content">
              <div class="item-name">{{ account.name }}</div>
              <div class="item-meta">User</div>
            </div>
            
            @if (account.id === globalShell.currentAccount()?.id) {
              <mat-icon class="check-icon">check</mat-icon>
            }
          </button>
        }
        <mat-divider></mat-divider>
      }
      
      <!-- 組織 -->
      @if (globalShell.organizationAccounts().length > 0) {
        <div class="menu-section-header">組織</div>
        @for (account of globalShell.organizationAccounts(); track account.id) {
          <button 
            mat-menu-item 
            (click)="switchAccount(account.id)"
            [class.active]="account.id === globalShell.currentAccount()?.id">
            
            <img [src]="account.avatar" [alt]="account.name" class="item-avatar">
            
            <div class="item-content">
              <div class="item-name">{{ account.name }}</div>
              <div class="item-meta">Organization · {{ account.role }}</div>
            </div>
            
            @if (account.id === globalShell.currentAccount()?.id) {
              <mat-icon class="check-icon">check</mat-icon>
            }
          </button>
        }
        <mat-divider></mat-divider>
      }
      
      <!-- 團隊 -->
      @if (globalShell.teamAccounts().length > 0) {
        <div class="menu-section-header">團隊</div>
        @for (account of globalShell.teamAccounts(); track account.id) {
          <button 
            mat-menu-item 
            (click)="switchAccount(account.id)"
            [class.active]="account.id === globalShell.currentAccount()?.id">
            
            <mat-icon class="item-avatar-icon">groups</mat-icon>
            
            <div class="item-content">
              <div class="item-name">{{ account.name }}</div>
              <div class="item-meta">Team · {{ account.role }}</div>
            </div>
            
            @if (account.id === globalShell.currentAccount()?.id) {
              <mat-icon class="check-icon">check</mat-icon>
            }
          </button>
        }
        <mat-divider></mat-divider>
      }
      
      <!-- 合作夥伴 -->
      @if (globalShell.partnerAccounts().length > 0) {
        <div class="menu-section-header">合作夥伴</div>
        @for (account of globalShell.partnerAccounts(); track account.id) {
          <button 
            mat-menu-item 
            (click)="switchAccount(account.id)"
            [class.active]="account.id === globalShell.currentAccount()?.id">
            
            <mat-icon class="item-avatar-icon">handshake</mat-icon>
            
            <div class="item-content">
              <div class="item-name">{{ account.name }}</div>
              <div class="item-meta">Partner · {{ account.role }}</div>
            </div>
            
            @if (account.id === globalShell.currentAccount()?.id) {
              <mat-icon class="check-icon">check</mat-icon>
            }
          </button>
        }
        <mat-divider></mat-divider>
      }
      
      <!-- 管理帳號 -->
      <button mat-menu-item (click)="manageAccounts()">
        <mat-icon>settings</mat-icon>
        <span>管理帳號...</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    .account-switcher-trigger {
      height: 48px;
      padding: 8px 12px;
      border-radius: 24px;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background-color 200ms ease;
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }
      
      .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
      }
      
      .account-name {
        font-size: 14px;
        font-weight: 500;
        max-width: 120px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      mat-icon, mat-spinner {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }
    
    .account-menu {
      .menu-section-header {
        font-size: 12px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.6);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 8px 16px;
        height: 32px;
        display: flex;
        align-items: center;
      }
      
      button[mat-menu-item] {
        height: 56px;
        padding: 8px 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        
        &.active {
          background-color: rgba(63, 81, 181, 0.08);
          border-left: 3px solid #3F51B5;
        }
        
        &:hover {
          background-color: rgba(0, 0, 0, 0.04);
        }
        
        .item-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }
        
        .item-avatar-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(0, 0, 0, 0.08);
          border-radius: 50%;
        }
        
        .item-content {
          flex: 1;
          min-width: 0;
          
          .item-name {
            font-size: 14px;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .item-meta {
            font-size: 12px;
            color: rgba(0, 0, 0, 0.6);
          }
        }
        
        .check-icon {
          color: #3F51B5;
        }
      }
    }
  `]
})
export class AccountSwitcherComponent {
  globalShell = inject(GlobalShell);
  snackBar = inject(MatSnackBar);
  
  switchAccount(accountId: string) {
    this.globalShell.switchAccount(accountId);
    
    // 顯示成功提示
    this.snackBar.open('已切換身份', '關閉', {
      duration: 2000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom'
    });
  }
  
  manageAccounts() {
    // 打開管理帳號的 Dialog
    console.log('管理帳號');
  }
}
```

#### 工作區切換器組件
```typescript
// workspace-switcher.component.ts
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WorkspaceListStore } from '@/stores/workspace-list.store';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-workspace-switcher',
  standalone: true,
  imports: [
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    FormsModule
  ],
  template: `
    <button 
      mat-button 
      [matMenuTriggerFor]="workspaceMenu"
      class="workspace-switcher-trigger"
      [disabled]="workspaceList.switching()">
      
      <!-- Workspace Icon -->
      <div class="workspace-icon" [style.background]="getWorkspaceGradient()">
        {{ getWorkspaceInitial() }}
      </div>
      
      <!-- Workspace Name -->
      <span class="workspace-name">
        {{ workspaceList.currentWorkspace()?.name || '選擇工作區' }}
      </span>
      
      <!-- Loading Spinner or Dropdown Icon -->
      @if (workspaceList.switching()) {
        <mat-spinner diameter="16"></mat-spinner>
      } @else {
        <mat-icon>unfold_more</mat-icon>
      }
    </button>

    <mat-menu #workspaceMenu="matMenu" class="workspace-menu" (closed)="onMenuClosed()">
      <!-- 搜尋框 -->
      <div class="search-container" (click)="$event.stopPropagation()">
        <mat-form-field appearance="outline" class="search-field">
          <mat-icon matPrefix>search</mat-icon>
          <input 
            matInput 
            placeholder="搜尋工作區..."
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange($event)"
            #searchInput>
        </mat-form-field>
      </div>
      
      <!-- 最近使用 -->
      @if (workspaceList.recentWorkspaces().length > 0 && !searchQuery()) {
        <div class="menu-section-header">最近使用</div>
        @for (workspace of workspaceList.recentWorkspaces(); track workspace.id) {
          <button 
            mat-menu-item 
            (click)="switchWorkspace(workspace.id)"
            [class.active]="workspace.id === workspaceList.currentWorkspaceId()"
            class="workspace-item">
            
            <div class="workspace-icon-small" [style.background]="getGradient(workspace.type)">
              {{ workspace.name[0] }}
            </div>
            
            <div class="item-content">
              <div class="item-name">{{ workspace.name }}</div>
              <div class="item-meta">{{ workspace.type }} · {{ workspace.memberCount }} members</div>
            </div>
            
            <button 
              mat-icon-button 
              class="favorite-btn"
              (click)="toggleFavorite($event, workspace.id)">
              <mat-icon [class.favorited]="isFavorite(workspace.id)">
                {{ isFavorite(workspace.id) ? 'star' : 'star_border' }}
              </mat-icon>
            </button>
            
            @if (workspace.id === workspaceList.currentWorkspaceId()) {
              <mat-icon class="check-icon">check</mat-icon>
            }
          </button>
        }
        <mat-divider></mat-divider>
      }
      
      <!-- 我的工作區 -->
      @if (filteredOwnedWorkspaces().length > 0) {
        <div class="menu-section-header">
          我的工作區
          <span class="count-badge">{{ filteredOwnedWorkspaces().length }}</span>
        </div>
        @for (workspace of filteredOwnedWorkspaces(); track workspace.id) {
          <button 
            mat-menu-item 
            (click)="switchWorkspace(workspace.id)"
            [class.active]="workspace.id === workspaceList.currentWorkspaceId()"
            class="workspace-item">
            
            <div class="workspace-icon-small" [style.background]="getGradient(workspace.type)">
              {{ workspace.name[0] }}
            </div>
            
            <div class="item-content">
              <div class="item-name">{{ workspace.name }}</div>
              <div class="item-meta">{{ workspace.type }} · Owner</div>
            </div>
            
            <button 
              mat-icon-button 
              class="favorite-btn"
              (click)="toggleFavorite($event, workspace.id)">
              <mat-icon [class.favorited]="isFavorite(workspace.id)">
                {{ isFavorite(workspace.id) ? 'star' : 'star_border' }}
              </mat-icon>
            </button>
            
            @if (workspace.id === workspaceList.currentWorkspaceId()) {
              <mat-icon class="check-icon">check</mat-icon>
            }
          </button>
        }
        <mat-divider></mat-divider>
      }
      
      <!-- 共享工作區 -->
      @if (filteredMemberWorkspaces().length > 0) {
        <div class="menu-section-header">
          共享工作區
          <span class="count-badge">{{ filteredMemberWorkspaces().length }}</span>
        </div>
        @for (workspace of filteredMemberWorkspaces(); track workspace.id) {
          <button 
            mat-menu-item 
            (click)="switchWorkspace(workspace.id)"
            [class.active]="workspace.id === workspaceList.currentWorkspaceId()"
            class="workspace-item">
            
            <div class="workspace-icon-small" [style.background]="getGradient(workspace.type)">
              {{ workspace.name[0] }}
            </div>
            
            <div class="item-content">
              <div class="item-name">{{ workspace.name }}</div>
              <div class="item-meta">{{ workspace.type }} · {{ workspace.role }}</div>
            </div>
            
            <button 
              mat-icon-button 
              class="favorite-btn"
              (click)="toggleFavorite($event, workspace.id)">
              <mat-icon [class.favorited]="isFavorite(workspace.id)">
                {{ isFavorite(workspace.id) ? 'star' : 'star_border' }}
              </mat-icon>
            </button>
            
            @if (workspace.id === workspaceList.currentWorkspaceId()) {
              <mat-icon class="check-icon">check</mat-icon>
            }
          </button>
        }
        <mat-divider></mat-divider>
      }
      
      <!-- 建立新工作區 -->
      <button mat-menu-item (click)="createWorkspace()" class="create-btn">
        <mat-icon>add_circle_outline</mat-icon>
        <span>建立新工作區</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    .workspace-switcher-trigger {
      height: 48px;
      padding: 8px 16px;
      border-radius: 8px;
      border: 1px solid rgba(0, 0, 0, 0.12);
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 200ms ease;
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.04);
        border-color: rgba(0, 0, 0, 0.24);
      }
      
      .workspace-icon {
        width: 24px;
        height: 24px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
        color: white;
      }
      
      .workspace-name {
        font-size: 16px;
        font-weight: 600;
        max-width: 200px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      mat-icon, mat-spinner {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }
    
    .workspace-menu {
      width: 360px;
      max-height: 480px;
      
      .search-container {
        padding: 8px;
        
        .search-field {
          width: 100%;
          
          ::ng-deep .mat-mdc-form-field-subscript-wrapper {
            display: none;
          }
        }
      }
      
      .menu-section-header {
        font-size: 11px;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.6);
        text-transform: uppercase;
        letter-spacing: 1px;
        padding: 16px 16px 8px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .count-badge {
          background-color: rgba(0, 0, 0, 0.08);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
        }
      }
      
      .workspace-item {
        height: 64px;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        transition: all 200ms ease;
        
        &.active {
          background-color: rgba(63, 81, 181, 0.08);
          border-left: 3px solid #3F51B5;
        }
        
        &:hover {
          background-color: rgba(0, 0, 0, 0.04);
          transform: translateX(4px);
          
          .favorite-btn {
            opacity: 1;
          }
        }
        
        .workspace-icon-small {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 600;
          color: white;
          flex-shrink: 0;
        }
        
        .item-content {
          flex: 1;
          min-width: 0;
          
          .item-name {
            font-size: 14px;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .item-meta {
            font-size: 12px;
            color: rgba(0, 0, 0, 0.6);
          }
        }
        
        .favorite-btn {
          opacity: 0;
          transition: opacity 200ms ease;
          
          mat-icon {
            font-size: 20px;
            
            &.favorited {
              color: #FFC107;
            }
          }
        }
        
        .check-icon {
          color: #3F51B5;
          font-size: 20px;
        }
      }
      
      .create-btn {
        border-top: 1px solid rgba(0, 0, 0, 0.12);
        height: 48px;
        color: #3F51B5;
        
        mat-icon {
          margin-right: 8px;
        }
        
        &:hover {
          background-color: rgba(63, 81, 181, 0.04);
        }
      }
    }
  `]
})
export class WorkspaceSwitcherComponent {
  workspaceList = inject(WorkspaceListStore);
  snackBar = inject(MatSnackBar);
  
  searchQuery = signal('');
  
  filteredOwnedWorkspaces = computed(() => {
    const query = this.searchQuery();
    return query
      ? this.workspaceList.searchResults().filter(w => 
          this.workspaceList.ownedWorkspaces().includes(w)
        )
      : this.workspaceList.ownedWorkspaces();
  });
  
  filteredMemberWorkspaces = computed(() => {
    const query = this.searchQuery();
    return query
      ? this.workspaceList.searchResults().filter(w => 
          this.workspaceList.memberWorkspaces().includes(w)
        )
      : this.workspaceList.memberWorkspaces();
  });
  
  getWorkspaceInitial(): string {
    return this.workspaceList.currentWorkspace()?.name[0] || '?';
  }
  
  getWorkspaceGradient(): string {
    const type = this.workspaceList.currentWorkspace()?.type;
    return this.getGradient(type || 'Project');
  }
  
  getGradient(type: string): string {
    const gradients: Record<string, string> = {
      'Project': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'Department': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'Client': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'Campaign': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'Product': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      'Internal': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    };
    
    return gradients[type] || gradients['Project'];
  }
  
  isFavorite(workspaceId: string): boolean {
    return this.workspaceList.favoriteWorkspaceIds().includes(workspaceId);
  }
  
  switchWorkspace(workspaceId: string) {
    this.workspaceList.switchWorkspace(workspaceId);
    
    this.snackBar.open('已切換工作區', '關閉', {
      duration: 2000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom'
    });
  }
  
  toggleFavorite(event: Event, workspaceId: string) {
    event.stopPropagation();
    this.workspaceList.toggleFavorite(workspaceId);
  }
  
  onSearchChange(query: string) {
    this.workspaceList.setSearchQuery(query);
  }
  
  onMenuClosed() {
    this.searchQuery.set('');
    this.workspaceList.setSearchQuery('');
  }
  
  createWorkspace() {
    console.log('建立新工作區');
    // 打開建立工作區的 Dialog
  }
}
```

### 4.3 鍵盤快捷鍵整合

```typescript
// keyboard-shortcuts.service.ts
import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { fromEvent } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class KeyboardShortcutsService {
  private dialog = inject(MatDialog);
  
  init() {
    // 監聽全域鍵盤事件
    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(
        filter(event => {
          // 檢查是否按下 Ctrl/Cmd
          const isCtrlOrCmd = event.ctrlKey || event.metaKey;
          return isCtrlOrCmd;
        }),
        map(event => ({
          key: event.key.toLowerCase(),
          shift: event.shiftKey,
          ctrl: event.ctrlKey || event.metaKey
        }))
      )
      .subscribe(({ key, shift, ctrl }) => {
        // Ctrl/Cmd + K: 開啟工作區命令面板
        if (key === 'k' && ctrl && !shift) {
          this.openWorkspaceCommandPalette();
        }
        
        // Ctrl/Cmd + Shift + A: 開啟身份切換器
        if (key === 'a' && ctrl && shift) {
          this.openAccountSwitcher();
        }
      });
  }
  
  private openWorkspaceCommandPalette() {
    // 開啟工作區命令面板 Dialog
    // this.dialog.open(WorkspaceCommandPaletteComponent);
    console.log('開啟工作區命令面板');
  }
  
  private openAccountSwitcher() {
    // 觸發身份切換器
    console.log('開啟身份切換器');
  }
}
```

### 4.4 路由整合

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { WorkspaceListStore } from '@/stores/workspace-list.store';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/workspace',
    pathMatch: 'full'
  },
  {
    path: 'workspace',
    canActivate: [() => {
      const workspaceList = inject(WorkspaceListStore);
      const router = inject(Router);
      
      // 如果沒有選擇工作區，重定向到工作區選擇頁
      if (!workspaceList.currentWorkspaceId()) {
        return router.createUrlTree(['/select-workspace']);
      }
      
      return true;
    }],
    children: [
      {
        path: ':workspaceId',
        loadComponent: () => import('./workspace/workspace.component'),
        children: [
          // 模組路由...
        ]
      }
    ]
  },
  {
    path: 'select-workspace',
    loadComponent: () => import('./select-workspace/select-workspace.component')
  }
];
```

---

## 📱 5. 響應式設計完整規範

### 5.1 斷點定義

```typescript
// breakpoints.ts
export const BREAKPOINTS = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
  
  // Material CDK Breakpoints
  xs: '(max-width: 599px)',
  sm: '(min-width: 600px) and (max-width: 959px)',
  md: '(min-width: 960px) and (max-width: 1279px)',
  lg: '(min-width: 1280px) and (max-width: 1919px)',
  xl: '(min-width: 1920px)'
} as const;
```

### 5.2 移動端適配

```typescript
// 使用 Angular CDK BreakpointObserver
import { BreakpointObserver } from '@angular/cdk/layout';

export class ResponsiveComponent {
  private breakpointObserver = inject(BreakpointObserver);
  
  isMobile = signal(false);
  isTablet = signal(false);
  isDesktop = signal(false);
  
  constructor() {
    this.breakpointObserver
      .observe([BREAKPOINTS.mobile])
      .subscribe(result => {
        this.isMobile.set(result.matches);
      });
      
    this.breakpointObserver
      .observe([BREAKPOINTS.tablet])
      .subscribe(result => {
        this.isTablet.set(result.matches);
      });
      
    this.breakpointObserver
      .observe([BREAKPOINTS.desktop])
      .subscribe(result => {
        this.isDesktop.set(result.matches);
      });
  }
}
```

---

## 🎯 6. 無障礙設計 (A11y)

### 6.1 ARIA 屬性

```typescript
// 身份切換器
<button 
  mat-button 
  [matMenuTriggerFor]="accountMenu"
  aria-label="切換身份"
  aria-haspopup="true"
  [attr.aria-expanded]="isMenuOpen">
  <!-- ... -->
</button>

// 工作區切換器
<button 
  mat-button 
  [matMenuTriggerFor]="workspaceMenu"
  aria-label="切換工作區"
  aria-haspopup="true"
  [attr.aria-expanded]="isMenuOpen">
  <!-- ... -->
</button>
```

### 6.2 鍵盤導航

```typescript
// MatMenu 已內建支援:
// - Tab: 焦點移動
// - ↑↓: 選擇項目
// - Enter/Space: 執行選擇
// - Esc: 關閉選單
// - Home/End: 跳到第一個/最後一個項目
```

### 6.3 螢幕閱讀器

```typescript
// 使用 Live Region 通知狀態變更
<div aria-live="polite" aria-atomic="true" class="sr-only">
  {{ statusMessage }}
</div>

// CSS
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## 🔍 7. 效能優化

### 7.1 虛擬滾動

```typescript
// 當工作區數量 > 50 時使用虛擬滾動
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

<cdk-virtual-scroll-viewport itemSize="64" class="workspace-list">
  @for (workspace of workspaces; track workspace.id) {
    <button mat-menu-item>
      <!-- ... -->
    </button>
  }
</cdk-virtual-scroll-viewport>
```

### 7.2 延遲載入

```typescript
// 使用 @defer 延遲載入重量級組件
@defer (on viewport) {
  <app-workspace-command-palette />
} @placeholder {
  <div class="loading-placeholder"></div>
}
```

### 7.3 搜尋防抖

```typescript
// 使用 RxJS debounceTime
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

searchQuery$ = new Subject<string>();

constructor() {
  this.searchQuery$
    .pipe(
      debounceTime(300),
      distinctUntilChanged()
    )
    .subscribe(query => {
      this.workspaceList.setSearchQuery(query);
    });
}
```

---

## 📦 8. 狀態持久化

### 8.1 LocalStorage

```typescript
// workspace-persistence.service.ts
@Injectable({ providedIn: 'root' })
export class WorkspacePersistenceService {
  saveCurrentWorkspace(workspaceId: string) {
    localStorage.setItem('currentWorkspaceId', workspaceId);
  }
  
  loadCurrentWorkspace(): string | null {
    return localStorage.getItem('currentWorkspaceId');
  }
  
  saveRecentWorkspaces(workspaceIds: string[]) {
    localStorage.setItem('recentWorkspaceIds', JSON.stringify(workspaceIds));
  }
  
  loadRecentWorkspaces(): string[] {
    const data = localStorage.getItem('recentWorkspaceIds');
    return data ? JSON.parse(data) : [];
  }
}
```

### 8.2 Firestore 同步

```typescript
// 將使用者偏好儲存到 Firestore
async saveFavorites(userId: string, favoriteIds: string[]) {
  const userPrefsRef = doc(this.firestore, 'userPreferences', userId);
  await setDoc(userPrefsRef, { favoriteWorkspaceIds: favoriteIds }, { merge: true });
}

async loadFavorites(userId: string): Promise<string[]> {
  const userPrefsRef = doc(this.firestore, 'userPreferences', userId);
  const snapshot = await getDoc(userPrefsRef);
  return snapshot.data()?.favoriteWorkspaceIds || [];
}
```

---

## ✅ 9. 測試策略

### 9.1 單元測試

```typescript
// account-switcher.component.spec.ts
describe('AccountSwitcherComponent', () => {
  it('應該顯示當前帳號名稱', () => {
    // ...
  });
  
  it('應該在點擊時切換帳號', () => {
    // ...
  });
  
  it('應該在切換中顯示載入指示器', () => {
    // ...
  });
});
```

### 9.2 整合測試

```typescript
// workspace-switcher.integration.spec.ts
describe('WorkspaceSwitcher Integration', () => {
  it('應該從 Firestore 載入工作區列表', () => {
    // ...
  });
  
  it('應該在切換工作區後更新 URL', () => {
    // ...
  });
});
```

### 9.3 E2E 測試

```typescript
// workspace-switcher.e2e.spec.ts
describe('Workspace Switcher E2E', () => {
  it('使用者應該能夠透過 UI 切換工作區', () => {
    // ...
  });
  
  it('使用者應該能夠透過快捷鍵開啟命令面板', () => {
    // ...
  });
});
```

---

## 📚 10. 文件與範例

### 10.1 Storybook 文件

```typescript
// account-switcher.stories.ts
import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta<AccountSwitcherComponent> = {
  title: 'Navigation/AccountSwitcher',
  component: AccountSwitcherComponent
};

export default meta;
type Story = StoryObj<AccountSwitcherComponent>;

export const Default: Story = {};

export const WithMultipleAccounts: Story = {
  // ...
};
```

### 10.2 使用說明

```markdown
# 切換器使用指南

## 身份切換器

### 觸發方式
1. 點擊右上角的身份按鈕
2. 使用快捷鍵 `Ctrl/Cmd + Shift + A`

### 功能
- 在 User / Organization / Team / Partner 之間切換
- 查看所有可用身份
- 管理帳號設定

## 工作區切換器

### 觸發方式
1. 點擊左上角的工作區按鈕
2. 使用快捷鍵 `Ctrl/Cmd + K` 開啟命令面板

### 功能
- 快速切換工作區
- 搜尋工作區
- 加入我的最愛
- 建立新工作區
```

---

## 🎉 總結

此規格文件補充了以下內容:

### ✅ 完整定義
1. **身份切換器** - 完整的 UI/UX 設計與技術實作
2. **工作區切換器** - 包含基本選單與命令面板兩種模式
3. **統一設計規範** - Material Design 3 設計系統
4. **響應式設計** - 完整的跨裝置適配方案
5. **無障礙設計** - WCAG 2.1 AA 級無障礙支援
6. **效能優化** - 虛擬滾動、延遲載入、防抖等
7. **狀態管理** - 完整的 NgRx Signals Store 架構
8. **測試策略** - 單元測試、整合測試、E2E 測試

### 🎨 設計特色
- 現代化 Material Design 3 風格
- 直觀的互動體驗
- 流暢的動畫效果
- 完整的鍵盤快捷鍵支援
- 優秀的無障礙設計

### 🔧 技術亮點
- 純 Angular 20+ 與 Material 組件
- NgRx Signals 響應式狀態管理
- Firebase 後端整合
- TypeScript 類型安全
- 符合最佳實踐

此規格可直接用於開發實作! 🚀
