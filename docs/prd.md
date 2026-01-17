# 多工作區團隊協作系統架構定義 - NgRx Signals 純響應式版本

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

## NgRx Signals 純響應式架構

### 核心原則

SignalsPrinciple = PureReactivity (NoSideEffectInComputed | ImmutableState | UnidirectionalDataFlow | DerivedStateFromSignals)

SignalsPhilosophy = CompositionOverInheritance (SmallStores | FocusedResponsibility | ReusableMethods | OperatorComposition)

SignalsConstraints = NoComponentIO | NoComputedSideEffect | NoDirectMutation | NoCrossStoreDirectAccess | NoCircularDependency

---

### 狀態層級定義

StateArchitecture = LayeredSignalStores (GlobalShell | WorkspaceListStore | WorkspaceStore | FeatureStore | EntityStore)

StateIsolation = Boundary (EachLayerIndependent | ExplicitDependency | NoLeakage | ClearOwnership)

StateLifecycle = MountOnDemand (LazyLoad | AutoCleanup | MemoryManagement | ScopeControl)

---

### GlobalShell 全域殼層

GlobalShell = RootLevelStore (Auth | Config | Layout | Router | WorkspaceList)

GlobalShellScope = ApplicationWide (SessionState | UserPreferences | ThemeSettings | LanguageSettings)

GlobalShellResponsibility = CrossWorkspaceState (AuthenticatedUser | GlobalConfig | LayoutState | NavigationState)

GlobalShellSignals = ReactiveState (authUser | appConfig | layoutMode | currentRoute)

GlobalShellComputed = DerivedSignals (isAuthenticated | userDisplayName | effectiveTheme | canAccessWorkspaces)

GlobalShellMethods = StateMutations (updateAuthUser | setConfig | toggleLayout | navigate)

GlobalShellEffects = AsyncIntegration (syncAuthState | loadRemoteConfig | persistLayoutPreference | trackNavigation)

GlobalShellProvision = providedIn root (SingletonStore | AppLevelInjection | GlobalAvailability)

---

### WorkspaceListStore 工作區列表儲存

WorkspaceListStore = CollectionStore (AllWorkspaces | Memberships | RecentWorkspaces | FavoriteWorkspaces)

WorkspaceListScope = AccountLevel (UserOwnedWorkspaces | UserMemberWorkspaces | WorkspaceMetadataCache)

WorkspaceListResponsibility = WorkspaceManagement (LoadWorkspaces | CreateWorkspace | ArchiveWorkspace | SwitchWorkspace)

WorkspaceListSignals = ReactiveState (workspaces | currentWorkspaceId | loading | error)

WorkspaceListComputed = DerivedSignals (ownedWorkspaces | memberWorkspaces | recentWorkspaces | currentWorkspace | hasWorkspaces)

WorkspaceListMethods = StateMutations (loadWorkspaces | selectWorkspace | addWorkspace | removeWorkspace | updateWorkspace)

WorkspaceListEffects = AsyncIntegration (fetchWorkspacesFromFirestore | subscribeToWorkspaceChanges | syncCurrentWorkspace | cacheWorkspaceList)

WorkspaceListProvision = providedIn root (SingletonStore | CrossComponentAccess | PersistentState)

WorkspaceListCleanup = OnDestroy (unsubscribeFirestore | clearCache | releaseResources)

---

### WorkspaceStore 工作區儲存

WorkspaceStore = ContextStore (CurrentWorkspaceContext | WorkspacePermissions | WorkspacePreferences | WorkspaceMembers)

WorkspaceScope = SingleWorkspace (SelectedWorkspaceData | WorkspaceConfiguration | WorkspaceState)

WorkspaceResponsibility = WorkspaceContext (LoadWorkspaceDetails | ManagePermissions | ConfigureWorkspace | TrackWorkspaceState)

WorkspaceSignals = ReactiveState (workspace | permissions | preferences | members | modules | loading | error)

WorkspaceComputed = DerivedSignals (workspaceName | workspaceOwner | currentUserRole | currentUserPermissions | enabledModules | workspaceQuota | quotaUsage)

WorkspaceMethods = StateMutations (loadWorkspace | updateWorkspace | setPermissions | setPreferences | addMember | removeMember)

WorkspaceEffects = AsyncIntegration (fetchWorkspaceFromFirestore | subscribeToWorkspaceChanges | syncPermissions | syncMembers | enforceQuota)

WorkspaceProvision = providedIn root (SingletonStore | SharedAcrossModules | WorkspaceScoped)

WorkspaceIsolation = StateReset (clearOnWorkspaceSwitch | preventLeakage | isolateWorkspaceData)

WorkspaceDependency = InjectGlobal (WorkspaceListStore.currentWorkspaceId | GlobalShell.authUser)

---

### FeatureStore 功能儲存

FeatureStore = ModuleStore (ModuleSpecificState | ModuleData | ModuleConfiguration)

FeatureScope = SingleModule (TasksModule | DocumentsModule | MembersModule | PermissionsModule | AuditModule | SettingsModule | JournalModule)

FeatureResponsibility = ModuleBehavior (LoadModuleData | ManageModuleEntities | ModuleOperations | ModuleState)

FeatureSignals = ReactiveState (entities | selectedEntity | filters | sorting | pagination | loading | error)

FeatureComputed = DerivedSignals (filteredEntities | sortedEntities | paginatedEntities | entityCount | hasSelection | canCreateEntity)

FeatureMethods = StateMutations (loadEntities | addEntity | updateEntity | deleteEntity | selectEntity | setFilters | setSorting | setPagination)

FeatureEffects = AsyncIntegration (fetchEntitiesFromFirestore | subscribeToEntityChanges | persistEntity | validateEntity | notifyChanges)

FeatureProvision = providedIn root OR scoped (DependsOnUsagePattern | SharedOrIsolated | MemoryConsideration)

FeatureIsolation = WorkspaceScoped (AlwaysFilterByWorkspaceId | NoCrossWorkspaceData | ResetOnWorkspaceSwitch)

FeatureDependency = InjectWorkspace (WorkspaceStore.workspace.id | WorkspaceStore.currentUserPermissions)

---

### EntityStore 實體儲存

EntityStore = EntityCollectionStore (EntityCache | EntityAdapter | NormalizedState)

EntityScope = EntityType (Task | Document | Member | Permission | AuditLog | Setting | JournalEntry)

EntityResponsibility = EntityManagement (CacheEntities | NormalizeData | OptimisticUpdate | SyncWithBackend)

EntitySignals = ReactiveState (entities | ids | selectedIds | loading | error)

EntityComputed = DerivedSignals (entitiesArray | entitiesMap | selectedEntities | entityById)

EntityMethods = StateMutations (setAllEntities | setOneEntity | addOneEntity | updateOneEntity | removeOneEntity | setManyEntities | upsertManyEntities)

EntityEffects = AsyncIntegration (syncWithFirestore | handleRealtimeUpdates | applyOptimisticUpdate | rollbackOnError)

EntityProvision = providedIn root OR scoped (DependsOnCachingStrategy | SharedOrPerFeature)

EntityNormalization = DataStructure (ById | AllIds | LookupOptimization | DenormalizeOnRead)

EntityDependency = InjectFeature (FeatureStore.filters | FeatureStore.sorting)

---

### 響應式操作符整合

OperatorUsage = @ngrx/operators (PureReactiveComposition | NoSideEffectOperators | StreamTransformation)

SignalEffect = rxMethod (ReactiveMethod | StreamBasedEffect | AutomaticSubscription | OnDestroyCleanup)

EffectPattern = rxMethod<Input>(pipe(operator1, operator2, tap(mutation)))

EffectPrinciple = NoReturnValue (OnlyMutateState | NoDirectReturn | SideEffectOnly)

CommonOperators = switchMap | mergeMap | concatMap | exhaustMap | debounceTime | distinctUntilChanged | catchError | retry | tap

FirestoreIntegration = RxFire (collectionData | docData | collection | doc | query | where | orderBy | limit)

EffectErrorHandling = CatchAndRecover (catchError | tapError | retryWhen | fallbackValue | updateErrorState)

---

### Store 組合模式

StoreComposition = FeatureComposition (withState | withComputed | withMethods | withHooks)

withState = InitialState (DefineSignals | SetDefaultValues | TypeSafety)

withComputed = DerivedState (ComputedSignals | MemoizedCalculation | AutoRecompute | NoDependencyCycle)

withMethods = Mutations (StateUpdate | BusinessLogic | EffectTrigger | InjectedDependency)

withHooks = Lifecycle (onInit | onDestroy | afterUpdate)

---

### Store 依賴注入

StoreDependency = InjectedServices (FirebaseServices | OtherStores | UtilityServices)

DependencyPattern = inject(Service) within withMethods

InjectFirebase = inject(Firestore) | inject(Auth) | inject(Storage) | inject(Functions)

InjectStore = inject(WorkspaceStore) | inject(GlobalShell) | inject(FeatureStore)

CrossStoreCommunication = ReactToDependency (ReadSignals | CallMethods | SubscribeToComputed | NoDirectMutation)

---

### 狀態變更模式

StateMutation = patchState (PartialUpdate | ImmutableUpdate | SignalNotification)

MutationPattern = patchState(store, newState) OR patchState(store, updater => result)

MutationPrinciple = Immutability (NeverMutateDirectly | AlwaysCreateNew | PreserveReference)

OptimisticUpdate = Pattern (UpdateLocalFirst | SyncToBackend | RollbackOnError | ShowPendingState)

---

### 選擇器模式

Selector = Computed (ReadOnlySignal | AutoUpdate | Memoization | PureFunction)

SelectorPattern = computed(() => derivation(signals()))

SelectorComposition = CombineMultiple (MultipleSignalInputs | ComplexDerivation | TypeSafe)

SelectorPerformance = Memoization (OnlyRecomputeWhenInputsChange | ShareComputedResult | AvoidRedundantCalculation)

---

### 效應模式

Effect = rxMethod (TriggerReaction | AsyncOperation | StateMutation | ErrorHandling)

EffectTrigger = SignalInput | ManualCall | StreamSource

EffectExecution = AsyncPipeline (TriggerInput → Transform → SideEffect → MutateState)

EffectIsolation = NoReturnValue (VoidReturn | OnlyMutate | NoDirectOutput)

EffectCleanup = AutoUnsubscribe (OnStoreDestroy | OnComponentDestroy | MemoryLeak Prevention)

---

### 狀態隔離與切換

StateIsolation = WorkspaceBoundary (NoDataLeakage | SeparateCache | IndependentState)

StateReset = OnWorkspaceSwitch (ClearWorkspaceStore | ClearFeatureStores | ClearEntityStores | KeepGlobalShell)

ResetPattern = ConditionalEffect (ListenToWorkspaceChange → TriggerReset → ReloadNewWorkspace)

ResetScope = Selective (ResetWorkspaceScopedOnly | PreserveGlobalState | ClearModuleState)

---

### Store 生命週期

StoreLifecycle = Creation → Initialization → Usage → Cleanup → Destruction

Initialization = onInit (LoadInitialState | SubscribeToSources | SetupEffects)

Usage = ActivePhase (ReadSignals | CallMethods | ReactToChanges | TriggerEffects)

Cleanup = onDestroy (UnsubscribeAll | ClearState | ReleaseResources | StopEffects)

MemoryManagement = Automatic (GarbageCollectable | NoMemoryLeak | ProperCleanup)

---

### 測試策略

TestingApproach = UnitTest (TestStore | TestComputed | TestMethods | TestEffects)

TestStore = Isolation (MockDependencies | TestStateChanges | VerifyComputed | AssertEffects)

TestComputed = PureFunction (InputOutput | Deterministic | NoSideEffect)

TestMethods = StateMutation (BeforeAfter | VerifyPatch | MockEffects)

TestEffects = AsyncBehavior (MockFirestore | SimulateStream | VerifyMutation | HandleError)

---

## NgRx Signals 與架構層級映射

### 映射關係

ArchitectureMapping = LayerToStore (Account → GlobalShell | WorkspaceList → WorkspaceListStore | Workspace → WorkspaceStore | Module → FeatureStore | Entity → EntityStore)

---

### GlobalShell 映射

GlobalShell.Auth = AuthSignals (authUser | authToken | authClaims | isAuthenticated) + AuthMethods (login | logout | refresh) + AuthEffects (syncAuthState | validateToken)

GlobalShell.Config = ConfigSignals (appConfig | featureFlags | remoteConfig) + ConfigMethods (loadConfig | updateConfig) + ConfigEffects (fetchRemoteConfig | cacheConfig)

GlobalShell.Layout = LayoutSignals (layoutMode | sidebarCollapsed | theme) + LayoutMethods (toggleSidebar | setTheme) + LayoutEffects (persistLayout | syncTheme)

GlobalShell.Router = RouterSignals (currentRoute | routeParams | queryParams) + RouterMethods (navigate | back) + RouterEffects (trackNavigation | syncRoute)

---

### WorkspaceListStore 映射

WorkspaceList.OwnedWorkspaces = Computed (filter workspaces where role = Owner)

WorkspaceList.MemberWorkspaces = Computed (filter workspaces where role in (Admin | Member | Guest))

WorkspaceList.RecentWorkspaces = Computed (sort workspaces by lastAccessedAt | take 5)

WorkspaceList.FavoriteWorkspaces = Computed (filter workspaces where isFavorite = true)

WorkspaceList.CurrentWorkspace = Computed (find workspace by currentWorkspaceId)

---

### WorkspaceStore 映射

Workspace.Identity = Signals (id | name | slug | description | avatar | ownerId)

Workspace.Members = Signals (members | roles | invitations) + Computed (memberCount | ownerInfo | adminList)

Workspace.Permissions = Signals (permissions | policies) + Computed (currentUserRole | currentUserPermissions | canInvite | canM