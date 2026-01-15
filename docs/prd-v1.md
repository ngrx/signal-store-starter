# 多工作區團隊協作系統架構定義

---

## 核心層級架構

```
Account → WorkspaceList → Workspace → Module → Entity
誰 → 擁有哪些 → 在哪 → 做什麼 → 狀態
```

---

## 1. Account 身份層

Account = Identity (User | Organization | Bot | SubUnit) → @angular/fire/auth (Authentication | Token | Session | Claims)

AccountType = User | Organization | Bot | SubUnit

User = IndividualAccount (Email | Profile | Preferences)

Organization = CollectiveAccount (Domain | Branding | BillingEntity)

Bot = AutomatedAccount (ApiKey | Webhook | ServiceAccount)

SubUnit = DelegatedAccount (Team | Partner)

Team = SubUnit (Internal | Collaborative | Hierarchical) → @angular/fire/firestore (Collection | Query | SecurityRule)

Partner = SubUnit (External | Contractual | LimitedAccess) → @angular/fire/firestore (Collection | WebhookBinding | AccessRule)

AccountRelation = Membership (Account ↔ Workspace | Role | JoinedAt | Status)

WorkspaceMembership = Relationship (AccountId | WorkspaceId | Role | Permissions | InvitedBy | JoinedAt)

MembershipRole = Owner | Admin | Member | Guest | Bot

MembershipStatus = Active | Invited | Suspended | Archived

---

## 2. WorkspaceList 工作區集合層

WorkspaceList = AccountWorkspaces (OwnedWorkspaces | MemberWorkspaces | ArchivedWorkspaces)

OwnedWorkspaces = Workspaces where Account.role = Owner

MemberWorkspaces = Workspaces where Account.role in (Admin | Member | Guest)

ArchivedWorkspaces = Workspaces where Account.status = Archived

WorkspaceDiscovery = Navigation (RecentWorkspaces | FavoriteWorkspaces | WorkspaceSearch)

WorkspaceContext = CurrentWorkspace (ActiveWorkspaceId | WorkspaceMetadata | QuickSwitch)

WorkspaceSwitching = Navigation (SwitchWorkspace | LeaveWorkspace | ArchiveWorkspace)

---

## 3. Workspace 工作區層

Workspace = LogicalContainer (Resources | Permissions | Modules | SharedContext | Members) → @angular/fire/firestore (Document | SubCollection | RuleScope)

WorkspaceIdentity = Metadata (Id | Name | Slug | Description | Avatar | OwnerId)

WorkspaceType = Project | Department | Client | Campaign | Product | Internal

WorkspaceLifecycle = Draft → Active → Archived → Deleted

WorkspaceQuota = Limits (MaxMembers | MaxStorage | MaxModules | RateLimits)

WorkspaceIsolation = Boundary (DataIsolation | PermissionScope | ResourceNamespace | BillingScope)

WorkspaceMemberList = Collection (Users | Teams | Partners | Bots | Roles)

WorkspaceInvitation = Process (InviteLink | EmailInvite | DomainAutoJoin | ApprovalRequired)

---

## 4. Module 功能模組層

Module = FunctionalUnit (WhatToDo | BoundedContext | WorkspaceScoped) → @angular/fire/firestore (CollectionGroup | Index | QueryPlan)

ModuleList = overview | documents | tasks | members | permissions | audit | settings | journal

Module.overview = WorkspaceSummary (Dashboard | Health | Usage | RecentActivity) → @angular/fire/firestore (Aggregation | Count | Query)

Module.documents = ContentManagement (File | Folder | Version | Permission | Sharing) → @angular/fire/storage (Object | Upload | Download | Metadata) + @angular/fire/firestore (Index | Reference)

Module.tasks = WorkManagement (Task | Subtask | Workflow | Status | Assignment | Deadline) → @angular/fire/firestore (Transaction | Batch | Query)

Module.members = IdentityMapping (User | Team | Partner | Role | Invitation | Onboarding) → @angular/fire/firestore (SecurityRule | Lookup | Index)

Module.permissions = AccessControl (Role | Policy | Scope | Inheritance | Override) → @angular/fire/firestore (SecurityRule | CustomClaim | RuleTest)

Module.audit = Traceability (AuditLog | Compliance | History | Export | Retention) → @angular/fire/firestore (AppendOnly | TTL | Partition)

Module.settings = Configuration (WorkspacePreference | FeatureFlag | Quota | Integration) → @angular/fire/remote-config (RealtimeConfig | Cache | Condition)

Module.journal = EventJournal (Activity | Timeline | ChangeLog | Notification | Feed) → @angular/fire/firestore (ChangeFeed | OrderBy | Cursor)

ModuleVisibility = Configuration (Enabled | Disabled | Hidden | CustomAccess)

ModulePermission = Access (Read | Write | Admin | CustomPermission)

---

## 5. Entity 實體層

Entity = StateObject (Data | Behavior | WorkspaceScoped | ModuleScoped) → @angular/fire/firestore (Document | RealtimeSync | Converter)

EntityIdentity = Metadata (Id | Type | WorkspaceId | ModuleId | CreatedBy | CreatedAt | UpdatedAt)

EntityOwnership = Ownership (Creator | Owner | Collaborators | SharedWith)

EntityLifecycle = Draft → Published → Archived → Deleted

EntityVersion = Versioning (VersionNumber | ChangeHistory | Rollback | Diff)

EntityRelation = Reference (ParentEntity | ChildEntities | RelatedEntities | CrossModuleLinks)

---

## 橫切關注點

### 命令與查詢

Command = Intent (ChangeRequest | Validation | WorkspaceContext | Authorization) → @angular/fire/functions (CallableFunction | AuthContext)

Query = ReadModel (View | Projection | WorkspaceFiltered | Pagination) → @angular/fire/firestore (Query | Snapshot | Converter)

CommandScope = Workspace (EnsureWorkspaceAccess | ValidateWorkspaceMembership | CheckQuota)

QueryScope = Workspace (FilterByWorkspace | ApplyWorkspacePermissions | IsolateWorkspaceData)

### 權限與授權

Policy = AuthorizationRule (Scope | Role | Constraint | Inheritance) → @angular/fire/firestore (SecurityRule | Emulator)

Permission = Capability (Action | Resource | WorkspaceScoped | ModuleScoped) → @angular/fire/auth (CustomClaim)

Guard = RuntimeEnforcement (Access | Quota | RateLimit | WorkspaceGuard) → @angular/fire/authGuard (RouterGuard | ClaimCheck)

WorkspaceGuard = Validation (HasWorkspaceAccess | IsWorkspaceMember | IsWorkspaceOwner | HasModulePermission)

PermissionInheritance = Hierarchy (WorkspaceLevel → ModuleLevel → EntityLevel)

PermissionOverride = Exception (ExplicitDeny | ExplicitGrant | TemporaryAccess)

### 共享上下文

SharedContext = CrossModuleContext (EventBus | Schema | Contract | Semantic | WorkspaceScoped) → @angular/fire/firestore (SharedCollection | SchemaVersion)

WorkspaceEventBus = SharedContext (WorkspaceScopedEvents | CrossModuleCommunication | WorkspaceNotifications)

CrossWorkspaceEvent = Event (WorkspaceCreated | WorkspaceArchived | MemberJoined | MemberLeft | OwnershipTransferred)

### 事件系統

EventBus = SharedContext (CoreBackbone | CrossModuleCommunication | Decoupling | WorkspaceIsolation) → @angular/fire/functions (PubSubTrigger | EventBridge)

EventFlow = Stream (Direction | Order | Backpressure | WorkspaceFiltered) → @angular/fire/functions (BackgroundTrigger | RetryPolicy)

EventStore = Persistence (AppendOnly | Replay | Snapshot | WorkspacePartitioned) → @angular/fire/firestore (ImmutableLog | SnapshotDoc)

EventBusType = InMemory | MessageQueue | Stream → @angular/fire/functions (PubSub | Scheduler)

EventPayload = DomainData (StateChange | Intent | Fact | WorkspaceContext) → @angular/fire/firestore (Serializer | Converter)

EventMetadata = Trace | Correlation | Version | Timestamp | Producer | Schema | WorkspaceId → @angular/fire/firestore (FieldTransform | ServerTimestamp)

EventLifecycle = Created → Validated → Published → Consumed → Archived → @angular/fire/functions (Pipeline)

EventSemantics = Meaning | Contract | Compatibility | Evolution → @angular/fire/firestore (SchemaVersioning)

EventSourcing = StateDerivedFromEvents (WorkspaceState | ModuleState | EntityState) → @angular/fire/firestore (EventReplay | CursorQuery)

CausalityTracking = CorrelationId | CausationId | TraceChain | WorkspaceId → @angular/fire/functions (ContextPropagation)

WorkspaceEventScope = Isolation (EventsPerWorkspace | NoLeakage | PrivacyBoundary)

### 可觀測性

Metric = Measurement (Throughput | Latency | ErrorRate | Saturation | WorkspaceUsage) → @angular/fire/performance (Trace | Metric)

Log = StructuredRecord (Audit | Debug | Security | Business | WorkspaceActivity) → @angular/fire/analytics (Event | Parameter)

Health = Probe (Liveness | Readiness | Dependency | Degradation | WorkspaceHealth) → @angular/fire/functions (HealthCheckEndpoint)

WorkspaceMetrics = Analytics (ActiveMembers | StorageUsage | ApiCalls | ModuleUsage | TaskCompletion)

---

## 技術堆疊

### 認證與授權

AuthStack = @angular/fire/auth (Authentication | IdentityProvider) → @delon/auth (Token | Session | Interceptor | WorkspaceContext) → @delon/acl (Authorization | ACL | RouteGuard | WorkspaceGuard)

AuthContext = Session (AccountId | CurrentWorkspaceId | WorkspaceMemberships | EffectivePermissions)

### 資料與儲存

DataStack = @angular/fire/firestore (Database | Query | Offline | WorkspacePartitioning) → @angular/fire/storage (ObjectBucket | Upload | Download | WorkspaceNamespace)

DataIsolation = Firestore (WorkspaceCollections | SecurityRules | DataPartitioning | TenantIsolation)

### 狀態管理

StateStack = NgRx Signals (ReactiveState | ComputedSignals | SignalAdapter) → @ngrx/operators (Operators for pure reactive composition)

NgRxBoundary = UI (Command | Query) → SignalState (ReactiveStore | ComputedSelector) → SignalEffect (AsyncIntegration | EventBus)

NgRxRule = NoComponentIO | NoReducerSideEffect | NoCrossModuleStateAccess | NoDirectStoreMutation | NoCircularFeatureDependency

NgRxMapping = Workspace → FeatureShell | Module → FeatureSlice | Entity → EntityAdapter | Command → Action | Query → Selector | Event → EffectStream | Policy → GuardSelector

StateLayer = GlobalShell | WorkspaceListScope | WorkspaceScope | FeatureSlice | EntityCache

GlobalShell = Auth | Config | Layout | Router | WorkspaceList → @angular/fire/auth + @angular/fire/remote-config

WorkspaceListScope = WorkspaceCollection (OwnedWorkspaces | MemberWorkspaces | RecentWorkspaces | FavoriteWorkspaces) → @angular/fire/firestore

WorkspaceScope = Context (CurrentWorkspace | WorkspacePermissions | WorkspacePreferences | WorkspaceMembers) → @angular/fire/firestore

FeatureSlice = ModuleState (WorkspaceScoped | ModuleData | ModuleConfig) → @angular/fire/firestore (QuerySync)

EntityCache = SignalEntityAdapter (WorkspaceFiltered | LocalCache | OptimisticUpdate) → @angular/fire/firestore (LocalCache)

WorkspaceStateIsolation = Boundary (NoLeakage | ScopeEnforcement | SwitchCleanup)

---

## API 與整合層

ApiLayer = @angular/fire (FirestoreQuery | CallableFunction | SecurityRule | SchemaGate | WorkspaceValidation)

Integration = @angular/fire (CloudFunctionWebhook | Scheduler | PubSub | Extension | WorkspaceWebhooks)

Cache = @angular/fire (OfflineCache | IndexedDB | Memory | TTL | WorkspaceCache)

Config = @angular/fire (RemoteConfig | EnvConfig | SecretManager | WorkspaceConfig)

FeatureToggle = @angular/fire (RemoteConfigFlag | ABTesting | GradualRollout | WorkspaceFeatures)

---

## 多工作區特定概念

### 工作區生命週期

WorkspaceCreation = Process (CreateWorkspace | SetupModules | InviteMembers | ConfigurePermissions)

WorkspaceOnboarding = Process (WelcomeMessage | TourGuide | TemplateSelection | InitialData)

WorkspaceArchival = Process (ArchiveWorkspace | NotifyMembers | RetainData | DisableAccess)

WorkspaceDeletion = Process (DeleteWorkspace | RemoveMembers | PurgeData | AuditLog)

### 工作區導航

WorkspaceNavigation = UI (WorkspaceSwitcher | WorkspaceSidebar | WorkspaceBreadcrumb | WorkspaceHome)

WorkspaceRouter = Routing (WorkspaceIdParam | WorkspaceScopedRoutes | WorkspaceGuards | DeepLinks)

WorkspaceURL = Pattern (/workspace/:workspaceId/module/:moduleId/entity/:entityId)

### 工作區協作

WorkspaceCollaboration = Features (RealTimeSync | PresenceIndicator | Notifications | Mentions | Comments)

WorkspaceNotification = Channel (InApp | Email | Push | Webhook | DigestEmail)

WorkspaceActivity = Stream (MemberActivity | EntityChanges | SystemEvents | CrossWorkspaceEvents)

### 工作區計費

WorkspaceBilling = Management (Subscription | Usage | Quota | Overage | Invoice)

WorkspaceQuotaEnforcement = Limits (SoftLimit | HardLimit | GracePeriod | Notification)

---

## Firestore 資料結構概念

```
/accounts/{accountId}
  - profile, preferences, settings
  - /workspaceMemberships/{workspaceId} (role, permissions, joinedAt, status)

/workspaces/{workspaceId}
  - metadata (name, ownerId, type, status, createdAt)
  - quota (maxMembers, maxStorage, usedStorage)
  - /members/{accountId} (role, permissions, joinedAt, invitedBy)
  - /modules/{moduleId} (enabled, config, permissions)
  - /sharedContext (eventSchema, contracts)
  
/workspaces/{workspaceId}/tasks/{taskId}
  - workspaceId (indexed)
  - moduleId, entityData, metadata
  
/workspaces/{workspaceId}/documents/{documentId}
  - workspaceId (indexed)
  - moduleId, storageRef, metadata
  
/workspaces/{workspaceId}/journal/{eventId}
  - workspaceId (indexed)
  - eventType, payload, metadata, timestamp
  
/workspaces/{workspaceId}/audit/{logId}
  - workspaceId (indexed)
  - action, actor, target, timestamp
```

---

## 安全規則概念

WorkspaceSecurity = Firestore Rules (WorkspaceIsolation | MembershipValidation | PermissionCheck | QuotaEnforcement)

SecurityRulePrinciples = IsolateWorkspaces | ValidateMembership | EnforcePermissions | PreventLeakage | AuditAccess

DataAccessPattern = Request validates (Auth.uid exists) → (Membership in workspace exists) → (Permission granted) → (Quota available)

---

## 備註

所有 state / effect / entity CRUD 都用 NgRx Signals + @ngrx/operators 實現純響應式流

子單位仍統稱 SubUnit，可分 Internal (Team) 或 External (Partner)

去掉了傳統 Store / Effects / Entity / RouterStore / ComponentStore / DevTools，完全純 Signals

每個 Workspace 都是完全隔離的租戶邊界，資料不跨工作區共享

Account 可以同時擁有或加入多個 Workspace，透過 WorkspaceMembership 關聯

WorkspaceContext 始終存在於所有操作中，確保資料隔離與權限範圍

所有 Module 與 Entity 都屬於特定 Workspace，不存在全域共享的業務資料

工作區切換時，前端狀態完全重置，避免狀態洩漏

---