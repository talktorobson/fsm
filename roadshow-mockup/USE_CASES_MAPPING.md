# Yellow Grid Use Cases - Database Mapping

This document explains how each real-world use case is modeled in the Yellow Grid platform mockup database schema.

---

## 📋 Overview of 5 Use Cases

1. **Simple Installation** - Single product + installation
2. **Technical Visit of Quotation** - Standalone measurement/quotation service
3. **Package Installation with TV Confirmation** - Multi-step package (bathroom, kitchen)
4. **Complex Installation** - Multi-product with sequencing, quality gates, partial payments
5. **Rework** - Fixing failed service execution

---

## Use Case 1: Simple Installation

### Description
Straightforward installation of a single product (e.g., install a dishwasher, mount a TV).

### Database Entities

**Project**:
```typescript
{
  projectType: 'SIMPLE_INSTALLATION',
  status: 'CREATED',
  // Customer details
}
```

**ServiceOrder**:
```typescript
{
  projectId: <project_id>,
  serviceType: 'INSTALLATION',
  priority: 'P2', // or 'P1' for urgent
  requiresTV: false,
  wcfStatus: 'PENDING', // Requires customer sign-off
  paymentStatus: 'PENDING',
  // Customer address, scheduling details
}
```

### Workflow
1. Create Project (SIMPLE_INSTALLATION)
2. Create single ServiceOrder (INSTALLATION)
3. Assign to Provider
4. Technician executes
5. Customer signs WCF
6. Payment processed
7. Order marked COMPLETED

---

## Use Case 2: Technical Visit of Quotation

### Description
Standalone technical visit to measure, assess, and provide quotation for future work. Generates tech report with measurements, product needs, and estimated costs.

### Database Entities

**Project**:
```typescript
{
  projectType: 'TV_QUOTATION',
  status: 'CREATED',
}
```

**ServiceOrder**:
```typescript
{
  projectId: <project_id>,
  serviceType: 'TV_QUOTATION',
  priority: 'P2',
  requiresTV: false, // This IS the TV
  wcfStatus: 'NOT_REQUIRED', // TV doesn't need WCF
  // Scheduling details
}
```

**TechReport**:
```typescript
{
  serviceOrderId: <tv_order_id>,
  outcome: 'YES', // Or 'NO', 'YES_BUT'
  reportData: {
    measurements: {
      width: 250,
      height: 220,
      depth: 60
    },
    observations: [
      "Wall reinforcement needed",
      "Electrical outlet requires relocation"
    ]
  },
  quotationData: {
    products: [
      { sku: "KIT-001", name: "Kitchen Cabinet Set", qty: 1, price: 2500 },
      { sku: "ELE-042", name: "Electrical Work", qty: 1, price: 350 }
    ],
    laborCost: 1200,
    totalEstimate: 4050
  },
  issuesFound: ["Non-standard wall structure"],
  recommendations: "Recommend wall reinforcement before installation",
  photosUrls: ["https://storage.../photo1.jpg", "https://storage.../photo2.jpg"]
}
```

### Workflow
1. Create Project (TV_QUOTATION)
2. Create ServiceOrder (TV_QUOTATION)
3. Assign to Provider/Technician
4. Technician visits, takes measurements, photos
5. Creates TechReport with quotation
6. Customer reviews quotation
7. If accepted → creates new Project for installation

---

## Use Case 3: Package Installation with TV Confirmation

### Description
Installation of a package (e.g., bathroom refreshment, kitchen installation) that requires:
- **TV Confirmation** before installation
- **TV Outcomes**: YES (proceed), NO (cannot proceed), YES_BUT (proceed with changes)
- Installation blocked until TV confirms YES

### Database Entities

**Project**:
```typescript
{
  projectType: 'PACKAGE_INSTALLATION',
  status: 'CREATED',
  totalValue: 5000,
}
```

**ServiceOrder 1 - TV Confirmation**:
```typescript
{
  projectId: <project_id>,
  serviceType: 'TV_CONFIRMATION',
  priority: 'P2',
  sequenceNumber: 1, // Must happen first
  requiresTV: false, // This IS the TV
  tvOutcome: 'PENDING', // Will be YES, NO, or YES_BUT
  wcfStatus: 'NOT_REQUIRED',
}
```

**ServiceOrder 2 - Installation** (Bathroom):
```typescript
{
  projectId: <project_id>,
  serviceType: 'INSTALLATION',
  priority: 'P2',
  sequenceNumber: 2, // Happens after TV
  requiresTV: true,
  tvOrderId: <tv_confirmation_order_id>, // Link to TV order
  blockedByTV: true, // Cannot start until TV completes
  tvOutcome: 'PENDING', // Inherits from TV order
  wcfStatus: 'PENDING',
  paymentStatus: 'PENDING',
}
```

**TechReport** (if outcome is NO or YES_BUT):
```typescript
{
  serviceOrderId: <tv_confirmation_order_id>,
  outcome: 'YES_BUT',
  reportData: {
    measurements: { ... },
    observations: ["Plumbing connection requires modification"]
  },
  issuesFound: ["Existing plumbing not compatible with new fixtures"],
  recommendations: "Modify plumbing before installation",
  photosUrls: [...]
}
```

### TV Outcomes

**YES Outcome**:
```typescript
// TV ServiceOrder updated:
{
  status: 'COMPLETED',
  tvOutcome: 'YES',
  tvCompletedAt: '2025-11-20T10:00:00Z'
}

// Installation ServiceOrder unblocked:
{
  blockedByTV: false, // Auto-updated
  tvOutcome: 'YES', // Inherited
  status: 'SCHEDULED' // Can now be scheduled
}
```

**NO Outcome**:
```typescript
// TV ServiceOrder:
{
  status: 'COMPLETED',
  tvOutcome: 'NO',
  tvCompletedAt: '2025-11-20T10:00:00Z'
}

// Installation ServiceOrder:
{
  blockedByTV: true, // Remains blocked
  tvOutcome: 'NO',
  status: 'CANCELLED', // Cannot proceed
}

// TechReport explains why NO
```

**YES_BUT Outcome**:
```typescript
// TV ServiceOrder:
{
  status: 'COMPLETED',
  tvOutcome: 'YES_BUT',
  tvCompletedAt: '2025-11-20T10:00:00Z'
}

// Installation ServiceOrder:
{
  blockedByTV: false, // Unblocked, but...
  tvOutcome: 'YES_BUT',
  status: 'ON_HOLD', // Awaiting scope/price adjustment
  // Operator reviews TechReport, updates order details
}

// After adjustments:
{
  status: 'SCHEDULED', // Can proceed
  totalValue: 5500, // Updated price
  description: "Bathroom installation + plumbing modifications"
}
```

### Workflow
1. Create Project (PACKAGE_INSTALLATION)
2. Create TV Confirmation ServiceOrder (sequence 1)
3. Create Installation ServiceOrder (sequence 2, blocked)
4. Assign and execute TV Confirmation
5. Technician completes TV → creates TechReport
6. System updates tvOutcome
   - **YES**: Installation order auto-unblocked, can be scheduled
   - **NO**: Installation order cancelled
   - **YES_BUT**: Installation on hold, operator reviews TechReport, updates order, then schedules
7. Execute Installation (if unblocked)
8. Customer signs WCF
9. Complete

---

## Use Case 4: Complex Installation (Multi-Product, Multi-Service)

### Description
Large project with multiple products and services requiring:
- **Sequencing**: Specific order of execution (e.g., demolition → plumbing → electrical → fixtures)
- **Quality TV checkpoints**: QA technical visits between phases
- **Partial WCF**: Customer acceptance of intermediate phases
- **Partial payments**: Payments tied to milestones
- **Dependencies**: Explicit precedence rules (CPM)

### Database Entities

**Project**:
```typescript
{
  projectType: 'COMPLEX_INSTALLATION',
  status: 'IN_PROGRESS',
  totalValue: 25000,
  paidAmount: 0, // Increments with partial payments
}
```

**ServiceOrder 1 - Demolition**:
```typescript
{
  projectId: <project_id>,
  serviceType: 'INSTALLATION',
  description: "Kitchen demolition",
  sequenceNumber: 1,
  precedenceRules: null, // No dependencies
  wcfStatus: 'PENDING',
  paymentStatus: 'PENDING',
  paymentAmount: 3000, // 12% of total
  totalValue: 3000,
}
```

**ServiceOrder 2 - Plumbing**:
```typescript
{
  projectId: <project_id>,
  serviceType: 'INSTALLATION',
  description: "Plumbing installation",
  sequenceNumber: 2,
  precedenceRules: [<demolition_order_id>], // Depends on demolition
  wcfStatus: 'PENDING',
  paymentStatus: 'PENDING',
  paymentAmount: 5000,
  totalValue: 5000,
  status: 'BLOCKED', // Blocked until demolition completes
}
```

**ServiceOrderDependency**:
```typescript
{
  dependentOrderId: <plumbing_order_id>,
  blockerOrderId: <demolition_order_id>,
  dependencyType: 'BLOCKS',
  isResolved: false,
}
```

**ServiceOrder 3 - Quality TV after Plumbing**:
```typescript
{
  projectId: <project_id>,
  serviceType: 'TV_QUALITY',
  description: "Quality check - plumbing installation",
  sequenceNumber: 3,
  precedenceRules: [<plumbing_order_id>],
  wcfStatus: 'NOT_REQUIRED',
  status: 'BLOCKED',
}
```

**ServiceOrderDependency** (Quality checkpoint):
```typescript
{
  dependentOrderId: <electrical_order_id>,
  blockerOrderId: <quality_tv_order_id>,
  dependencyType: 'QUALITY_CHECK',
  isResolved: false,
}
```

**ServiceOrderDependency** (Partial payment):
```typescript
{
  dependentOrderId: <fixtures_order_id>,
  blockerOrderId: <plumbing_order_id>,
  dependencyType: 'PARTIAL_PAYMENT',
  isResolved: false,
  notes: "Requires 40% payment ($10,000) before proceeding to fixtures"
}
```

### Full Sequence Example

```
Project: Complete Kitchen Renovation ($25,000)

Order #1: Demolition ($3,000)
  ├─ Sequence: 1
  ├─ Dependencies: None
  ├─ Status: COMPLETED
  ├─ WCF: ACCEPTED (partial)
  └─ Payment: $3,000 COMPLETED

Order #2: Plumbing ($5,000)
  ├─ Sequence: 2
  ├─ Dependencies: [Order #1]
  ├─ Status: COMPLETED
  ├─ WCF: ACCEPTED (partial)
  └─ Payment: $5,000 COMPLETED

Order #3: Quality TV - Plumbing
  ├─ Sequence: 3
  ├─ Dependencies: [Order #2]
  ├─ Status: COMPLETED
  ├─ Outcome: YES
  └─ Blocks: Order #4

Order #4: Electrical ($6,000)
  ├─ Sequence: 4
  ├─ Dependencies: [Order #3 - Quality Check]
  ├─ Status: IN_PROGRESS
  ├─ WCF: PENDING
  └─ Payment: PENDING

Order #5: Fixtures & Cabinets ($8,000)
  ├─ Sequence: 5
  ├─ Dependencies: [Order #2, Order #4]
  ├─ Payment Milestone: Requires $10k paid (currently $8k)
  ├─ Status: BLOCKED (awaiting payment)
  └─ WCF: PENDING

Order #6: Finishing & Cleanup ($3,000)
  ├─ Sequence: 6
  ├─ Dependencies: [All previous orders]
  ├─ Status: CREATED
  └─ WCF: PENDING (final acceptance)

Total Paid: $8,000 / $25,000
Project Status: PARTIALLY_COMPLETED
```

### Workflow
1. Create Project (COMPLEX_INSTALLATION) with totalValue
2. Create all ServiceOrders with sequenceNumber
3. Create ServiceOrderDependency records for each precedence
4. Execute in sequence:
   - Start Order #1 (no dependencies)
   - Complete → WCF → Payment
   - Resolve dependency → Unblock Order #2
   - Repeat for each order
5. Handle Quality TV checkpoints
6. Handle partial payments (check dependencies before proceeding)
7. Final WCF acceptance for entire project
8. Project marked COMPLETED

---

## Use Case 5: Rework

### Description
When service execution fails and customer refuses to sign WCF:
- Creates a **Rework ServiceOrder** linked to original
- Rework order inherits customer details
- Multiple rework attempts possible until customer satisfied

### Database Entities

**Original ServiceOrder**:
```typescript
{
  serviceType: 'INSTALLATION',
  status: 'REWORK_NEEDED',
  wcfStatus: 'REFUSED',
  wcfRefusalReason: "Dishwasher leaking, tiles damaged during installation",
  // Original order details
}
```

**Rework ServiceOrder**:
```typescript
{
  projectId: <same_project_id>,
  serviceType: 'REWORK',
  isRework: true,
  originalOrderId: <original_order_id>, // Link to original
  reworkReason: "Fix dishwasher leak and replace damaged tiles",
  customerName: <same_as_original>, // Inherited
  customerEmail: <same_as_original>,
  customerPhone: <same_as_original>,
  addressStreet: <same_as_original>, // Same address
  priority: 'P1', // Rework is typically urgent
  wcfStatus: 'PENDING', // New WCF needed
  paymentStatus: 'NOT_REQUIRED', // Rework usually no extra charge
  status: 'CREATED',
}
```

### Workflow
1. Original Installation completed
2. Technician requests WCF signature
3. Customer refuses → wcfStatus = 'REFUSED', wcfRefusalReason provided
4. System/Operator creates Rework order:
   - Links to original via originalOrderId
   - Inherits customer details
   - P1 priority (urgent fix)
5. Assign Rework to Provider (often same provider)
6. Execute Rework
7. Request WCF again
   - If **ACCEPTED**: Both orders marked COMPLETED
   - If **REFUSED**: Create another Rework order (repeat)
8. Project completed once all WCFs accepted

### Multiple Rework Example

```
Original Order: Kitchen Installation
  ├─ Status: REWORK_NEEDED
  └─ WCF: REFUSED ("Cabinet doors misaligned")

Rework Order #1: Fix cabinet alignment
  ├─ Original: <original_order_id>
  ├─ Status: REWORK_NEEDED
  └─ WCF: REFUSED ("Still not aligned properly")

Rework Order #2: Re-install cabinet doors
  ├─ Original: <original_order_id>
  ├─ Status: COMPLETED
  └─ WCF: ACCEPTED ✓

Final Result:
  - Original Order: COMPLETED
  - Rework #1: COMPLETED
  - Rework #2: COMPLETED
  - Project: COMPLETED
```

---

## Key Database Features Supporting Use Cases

### 1. Project Grouping
- Groups related ServiceOrders
- Tracks total value and payments
- ProjectType indicates use case

### 2. ServiceOrder Types
- **INSTALLATION**: Main service
- **TV_QUOTATION**: Measurement and quotation
- **TV_CONFIRMATION**: Pre-installation approval
- **TV_QUALITY**: Intermediary quality check
- **REWORK**: Fix failed service

### 3. Dependencies & Sequencing
- `sequenceNumber`: Visual ordering
- `precedenceRules`: JSON array of dependencies
- `ServiceOrderDependency` table: Explicit dependencies with types

### 4. TV Workflow
- `requiresTV`: Order needs TV confirmation
- `tvOrderId`: Link to TV order
- `tvOutcome`: YES, NO, YES_BUT, PENDING
- `blockedByTV`: Blocks execution until TV completes
- `TechReport`: Detailed TV outcomes

### 5. WCF Tracking
- `wcfStatus`: NOT_REQUIRED, PENDING, ACCEPTED, REFUSED, PARTIAL
- `wcfRefusalReason`: Why customer refused
- `wcfSignedAt`: Timestamp of acceptance
- `wcfSignatureUrl`: Customer signature

### 6. Payment Tracking
- `paymentStatus`: NOT_REQUIRED, PENDING, PARTIAL, COMPLETED
- `paymentAmount`: Amount for this order
- `totalValue`: Total order value
- Project `paidAmount`: Cumulative payments

### 7. Rework Relationships
- `isRework`: Boolean flag
- `originalOrderId`: Link to original order
- `reworkReason`: Explanation
- Recursive relationship supports multiple reworks

---

## Demo Scenarios for Roadshow

### Scenario 1: Simple Installation (Use Case 1)
- **Customer**: Jean Dupont, Paris
- **Service**: Dishwasher installation
- **Duration**: 2 hours
- **Flow**: Create → Assign → Execute → WCF → Complete

### Scenario 2: Quotation TV (Use Case 2)
- **Customer**: Maria Garcia, Madrid
- **Service**: Kitchen renovation quotation
- **Flow**: TV visit → Measurements → TechReport with quotation → Customer decision

### Scenario 3: Bathroom Package with TV (Use Case 3)
- **Customer**: Giuseppe Rossi, Rome
- **Service**: Bathroom renovation
- **Flow**:
  1. TV Confirmation → YES_BUT (plumbing issue found)
  2. Operator adjusts order (add plumbing work)
  3. Installation proceeds → WCF → Complete

### Scenario 4: Complete Kitchen (Use Case 4)
- **Customer**: Anna Kowalski, Warsaw
- **Service**: Full kitchen renovation
- **Flow**:
  1. Demolition → WCF → Payment ($3k)
  2. Plumbing → Quality TV → WCF → Payment ($5k)
  3. Electrical → In Progress
  4. Fixtures → BLOCKED (awaiting payment milestone)
  5. Partial payment → Unblock Fixtures
  6. Complete all → Final WCF

### Scenario 5: Rework Case (Use Case 5)
- **Customer**: Pierre Martin, Lyon
- **Service**: Cabinet installation
- **Flow**:
  1. Installation complete
  2. Customer refuses WCF (doors misaligned)
  3. Rework order created
  4. Rework executed
  5. Customer accepts WCF → Complete

---

## API Endpoints for Use Cases

### Project Management
```
POST   /api/projects
GET    /api/projects/:id
GET    /api/projects/:id/service-orders (all orders in project)
GET    /api/projects/:id/dependencies (dependency graph)
```

### TV Workflow
```
POST   /api/service-orders/:id/tech-report (create TV outcome)
PUT    /api/service-orders/:id/tv-outcome (update outcome)
GET    /api/service-orders/:id/blocked-orders (orders blocked by this TV)
```

### WCF Management
```
PUT    /api/service-orders/:id/wcf/accept
PUT    /api/service-orders/:id/wcf/refuse (creates rework order)
POST   /api/service-orders/:id/wcf/signature
```

### Rework
```
POST   /api/service-orders/:id/create-rework
GET    /api/service-orders/:id/rework-history
```

### Complex Installation
```
GET    /api/projects/:id/dependency-graph (CPM visualization)
POST   /api/service-orders/:id/resolve-dependency
GET    /api/projects/:id/payment-milestones
```

---

## Summary

| Use Case | Project Type | Service Types | Key Features |
|----------|--------------|---------------|--------------|
| **Simple Installation** | SIMPLE_INSTALLATION | INSTALLATION | Single order, WCF, payment |
| **TV Quotation** | TV_QUOTATION | TV_QUOTATION | TechReport with measurements, quotation |
| **Package + TV Confirmation** | PACKAGE_INSTALLATION | TV_CONFIRMATION, INSTALLATION | TV outcomes (YES/NO/YES_BUT), blocking |
| **Complex Installation** | COMPLEX_INSTALLATION | INSTALLATION, TV_QUALITY | Sequencing, dependencies, quality gates, partial payments |
| **Rework** | (any) | REWORK | WCF refusal, recursive rework, original order link |

---

**Document Version**: 1.0.0
**Date**: 2025-11-15
**Status**: Complete schema mapping for all 5 use cases
