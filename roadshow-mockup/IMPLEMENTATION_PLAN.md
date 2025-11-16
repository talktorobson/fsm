# Yellow Grid Roadshow Mockup - Implementation Plan

**Created**: 2025-11-16
**Status**: Ready to Execute
**Timeline**: 6-8 weeks (focused development)
**Current Completion**: ~5%

---

## 🎯 Objectives

Build a **compelling, functional demo** that showcases:
1. **Assignment Transparency** (primary differentiator)
2. **Technical Visit Flow** (TV → Installation dependency)
3. **Multi-Country Operations** (ES, FR, IT, PL)
4. **Provider Mobile Experience** (job lifecycle)
5. **Control Tower** (real-time operator visibility)

**NOT a production system** - optimized for demonstration impact.

---

## 📊 Current State Summary

### ✅ What We Have
- Excellent Prisma schema (11 models, production-quality)
- Docker Compose infrastructure (PostgreSQL, Redis, Adminer)
- NestJS skeleton with proper configuration
- Comprehensive README with 5 demo scenarios
- Standalone HTML demo (2,571 lines)

### ❌ What's Missing
- Backend API implementation (~95% missing)
- Web frontend (0% - not started)
- Mobile app (0% - not started)
- Seed data (0% - no demo scenarios loaded)
- Working application (currently broken - missing modules)

---

## 🏗️ Implementation Phases

### Phase 1: Foundation Fix (3-5 days) 🔧

**Priority**: CRITICAL - App won't run currently

#### 1.1 Fix Broken Module Imports
**File**: `apps/backend/src/app.module.ts`
- Remove imports for non-existent modules
- Create minimal module structure
- Get app compiling and running

**Tasks**:
```bash
# Remove broken imports
# Create module directories:
- src/modules/auth/
- src/modules/providers/
- src/modules/service-orders/
- src/modules/assignments/
- src/modules/executions/
- src/modules/analytics/

# Create empty .module.ts files for each
```

#### 1.2 Database Setup
- Run Prisma migrations: `npx prisma migrate dev --name init`
- Verify tables created correctly
- Test Prisma Client generation

#### 1.3 Basic Health Checks
- Ensure `/api/health` works
- Ensure `/api/version` works
- Ensure Swagger UI loads at `/api/docs`

**Deliverable**: Running NestJS app with database connection

---

### Phase 2: Core Backend APIs (2 weeks) ⚙️

**Priority**: HIGH - Foundation for all features

#### 2.1 AuthModule (2 days)

**Features**:
- Login endpoint (`POST /api/v1/auth/login`)
- JWT token generation
- Auth guard for protected routes
- User session management

**API Endpoints**:
```typescript
POST   /api/v1/auth/login          // Login with email/password
POST   /api/v1/auth/logout         // Logout
GET    /api/v1/auth/me             // Get current user
POST   /api/v1/auth/refresh        // Refresh JWT token
```

**Simplified Auth** (no PingID for demo):
- Email/password authentication
- Pre-seeded demo users
- Simple JWT strategy

#### 2.2 ProvidersModule (3 days)

**Features**:
- Provider CRUD
- Work team management
- Service zone definition
- Basic metrics tracking

**API Endpoints**:
```typescript
// Providers
GET    /api/v1/providers                          // List providers
POST   /api/v1/providers                          // Create provider
GET    /api/v1/providers/:id                      // Get provider details
PUT    /api/v1/providers/:id                      // Update provider
GET    /api/v1/providers/:id/metrics              // Provider metrics

// Work Teams
GET    /api/v1/providers/:id/teams                // List teams
POST   /api/v1/providers/:id/teams                // Create team
GET    /api/v1/providers/:id/teams/:teamId        // Get team details
PUT    /api/v1/providers/:id/teams/:teamId        // Update team

// Zones
GET    /api/v1/providers/:id/zones                // List zones
POST   /api/v1/providers/:id/zones                // Create zone
```

#### 2.3 ServiceOrdersModule (4 days)

**Features**:
- Service order creation
- Status lifecycle (state machine)
- Technical Visit dependency tracking
- Scheduling integration

**API Endpoints**:
```typescript
// Service Orders
GET    /api/v1/service-orders                     // List orders (filtered)
POST   /api/v1/service-orders                     // Create order
GET    /api/v1/service-orders/:id                 // Get order details
PUT    /api/v1/service-orders/:id                 // Update order
PATCH  /api/v1/service-orders/:id/status          // Update status
GET    /api/v1/service-orders/:id/timeline        // Get status history

// Technical Visits
GET    /api/v1/service-orders/:id/tv-dependency   // Check TV dependency
POST   /api/v1/service-orders/:id/tv-outcome      // Record TV outcome
```

**State Machine**:
```
CREATED → SCHEDULED → ASSIGNED → ACCEPTED →
IN_PROGRESS → COMPLETED → VALIDATED → CLOSED
```

#### 2.4 AssignmentsModule (3 days) ⭐ PRIMARY DIFFERENTIATOR

**Features**:
- Candidate filtering (zones, P1/P2, capacity)
- Scoring algorithm with transparency
- Assignment funnel audit trail
- Multiple assignment modes

**API Endpoints**:
```typescript
// Assignment Process
POST   /api/v1/assignments/calculate-candidates   // Get eligible providers
POST   /api/v1/assignments/create                 // Create assignment
GET    /api/v1/assignments/:id                    // Get assignment details
GET    /api/v1/assignments/:id/funnel             // Get transparency funnel
GET    /api/v1/assignments/:id/logs               // Get audit trail

// Provider Actions
POST   /api/v1/assignments/:id/accept             // Provider accepts
POST   /api/v1/assignments/:id/refuse             // Provider refuses
POST   /api/v1/assignments/:id/negotiate-date     // Request date change
```

**Transparency Funnel** (KEY FEATURE):
```json
{
  "totalProviders": 45,
  "stages": [
    {
      "stage": "zone_filter",
      "passed": 18,
      "filtered": 27,
      "reasons": ["Outside service zone", "No postal code coverage"]
    },
    {
      "stage": "service_type_filter",
      "passed": 12,
      "filtered": 6,
      "reasons": ["Only TV-capable", "No P1 support"]
    },
    {
      "stage": "capacity_filter",
      "passed": 8,
      "filtered": 4,
      "reasons": ["Fully booked", "Insufficient capacity"]
    },
    {
      "stage": "scoring",
      "candidates": [
        {
          "providerId": "...",
          "score": 92,
          "breakdown": {
            "proximity": 30,
            "qualityScore": 25,
            "availability": 20,
            "priceCompetitiveness": 17
          }
        }
      ]
    }
  ]
}
```

#### 2.5 ExecutionsModule (2 days)

**Features**:
- Check-in/check-out tracking
- GPS location capture
- Photo uploads (S3)
- Basic ratings

**API Endpoints**:
```typescript
POST   /api/v1/executions/:id/check-in            // Start job
POST   /api/v1/executions/:id/check-out           // Complete job
POST   /api/v1/executions/:id/photos              // Upload photo
POST   /api/v1/executions/:id/rating              // Customer rating
GET    /api/v1/executions/:id                     // Get execution details
```

**Deliverable**: Functional backend APIs for all core features

---

### Phase 3: Web Frontend (2 weeks) 🖥️

**Priority**: HIGH - Main demo interface

#### 3.1 Project Setup (1 day)

**Technology**:
- React 18 + TypeScript
- Vite (fast build)
- TailwindCSS (rapid styling)
- React Router (navigation)
- React Query (API state)
- Recharts (analytics charts)

**Structure**:
```
apps/web/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/      # API client
│   ├── hooks/
│   ├── types/
│   └── App.tsx
```

#### 3.2 Core Pages (8-10 days)

**1. Login Page** (0.5 day)
- Simple email/password form
- Demo user selector dropdown
- JWT storage

**2. Dashboard** (1 day)
- KPI cards (orders, assignments, providers)
- Charts (orders by status, country distribution)
- Recent activity feed

**3. Service Orders List** (1 day)
- Table with filters (country, status, priority)
- Search by customer name / order ID
- Pagination
- Status badges

**4. Service Order Details** (2 days)
- Order information
- Customer details
- Scheduling info
- Assignment section
- Timeline (status history)
- Actions (assign, reschedule, cancel)

**5. Assignment Transparency View** (2 days) ⭐ KEY DIFFERENTIATOR
- Funnel visualization (stages with numbers)
- Filtered providers with reasons
- Scoring breakdown (horizontal bar charts)
- Selected provider highlight
- Assignment logs/audit trail

**6. Provider Management** (1.5 days)
- Provider list with filters
- Provider details modal
- Work teams section
- Service zones map (optional - Mapbox/Leaflet)
- Metrics cards (CSAT, first-time-fix rate)

**7. Calendar/Gantt View** (1 day - simplified)
- Week view
- Service orders by day
- Color-coded by status
- Basic drag-and-drop (nice-to-have)

**8. Analytics Dashboard** (1 day)
- Country comparison charts
- Provider performance scorecards
- Quality metrics (CSAT, completion rate)
- Capacity heatmap

#### 3.3 Shared Components

- Navigation bar with country selector
- Breadcrumbs
- Data table component
- Modal dialogs
- Form components
- Status badges
- Loading skeletons

**Deliverable**: Functional Control Tower web app

---

### Phase 4: Seed Data (3-5 days) 📊

**Priority**: HIGH - Demo scenarios need realistic data

#### 4.1 Demo User Accounts

**Operators** (Control Tower users):
```typescript
// France
{ email: "marie.dubois@lm-fr.com", role: "OPERATOR", country: "FR", name: "Marie Dubois" }
{ email: "pierre.martin@lm-fr.com", role: "MANAGER", country: "FR", name: "Pierre Martin" }

// Spain
{ email: "carlos.garcia@lm-es.com", role: "OPERATOR", country: "ES", name: "Carlos García" }

// Italy
{ email: "sofia.rossi@lm-it.com", role: "OPERATOR", country: "IT", name: "Sofia Rossi" }

// Poland
{ email: "anna.kowalska@lm-pl.com", role: "OPERATOR", country: "PL", name: "Anna Kowalska" }
```

**Provider/Technician Users**:
```typescript
{ email: "tech1@profix-fr.com", role: "TECHNICIAN", providerId: "...", name: "Jean Lefebvre" }
{ email: "tech2@homeserve-es.com", role: "TECHNICIAN", providerId: "...", name: "Miguel Torres" }
// ... more technicians
```

#### 4.2 Providers & Teams

**Per Country** (5-10 providers each):
- France: ProFix Services, HomeServe France, TechnoPlus, etc.
- Spain: ServiHogar, Reparalia, TechMasters, etc.
- Italy: CasaServizi, TechItalia, etc.
- Poland: DomoSerwis, TechPolska, etc.

**Each Provider**:
- 2-4 work teams
- Service zones (postal codes or regions)
- P1/P2 capabilities
- Metrics (CSAT, first-time-fix rate)

#### 4.3 Service Orders (5 Demo Scenarios)

**Scenario 1: Assignment Transparency** ⭐
```
Customer: Jean Dupont (Paris, FR)
Service: Kitchen cabinet installation
Type: P1 (Priority)
Status: CREATED → Assignment in progress
Demo: Show funnel filtering 45 providers → 8 candidates → select best
```

**Scenario 2: Technical Visit Flow**
```
Customer: María González (Madrid, ES)
Service: Bathroom installation (complex)
Type: P2 (Standard)
Status: TV scheduled → TV completed (YES-BUT) → Installation unblocked
Demo: Show TV dependency, outcome capture, automatic unblocking
```

**Scenario 3: Multi-Country Operations**
```
Dashboard view showing:
- France: 234 orders (78 in progress)
- Spain: 156 orders (45 in progress)
- Italy: 98 orders (23 in progress)
- Poland: 67 orders (12 in progress)
Demo: Country selector, different rules per country
```

**Scenario 4: Provider Mobile Experience**
```
Technician: Miguel Torres (Spain)
Jobs today: 3 installations
Status: Job 1 (completed), Job 2 (in progress), Job 3 (scheduled)
Demo: Mobile app showing check-in, photos, check-out, customer signature
```

**Scenario 5: Control Tower Real-Time**
```
Operator: Marie Dubois (France)
View: Gantt chart with 20+ orders across 2 weeks
Actions: Drag to reschedule, manual assignment, view transparency
Demo: Real-time updates, operator actions, bulk operations
```

#### 4.4 Seed Script

**File**: `apps/backend/src/database/seeders/index.ts`

```typescript
async function seed() {
  // 1. Clear existing data
  await prisma.$transaction([...]);

  // 2. Create countries and config
  await seedCountries();

  // 3. Create users (operators, technicians)
  await seedUsers();

  // 4. Create providers and work teams
  await seedProviders();

  // 5. Create service orders for demo scenarios
  await seedServiceOrders();

  // 6. Create assignments with transparency logs
  await seedAssignments();

  // 7. Create executions
  await seedExecutions();

  console.log('✅ Seed completed!');
}
```

**Deliverable**: Realistic demo data for all scenarios

---

### Phase 5: Mobile App OR Enhanced HTML Demo (1-2 weeks) 📱

**Decision Point**: Build full React Native app OR enhance existing HTML demo?

#### Option A: React Native Mobile App (2 weeks)

**Pros**:
- Real mobile experience
- Touch interactions
- Photo capture
- GPS integration
- Professional appearance

**Cons**:
- More time investment
- Requires Expo setup
- Testing on devices

**Features**:
- Login
- Job list (today, upcoming)
- Job details
- Check-in/check-out
- Photo capture
- Customer signature (canvas)
- Offline indicator (UI only)

#### Option B: Enhanced HTML Demo (3-5 days) ⚡ FASTER

**Pros**:
- Existing 2,571-line demo
- Can be shown in browser
- Quick to enhance
- No dependencies

**Cons**:
- Not a real app
- Less impressive for demos

**Enhancements**:
- Connect to backend API
- Real data instead of mock
- Better styling (Tailwind)
- Interactive elements

**RECOMMENDATION**: Start with **Option B** (enhance HTML), build Option A if time permits.

---

### Phase 6: Polish & Demo Prep (1 week) ✨

**Priority**: MEDIUM - Makes demo impressive

#### 6.1 UI Polish

- Consistent branding (Yellow Grid logo, colors)
- Loading states and skeletons
- Error handling (user-friendly messages)
- Empty states ("No orders yet")
- Animations (subtle transitions)
- Responsive design (demo on different screens)

#### 6.2 Demo Script

**File**: `roadshow-mockup/DEMO_SCRIPT.md`

```markdown
# 18-Minute Demo Flow

**Setup** (2 min):
- Login as Marie Dubois (FR operator)
- Dashboard overview

**Scenario 1 - Assignment Transparency** (5 min):
1. Open "Jean Dupont - Kitchen Installation" order
2. Click "Assign Provider"
3. Show filtering funnel (45 → 18 → 12 → 8)
4. Explain each filter stage
5. Show scoring breakdown
6. Select top provider
7. Show assignment log

**Scenario 2 - Technical Visit Flow** (4 min):
1. Show María González TV order
2. Complete TV with "YES-BUT" outcome
3. Show installation order auto-unblocking
4. Explain dependency logic

**Scenario 3 - Multi-Country** (3 min):
1. Dashboard country selector
2. Switch: FR → ES → IT → PL
3. Show different volumes
4. Highlight country-specific rules

**Scenario 4 - Mobile Experience** (3 min):
1. Open mobile app (or HTML demo)
2. Login as Miguel Torres
3. Show job list
4. Check-in to job
5. Upload photo
6. Check-out with customer rating

**Scenario 5 - Analytics** (1 min):
1. Analytics dashboard
2. Provider scorecards
3. Quality metrics
4. Capacity heatmap

**Q&A** (flexible)
```

#### 6.3 Video Recording (Backup)

- Record full demo walkthrough
- 4K screen capture
- Voiceover explanation
- Use if live demo fails

#### 6.4 Deployment (Optional)

**Simple Deployment**:
- Railway.app or Render.com (backend)
- Vercel or Netlify (frontend)
- Managed Postgres (Supabase/Railway)

**Docker Compose** (Easier):
- Single VPS (DigitalOcean, Hetzner)
- docker-compose.yml
- Nginx reverse proxy
- HTTPS with Let's Encrypt

**Deliverable**: Polished, demo-ready application

---

## 🎯 Prioritization Matrix

| Feature | Impact | Effort | Priority | Phase |
|---------|--------|--------|----------|-------|
| **Assignment Transparency** | 🔥 CRITICAL | Medium | P0 | 2 |
| **Service Orders CRUD** | 🔥 CRITICAL | Medium | P0 | 2 |
| **Control Tower UI** | 🔥 CRITICAL | High | P0 | 3 |
| **Seed Data** | 🔥 CRITICAL | Medium | P0 | 4 |
| **Auth & Users** | HIGH | Low | P1 | 2 |
| **Provider Management** | HIGH | Medium | P1 | 2, 3 |
| **Technical Visit Flow** | HIGH | Low | P1 | 2 |
| **Mobile Experience** | MEDIUM | High | P2 | 5 |
| **Analytics Dashboard** | MEDIUM | Medium | P2 | 3 |
| **Gantt/Calendar View** | LOW | High | P3 | 3 |

---

## ⏱️ Timeline Estimation

### Fast Track (6 weeks)

```
Week 1: Phase 1 + Start Phase 2
Week 2-3: Phase 2 (Backend APIs)
Week 4-5: Phase 3 (Web Frontend)
Week 6: Phase 4 (Seed) + Phase 6 (Polish)
```

**Skip**: Mobile app (use HTML demo)
**Focus**: Assignment transparency + Control Tower

### Complete Build (8 weeks)

```
Week 1: Phase 1 + Start Phase 2
Week 2-3: Phase 2 (Backend APIs)
Week 4-5: Phase 3 (Web Frontend)
Week 6: Phase 4 (Seed Data)
Week 7: Phase 5 (Mobile App)
Week 8: Phase 6 (Polish)
```

**Includes**: Everything, including React Native app

---

## 👥 Team Recommendations

### Minimum Team (3 people)

- **1 Full-stack Developer**: Backend + Frontend
- **1 Frontend Developer**: React + Mobile
- **1 Designer/Product**: UI/UX + Demo script

### Ideal Team (4-5 people)

- **1 Backend Developer**: NestJS + APIs
- **2 Frontend Developers**: React Web + React Native
- **1 Designer/Product**: UI/UX + Polish
- **0.5 DevOps**: Docker + Deployment

---

## 🚨 Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Scope creep** | HIGH | HIGH | Stick to P0/P1 features only |
| **Time overrun** | MEDIUM | HIGH | Cut mobile app if needed |
| **Demo bugs during presentation** | MEDIUM | CRITICAL | Record video backup |
| **Seed data incomplete** | LOW | HIGH | Start seed data early (Week 4) |
| **UI not impressive enough** | MEDIUM | MEDIUM | Hire designer for 1 week |

---

## 📋 Success Criteria

### Technical
- [ ] Backend APIs functional (all core endpoints)
- [ ] Web app works without critical bugs
- [ ] Seed data covers all 5 scenarios
- [ ] Can run full demo in < 20 minutes
- [ ] Deployment successful (if required)

### Demo Quality
- [ ] Assignment transparency clearly visible
- [ ] Multi-country operations demonstrated
- [ ] TV flow shows dependency logic
- [ ] Mobile/provider experience shown
- [ ] Analytics dashboard populated

### Presentation
- [ ] Demo script tested 3+ times
- [ ] Video backup recorded
- [ ] Handles Q&A confidently
- [ ] Stakeholders impressed

---

## 🔄 Next Steps (Immediate)

1. **Week 1, Day 1-2**: Fix broken backend (Phase 1.1)
2. **Week 1, Day 3-5**: Database setup + Auth module (Phase 1.2-1.3 + 2.1)
3. **Week 2**: Backend API implementation sprint (Phase 2.2-2.5)
4. **Week 3-4**: Frontend development (Phase 3)
5. **Week 5**: Seed data + Polish (Phase 4 + 6)
6. **Week 6**: Mobile/HTML demo + Final polish (Phase 5-6)

---

## 📊 Appendix: Database Schema Summary

Already complete! ✅

**11 Models**:
1. Country (multi-tenancy root)
2. User (operators, technicians, customers)
3. Provider (service companies)
4. ProviderZone (service areas)
5. WorkTeam (field teams)
6. ServiceOrder (core domain)
7. Assignment (dispatch logic)
8. AssignmentLog (transparency audit)
9. Execution (field operations)
10. ProviderMetrics (analytics)
11. [Plus Prisma implicit join tables]

**Well-designed** with proper:
- Enums (status, priority, roles)
- Relationships (FK constraints)
- Indexes (performance)
- Multi-tenancy (country_code, bu_code)

---

## 📝 Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-16 | Claude | Initial implementation plan |

---

**Let's build an impressive demo! 🚀**
