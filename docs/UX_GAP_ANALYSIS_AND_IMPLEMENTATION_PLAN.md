# YellowGrid UX Gap Analysis & Implementation Plan

## Executive Summary

This document analyzes the gap between the current Yellow Grid web application and the target UX defined in the `aux-ux/` documentation and interactive demos. The analysis identifies **critical missing features**, **UX paradigm shifts**, and provides a **phased implementation roadmap**.

---

## 1. Current Application State

### 1.1 Existing Pages & Features
| Page | Current Features | Status |
|------|------------------|--------|
| Dashboard | 4 stat cards, recent activity (empty), alerts (empty) | Basic |
| Service Orders | List view, filters, status badges, bulk assign | Functional |
| Providers | List view, filters, risk/type badges, add form | Functional |
| Assignments | List view, basic management | Basic |
| Calendar | React Big Calendar, heatmap toggle, provider filter | Basic |
| Tasks | Page exists but minimal functionality | Stub |
| Analytics | Basic analytics page | Basic |
| Performance | Performance metrics page | Basic |

### 1.2 Current UX Paradigm
- **List-centric**: Most pages are table/list views with filters
- **Static dashboards**: Stats update on refresh, no real-time
- **No workflow visualization**: Status shown as badges, no journey/flow view
- **No AI assistance**: No chat interface or AI-powered features
- **Basic navigation**: Standard sidebar without contextual actions

---

## 2. Target UX (from aux-ux documentation)

### 2.1 Core Experience Paradigms

#### A. Operations Grid View (index.html)
**The "Control Tower" - Primary operational interface**
- **Weekly grid view** organized by Provider → Crew → Day
- **Visual slots** showing service type (INST, TV CF, TV QT, RWK, PRE BK)
- **Status badges** on slots: Contract OK/NOK, Go Exec OK/NOK, WCF OK/NOK
- **Real-time KPIs**: On-time %, At risk count, Unassigned count
- **Multi-day job spanning** with visual continuity
- **Search across** customer, order ID, sales ID, provider, crew

#### B. Interactive Journey Demo (demo-interactive.html)
**Scenario-based workflow visualization**
- **Metro-line UI**: Step-by-step journey through service execution
- **8 scenarios**: Simple Install, TV Quotation, Service Pack, Complex Project, Rework, Maintenance, Dépannage, Subscription
- **Card-based progression**: Each step shows detailed data, actions, stakeholder view
- **Data flow visualization**: JSON payload display, Kafka messages

#### C. Operator Cockpit (operator-cockpit.html)
**Action-focused dashboard for service operators**
- **Metric cards**: Pre-Scheduled, Scheduled, In Progress, Awaiting WCF
- **Critical Actions panel**: Contract not signed, Pro allocation failed, No-show, WCF unsigned
- **Priority Tasks**: Top 5 high-priority items with quick actions (Call, WhatsApp)
- **Service table**: Full service management with inline actions
- **AI Chat Widget**: Floating assistant with quick actions (Contracts, Assign Pros, Daily Summary, WCF Status)

### 2.2 Key UX Patterns

#### AI Chat Assistant
```
- Floating button bottom-right
- Quick action buttons: Contracts, Assign Pros, Daily Summary, WCF Status
- Contextual suggestions based on current view
- Natural language interaction for complex queries
```

#### Action-Oriented Modals
```
- Assign Technician: Show available techs with ratings, active jobs
- Reschedule: Current schedule → New date/time picker
- Contact Customer: Call, SMS, WhatsApp options
- Sign Contract: Digital signature pad
- Handle WCF: Quality assessment dropdown, notes, approve/reject
```

#### Real-Time Updates
```
- Dashboard metrics auto-refresh
- State changes trigger UI updates (window.addEventListener('yellowgrid-state-changed'))
- Badge counts update dynamically
```

---

## 3. Gap Analysis

### 3.1 CRITICAL GAPS (Must Have)

| Gap ID | Feature | Current | Target | Priority |
|--------|---------|---------|--------|----------|
| G-01 | Operations Grid | None | Full provider/crew weekly grid | P0 |
| G-02 | AI Chat Assistant | None | Floating chat with quick actions | P0 |
| G-03 | Critical Actions Panel | Empty alerts section | Categorized urgent items | P0 |
| G-04 | Priority Tasks Widget | None | Top 5 with inline actions | P0 |
| G-05 | Service Journey View | None | Metro-line workflow visualization | P1 |
| G-06 | Contract Signing Flow | None | Digital signature modal | P0 |
| G-07 | WCF Handling Flow | None | Quality assessment modal | P0 |
| G-08 | Multi-Provider Dispatch | None | Dépannage parallel dispatch UI | P1 |

### 3.2 MAJOR GAPS (Should Have)

| Gap ID | Feature | Current | Target | Priority |
|--------|---------|---------|--------|----------|
| G-09 | Scenario Visualization | None | 8 scenario types with custom cards | P1 |
| G-10 | Provider Capacity Grid | Basic list | Visual capacity/availability grid | P1 |
| G-11 | Customer Contact Modal | None | Multi-channel contact options | P2 |
| G-12 | Technician Assignment | Basic assign | Rich tech selection with ratings | P2 |
| G-13 | Real-time Notifications | Basic bell icon | Push notifications with action links | P2 |
| G-14 | Search Enhancement | Basic search | Cross-entity search (customer, order, provider, crew) | P2 |

### 3.3 ENHANCEMENT GAPS (Nice to Have)

| Gap ID | Feature | Current | Target | Priority |
|--------|---------|---------|--------|----------|
| G-15 | Data Flow Viewer | None | JSON payload visualization | P3 |
| G-16 | Stakeholder Perspective | None | View as Customer/Provider/System | P3 |
| G-17 | AI Enrichment Display | None | AI analysis results in UI | P3 |
| G-18 | Subscription Management | None | Recurring service UI | P3 |

---

## 4. Implementation Plan

### Phase 1: Core Dashboard Overhaul (Week 1-2)

#### 4.1.1 New Dashboard Layout
```
┌────────────────────────────────────────────────────────────┐
│ Header: Welcome, [Operator Name] │ AI Active │ Bell │ User │
├────────────────────────────────────────────────────────────┤
│ Metric Cards (4): Pre-Scheduled │ Scheduled │ In Progress │ Awaiting WCF │
├──────────────────────────┬─────────────────────────────────┤
│ Critical Actions (Left)  │ Priority Tasks (Right)          │
│ - Contract >72h (count)  │ #PX-123 URGENT                  │
│ - No Pro Assigned (count)│ Customer - Service              │
│ - Pro No-Show (count)    │ €value │ Date                   │
│ - WCF >48h (count)       │ [Call] [WhatsApp] [Assign]      │
├──────────────────────────┴─────────────────────────────────┤
│ View Toggle: [Dashboard] [Operations Grid] [Tasks Table]   │
└────────────────────────────────────────────────────────────┘
```

#### 4.1.2 Files to Create/Modify
- `web/src/pages/DashboardPage.tsx` - Complete redesign
- `web/src/components/dashboard/MetricCard.tsx` - Green gradient cards
- `web/src/components/dashboard/CriticalActionsPanel.tsx` - Alert list
- `web/src/components/dashboard/PriorityTasksPanel.tsx` - Task cards
- `web/src/components/dashboard/QuickActionButton.tsx` - Call/WhatsApp/Assign

### Phase 2: Operations Grid View (Week 2-3)

#### 4.2.1 Grid Structure
```
┌────────────────────────────────────────────────────────────┐
│ Week Navigation: ◀ Week of Nov 25-30 ▶ │ Search [.......] │
├─────────┬──────┬──────┬──────┬──────┬──────┬──────┬───────┤
│Crew/Stat│ MON  │ TUE* │ WED  │ THU  │ FRI  │ SAT  │       │
├─────────┼──────┼──────┼──────┼──────┼──────┼──────┼───────┤
│Unassign │ slot │ slot │ slot │ slot │ slot │ slot │       │
├─────────┼──────┼──────┼──────┼──────┼──────┼──────┼───────┤
│Provider │ slot │ slot │ slot │ slot │ slot │ slot │       │
│  Crew A │      │      │      │      │      │      │       │
├─────────┼──────┼──────┼──────┼──────┼──────┼──────┼───────┤
│Provider │ slot │ slot │ slot │ slot │ slot │ slot │       │
│  Crew B │      │      │      │      │      │      │       │
└─────────┴──────┴──────┴──────┴──────┴──────┴──────┴───────┘
```

#### 4.2.2 Slot Types & Colors
- `INST` (Installation): Green-ish - `rgba(25, 135, 84, 0.3)`
- `TV CF` (Technical Visit Confirmation): Orange - `rgba(253, 126, 20, 0.3)`
- `TV QT` (Technical Visit Quotation): Yellow - `rgba(255, 193, 7, 0.3)`
- `RWK` (Rework): Red - `rgba(220, 53, 69, 0.3)`
- `PRE BK` (Pre-Booking): Blue - `rgba(30, 58, 138, 0.35)`
- `Available`: Light blue dashed - `rgba(59, 130, 246, 0.08)`

#### 4.2.3 Files to Create
- `web/src/pages/operations/OperationsGridPage.tsx` - Main grid page
- `web/src/components/operations/GridLayout.tsx` - Grid container
- `web/src/components/operations/GridSidebar.tsx` - Provider/Crew sidebar
- `web/src/components/operations/GridRow.tsx` - Day cells row
- `web/src/components/operations/GridSlot.tsx` - Individual slot
- `web/src/components/operations/WeekNavigation.tsx` - Week picker
- `web/src/components/operations/GridSearch.tsx` - Enhanced search
- `web/src/components/operations/GridLegend.tsx` - Color legend

### Phase 3: AI Chat Assistant (Week 3-4)

#### 4.3.1 Chat Widget Structure
```
┌─────────────────────────────────────┐
│ 🤖 YellowGrid AI Assistant         │
│     AI + Human Support        [X]   │
├─────────────────────────────────────┤
│ 🤖 AI: Hello! I can help with      │
│    contracts, assignments,          │
│    scheduling...                    │
│                                     │
│ 👤 You: Show unsigned contracts    │
│                                     │
│ 🤖 AI: Found 12 contracts >72h:    │
│    • #PX-377903 - Ines Broncano    │
│    • #SX-375742 - Fernando Checa   │
│    [View All] [Call First]          │
├─────────────────────────────────────┤
│ Quick: [Contracts] [Assign Pros]    │
│        [Daily Summary] [WCF Status] │
├─────────────────────────────────────┤
│ Ask anything... [Send 📤]          │
└─────────────────────────────────────┘
```

#### 4.3.2 Files to Create
- `web/src/components/ai-chat/AIChatWidget.tsx` - Main widget
- `web/src/components/ai-chat/ChatMessage.tsx` - Message bubble
- `web/src/components/ai-chat/QuickActionButtons.tsx` - Quick actions
- `web/src/components/ai-chat/ChatInput.tsx` - Input with send
- `web/src/services/ai-chat-service.ts` - Backend integration
- `web/src/hooks/useAIChat.ts` - Chat state management

### Phase 4: Action Modals (Week 4-5)

#### 4.4.1 Modal Types
1. **Assign Technician Modal**
   - Service details (customer, type, date)
   - Available technicians list with ratings, skills, active jobs
   - One-click assignment

2. **Reschedule Modal**
   - Current schedule display
   - Date/time pickers
   - Reason selection

3. **Contact Customer Modal**
   - Customer details
   - Multi-channel: Call, SMS, WhatsApp, Email
   - Quick message templates

4. **Sign Contract Modal**
   - Contract summary
   - Terms display
   - Signature pad (canvas-based)
   - Submit/Cancel

5. **Handle WCF Modal**
   - Service info
   - Quality assessment dropdown
   - Notes textarea
   - Approve/Reject with reserves

#### 4.4.2 Files to Create
- `web/src/components/modals/AssignTechnicianModal.tsx`
- `web/src/components/modals/RescheduleModal.tsx`
- `web/src/components/modals/ContactCustomerModal.tsx`
- `web/src/components/modals/SignContractModal.tsx`
- `web/src/components/modals/HandleWCFModal.tsx`
- `web/src/components/modals/ModalContainer.tsx`

### Phase 5: Service Journey View (Week 5-6)

#### 4.5.1 Journey UI
- Metro-line visualization with station dots
- Current station highlighted
- Step details card showing:
  - Step name and description
  - Relevant data fields
  - Actions available
  - Next step preview

#### 4.5.2 Files to Create
- `web/src/pages/service-orders/ServiceOrderJourneyPage.tsx`
- `web/src/components/journey/MetroLine.tsx`
- `web/src/components/journey/JourneyStation.tsx`
- `web/src/components/journey/JourneyCard.tsx`
- `web/src/components/journey/DataFlowPanel.tsx`

---

## 5. Technical Implementation Details

### 5.1 State Management
```typescript
// Real-time state sync pattern from operator-cockpit
interface ServiceState {
  services: ServiceOrder[];
  technicians: Technician[];
  alerts: Alert[];
  metrics: DashboardMetrics;
}

// Event-driven updates
window.dispatchEvent(new CustomEvent('yellowgrid-state-changed', { detail: state }));
window.addEventListener('yellowgrid-state-changed', refreshUI);
```

### 5.2 Color System (Keep Current + Add)
```css
/* Existing (keep) */
--primary-600: #2563eb; /* Blue */
--green-600: #16a34a;
--red-600: #dc2626;
--orange-600: #f97316;

/* New (add for grid/cockpit) */
--yellow-primary: #ffc107;
--metric-green-1: #16a34a;
--metric-green-2: #15803d;
--metric-green-3: #166534;
--metric-green-4: #14532d;

/* Slot types */
--slot-inst: rgba(25, 135, 84, 0.3);
--slot-tvcf: rgba(253, 126, 20, 0.3);
--slot-tvqt: rgba(255, 193, 7, 0.3);
--slot-rwk: rgba(220, 53, 69, 0.3);
--slot-prebk: rgba(30, 58, 138, 0.35);
--slot-available: rgba(59, 130, 246, 0.08);
```

### 5.3 API Endpoints Needed
```
GET  /api/v1/operations/grid?weekStart=YYYY-MM-DD
GET  /api/v1/dashboard/metrics
GET  /api/v1/dashboard/critical-actions
GET  /api/v1/dashboard/priority-tasks
POST /api/v1/service-orders/:id/assign-technician
POST /api/v1/service-orders/:id/reschedule
POST /api/v1/service-orders/:id/sign-contract
POST /api/v1/service-orders/:id/handle-wcf
POST /api/v1/ai-chat/message
GET  /api/v1/ai-chat/quick-action/:type
```

---

## 6. File Structure (New Components)

```
web/src/
├── components/
│   ├── ai-chat/
│   │   ├── AIChatWidget.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── QuickActionButtons.tsx
│   │   └── ChatInput.tsx
│   ├── dashboard/
│   │   ├── MetricCard.tsx
│   │   ├── CriticalActionsPanel.tsx
│   │   ├── PriorityTasksPanel.tsx
│   │   └── QuickActionButton.tsx
│   ├── operations/
│   │   ├── GridLayout.tsx
│   │   ├── GridSidebar.tsx
│   │   ├── GridRow.tsx
│   │   ├── GridSlot.tsx
│   │   ├── WeekNavigation.tsx
│   │   ├── GridSearch.tsx
│   │   └── GridLegend.tsx
│   ├── modals/
│   │   ├── ModalContainer.tsx
│   │   ├── AssignTechnicianModal.tsx
│   │   ├── RescheduleModal.tsx
│   │   ├── ContactCustomerModal.tsx
│   │   ├── SignContractModal.tsx
│   │   └── HandleWCFModal.tsx
│   └── journey/
│       ├── MetroLine.tsx
│       ├── JourneyStation.tsx
│       ├── JourneyCard.tsx
│       └── DataFlowPanel.tsx
├── pages/
│   ├── DashboardPage.tsx (redesign)
│   └── operations/
│       └── OperationsGridPage.tsx
├── services/
│   ├── ai-chat-service.ts
│   └── operations-service.ts
├── hooks/
│   ├── useAIChat.ts
│   └── useOperationsGrid.ts
└── styles/
    └── operations-grid.css
```

---

## 7. Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Operator task completion time | Unknown | -40% | A/B testing |
| Manual escalations | Baseline | -40% | Log analysis |
| On-time service rate | Baseline | +18% | Business metrics |
| Claims & rework rate | Baseline | -25% | Business metrics |
| User satisfaction | N/A | >4.2/5 | Survey |

---

## 8. Timeline Summary

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1 | Week 1-2 | New Dashboard with metrics, critical actions, priority tasks |
| Phase 2 | Week 2-3 | Operations Grid View |
| Phase 3 | Week 3-4 | AI Chat Assistant |
| Phase 4 | Week 4-5 | Action Modals (5 modal types) |
| Phase 5 | Week 5-6 | Service Journey View |

**Total Estimated Duration: 6 weeks**

---

## 9. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Backend APIs not ready | Use mock data with clear interface contracts |
| Performance with large grid | Virtualization, pagination, caching |
| AI integration complexity | Start with rule-based quick actions, add ML later |
| Breaking existing functionality | Feature flags, gradual rollout |

---

*Document Version: 1.0*
*Created: November 26, 2025*
*Author: AI Analysis*
