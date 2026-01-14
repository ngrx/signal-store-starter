# Implementation Roadmap - 100% Reactive PRD Features

Based on `docs/prd.md` requirements using @angular/fire + @ngrx/signals + @ngrx/operators

## Architecture Compliance ✅

Current status verified against Context7 latest documentation:

### ✅ Already Implemented (Modern Reactive Patterns)
1. **Authentication System** (@angular/fire/auth + NgRx Signals)
   - rxMethod for all async operations
   - Real-time auth state sync
   - No manual subscriptions

2. **Domain Structure** (Firestore + NgRx Signals)
   - Organization, Team, Partner, Workspace stores
   - collectionData/docData for reactive streams
   - rxMethod for all CRUD operations

3. **Context System** (NgRx Signals + Computed)
   - Dynamic context switching
   - combineLatest for parallel loading
   - History tracking

4. **Dynamic Menu** (Pure Computed Signals)
   - Role-based visibility
   - Auto-recalculation on context change
   - Zero manual subscriptions

5. **Workspace Modules** (Lazy-loaded Routes)
   - Overview (fully implemented with dashboard)
   - 7 placeholder modules ready for implementation

## 🎯 Phase 3: Complete Workspace Modules (PRD Requirements)

### 1. Documents Module (@angular/fire/storage + Firestore)
**PRD:** `Module.documents = ContentManagement (File | Version | Permission)`

**Implementation:**
- [ ] DocumentStore (NgRx Signals)
  - `withState`: documents[], uploadProgress, selectedDocument
  - `withComputed`: isUploading, documentCount, filteredDocuments
  - `withMethods` using rxMethod:
    - uploadDocument$ (Storage + Firestore metadata)
    - downloadDocument$ (Storage getDownloadURL)
    - deleteDocument$ (Storage + Firestore)
    - updateMetadata$ (Firestore)
    - shareDocument$ (Firestore permissions)
- [ ] DocumentService (@angular/fire/storage)
  - uploadFile() → uploadBytesResumable() with progress
  - getDownloadURL() → reactive stream
  - deleteObject() → Promise wrapped in Observable
  - listAll() → reactive file list
- [ ] DocumentsComponent
  - File upload with drag-and-drop
  - Progress indicators
  - File list with thumbnails
  - Version history
  - Permission management UI

### 2. Tasks Module (@angular/fire/firestore transactions)
**PRD:** `Module.tasks = WorkManagement (Task | Workflow | Status)`

**Implementation:**
- [ ] TaskStore (NgRx Signals)
  - `withState`: tasks[], workflows[], filters, selectedTask
  - `withComputed`: activeTasks, completedTasks, tasksByWorkflow
  - `withMethods` using rxMethod:
    - createTask$ (Firestore batch write)
    - updateTaskStatus$ (Firestore transaction)
    - assignTask$ (Firestore update)
    - deleteTask$ (Firestore transaction with cascade)
    - reorderTasks$ (Firestore batch update)
- [ ] TaskService (@angular/fire/firestore)
  - Reactive queries with collectionData
  - Transaction-based status updates
  - Batch operations for bulk actions
  - Query constraints for filtering
- [ ] TasksComponent
  - Kanban board (To Do, In Progress, Done)
  - Drag-and-drop task cards
  - Task creation/editing forms
  - Workflow visualization
  - Filtering and search

### 3. Members Module (@angular/fire/firestore + Security Rules)
**PRD:** `Module.members = IdentityMapping (User | Team | Partner | Role)`

**Implementation:**
- [ ] MemberStore (NgRx Signals)
  - `withState`: members[], roles[], invitations[], selectedMember
  - `withComputed`: activeMembers, pendingInvitations, membersByRole
  - `withMethods` using rxMethod:
    - inviteMember$ (Firestore + email trigger)
    - updateRole$ (Firestore + custom claims)
    - removeMember$ (Firestore + cleanup)
    - acceptInvitation$ (Firestore transaction)
- [ ] MemberService (@angular/fire/firestore)
  - Reactive member queries
  - Role-based filtering
  - Invitation management
  - Security rule integration
- [ ] MembersComponent
  - Member list with avatars
  - Role badges
  - Invitation management
  - Role assignment UI
  - Member search/filter

### 4. Permissions Module (@angular/fire/firestore + Custom Claims)
**PRD:** `Module.permissions = AccessControl (Role | Policy | Scope)`

**Implementation:**
- [ ] PermissionStore (NgRx Signals)
  - `withState`: roles[], policies[], scopes[], permissions[]
  - `withComputed`: effectivePermissions, roleHierarchy
  - `withMethods` using rxMethod:
    - createRole$ (Firestore)
    - assignPermissions$ (Firestore + custom claims)
    - createPolicy$ (Firestore)
    - validateAccess$ (computed from claims)
- [ ] PermissionService (@angular/fire/firestore + @angular/fire/functions)
  - Role CRUD operations
  - Policy evaluation
  - Custom claims management (via callable functions)
  - Security rule testing
- [ ] PermissionsComponent
  - Role matrix editor
  - Permission assignment UI
  - Policy builder
  - Access testing tool

### 5. Audit Module (@angular/fire/firestore append-only)
**PRD:** `Module.audit = Traceability (AuditLog | Compliance | History)`

**Implementation:**
- [ ] AuditStore (NgRx Signals)
  - `withState`: logs[], filters, dateRange, selectedLog
  - `withComputed`: filteredLogs, logsByUser, logsByAction
  - `withMethods` using rxMethod:
    - queryLogs$ (Firestore query with pagination)
    - exportLogs$ (callable function)
    - searchLogs$ (Firestore text search)
- [ ] AuditService (@angular/fire/firestore)
  - Append-only log writes
  - Query with time-based pagination
  - Compliance report generation
  - TTL-based archiving
- [ ] AuditComponent
  - Timeline view of audit logs
  - Advanced filtering (user, action, date range)
  - Log details viewer
  - Export functionality
  - Compliance reports

### 6. Settings Module (@angular/fire/remote-config)
**PRD:** `Module.settings = Configuration (Preference | FeatureFlag | Quota)`

**Implementation:**
- [ ] SettingsStore (NgRx Signals)
  - `withState`: preferences, featureFlags, quotas, remoteConfig
  - `withComputed`: enabledFeatures, quotaUsage
  - `withMethods` using rxMethod:
    - updatePreference$ (Firestore)
    - toggleFeature$ (Remote Config)
    - updateQuota$ (Firestore transaction)
    - syncRemoteConfig$ (Remote Config fetch)
- [ ] SettingsService (@angular/fire/remote-config + Firestore)
  - Remote Config integration
  - Feature flag management
  - Preference persistence
  - Quota tracking
- [ ] SettingsComponent
  - User preferences editor
  - Feature flags toggle
  - Quota usage display
  - Theme/language settings
  - Notification preferences

### 7. Journal Module (@angular/fire/firestore change feed)
**PRD:** `Module.journal = EventJournal (Activity | Timeline | ChangeLog)`

**Implementation:**
- [ ] JournalStore (NgRx Signals)
  - `withState`: events[], timeline[], cursor, hasMore
  - `withComputed`: eventsByType, recentEvents
  - `withMethods` using rxMethod:
    - loadEvents$ (Firestore query with cursor pagination)
    - subscribeToChanges$ (Firestore snapshot listener)
    - filterEvents$ (query constraints)
- [ ] JournalService (@angular/fire/firestore)
  - Change feed subscription
  - Event stream with cursor pagination
  - Event filtering and ordering
  - Real-time event updates
- [ ] JournalComponent
  - Activity timeline
  - Event filtering by type
  - Infinite scroll pagination
  - Real-time event updates
  - Event detail viewer

## 🎯 Phase 4: Cross-Module Infrastructure

### 8. EventBus System (@angular/fire/functions PubSub)
**PRD:** `EventBus = SharedContext (CoreBackbone | CrossModuleCommunication | Decoupling)`

**Implementation:**
- [ ] EventBusStore (NgRx Signals)
  - `withState`: events[], subscriptions[], eventHistory
  - `withComputed`: activeSubscriptions, eventCount
  - `withMethods` using rxMethod:
    - publish$ (Firestore + Cloud Functions trigger)
    - subscribe$ (Firestore snapshot listener)
    - unsubscribe$ (cleanup)
- [ ] EventBusService (@angular/fire/functions)
  - PubSub trigger integration
  - Event routing
  - Subscription management
  - Event persistence
- [ ] Event Types:
  - DocumentCreated, DocumentUpdated, DocumentDeleted
  - TaskCreated, TaskStatusChanged, TaskAssigned
  - MemberInvited, MemberJoined, MemberRemoved
  - PermissionChanged, RoleAssigned
  - AuditLogCreated
  - SettingChanged

### 9. Command/Query/Policy Architecture
**PRD:** `Command = Intent | Query = ReadModel | Policy = AuthorizationRule`

**Implementation:**
- [ ] CommandBus (NgRx Signals)
  - Command validation
  - Command execution pipeline
  - Undo/Redo support
- [ ] QueryBus (NgRx Signals)
  - Optimized read models
  - Projection caching
  - Query memoization
- [ ] PolicyEvaluator (NgRx Signals + Firestore)
  - Rule evaluation engine
  - Permission checking
  - Scope validation

### 10. Metrics/Logging/Health (@angular/fire/performance + analytics)
**PRD:** `Metric = Measurement | Log = StructuredRecord | Health = Probe`

**Implementation:**
- [ ] MetricsStore (NgRx Signals)
  - Performance traces
  - Custom metrics
  - Error tracking
- [ ] HealthService (@angular/fire/functions)
  - Liveness checks
  - Readiness checks
  - Dependency health
- [ ] Logging Integration (@angular/fire/analytics)
  - Structured logging
  - Event tracking
  - User analytics

## 🎯 Phase 5: Advanced Features

### 11. Offline Support & PWA
- [ ] Service Worker integration
- [ ] Offline data caching
- [ ] Sync queue for offline operations
- [ ] Network status handling

### 12. Real-time Collaboration
- [ ] Presence system
- [ ] Collaborative editing
- [ ] Live cursors
- [ ] Conflict resolution

### 13. Search & Analytics
- [ ] Full-text search integration
- [ ] Advanced filtering
- [ ] Analytics dashboards
- [ ] Reporting tools

## 🎯 Implementation Order

1. ✅ Phase 1 & 2: Authentication, Domain Structure, Context, Menu, Module Shells (COMPLETE)
2. **Phase 3.1**: Documents Module (Storage integration)
3. **Phase 3.2**: Tasks Module (Workflow management)
4. **Phase 3.3**: Members Module (Identity & roles)
5. **Phase 3.4**: Permissions Module (Access control)
6. **Phase 3.5**: Audit Module (Compliance logging)
7. **Phase 3.6**: Settings Module (Config management)
8. **Phase 3.7**: Journal Module (Event feed)
9. **Phase 4**: EventBus, Command/Query/Policy, Metrics
10. **Phase 5**: Advanced features

## 📊 Success Criteria

Each module must have:
- ✅ 100% reactive implementation (rxMethod, collectionData/docData)
- ✅ NgRx Signals store with computed signals
- ✅ Zero manual subscriptions
- ✅ Firestore/Storage integration with error handling
- ✅ Responsive UI with loading states
- ✅ Role-based access control
- ✅ Real-time updates
- ✅ Comprehensive documentation

## 🔍 Context7 Verification

Before implementing each module:
1. Query Context7 for latest @angular/fire patterns
2. Verify rxMethod usage matches latest docs
3. Ensure Firestore operations use modern APIs
4. Validate against NgRx Signals best practices
5. Check for any deprecated patterns
