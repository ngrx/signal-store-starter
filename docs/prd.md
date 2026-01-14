---

Account → Workspace → Module → Entity
誰 → 在哪 → 做什麼 → 狀態

Account = Identity (User | Organization | Bot | Subunit (team | partner)) → @angular/fire/auth (Authentication | Token | Session | Claims)

Team = SubUnit (Internal) → @angular/fire/firestore (Collection | Query | SecurityRule)
Partner = SubUnit (External) → @angular/fire/firestore (Collection | WebhookBinding | AccessRule)

Workspace = LogicalContainer (Resources | Permissions | Modules | SharedContext) → @angular/fire/firestore (Document | SubCollection | RuleScope)

Module = FunctionalUnit (WhatToDo | BoundedContext) → @angular/fire/firestore (CollectionGroup | Index | QueryPlan)

Entity = StateObject (Data | Behavior) → @angular/fire/firestore (Document | RealtimeSync | Converter)

Modules = overview | documents | tasks | members | permissions | audit | settings | journal

Module.overview = WorkspaceSummary (Dashboard | Health | Usage) → @angular/fire/firestore (Aggregation | Count | Query)

Module.documents = ContentManagement (File | Version | Permission) → @angular/fire/storage (Object | Upload | Download | Metadata) + @angular/fire/firestore (Index | Reference)

Module.tasks = WorkManagement (Task | Workflow | Status) → @angular/fire/firestore (Transaction | Batch | Query)

Module.members = IdentityMapping (User | Team | Partner | Role) → @angular/fire/firestore (SecurityRule | Lookup | Index)

Module.permissions = AccessControl (Role | Policy | Scope) → @angular/fire/firestore (SecurityRule | CustomClaim | RuleTest)

Module.audit = Traceability (AuditLog | Compliance | History) → @angular/fire/firestore (AppendOnly | TTL | Partition)

Module.settings = Configuration (Preference | FeatureFlag | Quota) → @angular/fire/remote-config (RealtimeConfig | Cache | Condition)

Module.journal = EventJournal (Activity | Timeline | ChangeLog) → @angular/fire/firestore (ChangeFeed | OrderBy | Cursor)


Command = Intent (ChangeRequest | Validation) → @angular/fire/functions (CallableFunction | AuthContext)
Query = ReadModel (View | Projection) → @angular/fire/firestore (Query | Snapshot | Converter)
Policy = AuthorizationRule (Scope | Role | Constraint) → @angular/fire/firestore (SecurityRule | Emulator)
Permission = Capability (Action | Resource) → @angular/fire/auth (CustomClaim)
Guard = RuntimeEnforcement (Access | Quota | RateLimit) → @angular/fire/authGuard (RouterGuard | ClaimCheck)

SharedContext = CrossModuleContext (EventBus | Schema | Contract | Semantic) → @angular/fire/firestore (SharedCollection | SchemaVersion)

EventBus = SharedContext (CoreBackbone | CrossModuleCommunication | Decoupling) → @angular/fire/functions (PubSubTrigger | EventBridge)
EventFlow = Stream (Direction | Order | Backpressure) → @angular/fire/functions (BackgroundTrigger | RetryPolicy)
EventStore = Persistence (AppendOnly | Replay | Snapshot) → @angular/fire/firestore (ImmutableLog | SnapshotDoc)
EventBusType = InMemory | MessageQueue | Stream → @angular/fire/functions (PubSub | Scheduler)
EventPayload = DomainData (StateChange | Intent | Fact) → @angular/fire/firestore (Serializer | Converter)
EventMetadata = Trace | Correlation | Version | Timestamp | Producer | Schema → @angular/fire/firestore (FieldTransform | ServerTimestamp)
EventLifecycle = Created → Validated → Published → Consumed → Archived → @angular/fire/functions (Pipeline)
EventSemantics = Meaning | Contract | Compatibility | Evolution → @angular/fire/firestore (SchemaVersioning)
EventSourcing = StateDerivedFromEvents → @angular/fire/firestore (EventReplay | CursorQuery)
CausalityTracking = CorrelationId | CausationId | TraceChain → @angular/fire/functions (ContextPropagation)

Metric = Measurement (Throughput | Latency | ErrorRate | Saturation) → @angular/fire/performance (Trace | Metric)
Log = StructuredRecord (Audit | Debug | Security | Business) → @angular/fire/analytics (Event | Parameter)
Health = Probe (Liveness | Readiness | Dependency | Degradation) → @angular/fire/functions (HealthCheckEndpoint)

AuthStack = @angular/fire/auth (Authentication | IdentityProvider) → @delon/auth (Token | Session | Interceptor) → @delon/acl (Authorization | ACL | RouteGuard)
DataStack = @angular/fire/firestore (Database | Query | Offline) → @angular/fire/storage (ObjectBucket | Upload | Download)
StateStack = NgRx Signals (ReactiveState | ComputedSignals | SignalAdapter) → @ngrx/operators (Operators for pure reactive composition)

NgRxBoundary = UI (Command | Query) → SignalState (ReactiveStore | ComputedSelector) → SignalEffect (AsyncIntegration | EventBus)
NgRxRule

NoComponentIO = true

NoReducerSideEffect = true

NoCrossModuleStateAccess = true

NoDirectStoreMutation = true

NoCircularFeatureDependency = true


NgRxMapping = Workspace → FeatureShell | Module → FeatureSlice | Entity → EntityAdapter | Command → Action | Query → Selector | Event → EffectStream | Policy → GuardSelector
StateLayer = GlobalShell | WorkspaceScope | FeatureSlice | EntityCache

GlobalShell = Auth | Config | Layout | Router → @angular/fire/auth + @angular/fire/remote-config

WorkspaceScope = Context | Permission | Preference → @angular/fire/firestore

FeatureSlice = ModuleState → @angular/fire/firestore (QuerySync)

EntityCache = SignalEntityAdapter → @angular/fire/firestore (LocalCache)


ApiLayer = @angular/fire (FirestoreQuery | CallableFunction | SecurityRule | SchemaGate)
Integration = @angular/fire (CloudFunctionWebhook | Scheduler | PubSub | Extension)
Cache = @angular/fire (OfflineCache | IndexedDB | Memory | TTL)
Config = @angular/fire (RemoteConfig | EnvConfig | SecretManager)
FeatureToggle = @angular/fire (RemoteConfigFlag | ABTesting | GradualRollout)


---

備註：

所有 state / effect / entity CRUD 都用 NgRx Signals + @ngrx/operators 實現純響應式流。

子單位仍統稱 SubUnit，可分 Internal (Team) 或 External (Partner)。

去掉了傳統 Store / Effects / Entity / RouterStore / ComponentStore / DevTools，完全純 Signals。



---
