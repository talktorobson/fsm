# YellowGrid Platform - Interactive Demo Documentation

## Overview
YellowGrid is a B2B field service management platform that orchestrates the complete lifecycle from retail sale to service delivery and provider payment. The platform serves **retailers** and **insurance companies** who sell services to their end customers.

## 🎯 Business Model (CRITICAL)

### B2B Payment Flow
```
Customer → RETAILER (pays at purchase)
Platform → PROVIDER (pays after completion)
```

**NO direct customer-to-provider payment in any scenario.**

The platform:
- Receives sales orders from retailer systems (Kafka integration)
- Orchestrates service fulfillment
- Manages provider network and payments
- Handles quality control and rework

---

## 📋 Scenarios Available

### 1. **Standard Service** (Default)
Basic installation/service workflow demonstrating complete platform flow.

**Cards:** 21 (Sales: 5 | Delivery: 3 | Execution: 5 | Payment: 4 | Complete: 4)

**Key Flow:**
- Sales Channel → Kafka → Enrichment → SO Creation → AI Analysis → Operator
- Contract → Provider Match → Product Delivery → Go Exec → Crew Execution
- WCF → Pro Forma Invoice → Payment Authorization → Provider Payment

---

### 2. **Rework** (Quality Recovery)
Handles service quality issues requiring corrective action.

**Cards:** 15 (Service domain only - no sales involvement)

**Business Rules:**
- Customer pays: **€0** (quality issue, no customer charge)
- Provider payment:
  - **Same provider does rework:** €0 (fixes own mistake)
  - **Different provider does rework:** Full cost paid to new provider

**Triggers:**
- WCF rejection/reserves (immediate)
- Warranty claim (delayed - days/weeks later)

**Key Features:**
- Metro station highlighting shows rework path
- Links to original service order
- Problem assessment and documentation
- Quality validation before completion

---

### 3. **Maintenance**
Service-only workflow with no product delivery phase.

**Cards:** 15 (Sales: 5 | Execution: 6 | Payment: 4)

**Key Differences:**
- ❌ No product purchase/delivery
- ❌ No Go Exec gate
- ✅ Asset/equipment details (model, age, service history)
- ✅ Provider manages all parts/consumables (included in service price)
- ✅ Service report with health tracking

**Example:** Boiler annual maintenance - €120 all-inclusive

---

### 4. **Dépannage** (Urgent Service)
Expedited multi-provider dispatch for urgent repairs.

**Cards:** 20 (Sales: 5 | Urgent Dispatch: 9 | Payment: 5 | Complete: 1)

**CORRECTED Business Logic:**
- **Always starts with SALE** to retailer (web/store purchase)
- **Multi-provider dispatch:** 5 providers contacted simultaneously
- **First-to-accept wins** (3 min 12 sec in example)
- **Offers withdrawn** from other 4 providers automatically
- **Speed advantage:** Minutes vs hours/days for standard dispatch

**Payment Model:**
- Customer paid retailer: €774.90 (at purchase)
- Platform pays provider: €620.90 (after completion)
- Platform fee: €154 (20%)

**Key Features:**
- Sales-initiated (NOT emergency call)
- Expedited multi-provider bidding
- Real-time response tracking
- Urgency premium pricing (23-40% markup)

---

### 5. **Subscription** (Recurring Service)
SaaS-style recurring maintenance contracts.

**Cards:** 20 (Sales: 5 | Service: 9 | Payment: 4 | Renewal: 2)

**Subscription Tiers:**
- **Basic:** €9.99/mo (annual service)
- **Standard:** €16.99/mo (quarterly)
- **Premium:** €24.99/mo (monthly)

**Key Features:**
- Auto-scheduling (next service pre-booked)
- Same technician for relationship continuity
- Health score tracking (92/100 in example)
- Priority benefits (emergency response, repair discounts)
- Zero additional charge per visit

**Example:** Quarterly AC maintenance, visit 3 of 4, auto-renewed

---

## 🏗️ Platform Architecture

### Core Components

**1. Sales Integration**
- Kafka message from retailer system
- Data enrichment and validation
- Sales order creation
- AI analysis and routing
- Operator triage (manual review gate)

**2. Service Execution**
- Contract signature
- Provider matching and dispatch
- Product delivery (if applicable)
- Go Exec gate (dependency validation)
- Crew execution with mobile app
- Work completion form (WCF)

**3. Provider Payment Flow**
- Pro Forma Invoice (provider submits)
- Invoice dataflow (system processing)
- Payment authorization (platform approval)
- Provider payment (funds transfer)

**4. Quality Control**
- WCF signature with reserves option
- Rework workflow for quality issues
- Warranty claim handling
- Service reports and health tracking

---

## 🎨 UI Components

### Interactive Demo Features

**Metro Line Visualization**
- Card-based journey through workflow
- Color-coded by layer (customer/provider/system/data)
- Current card highlighted
- Completed cards marked with checkmark

**Card Rendering**
- Custom render functions per scenario
- Rich data visualization
- Action buttons and CTAs
- Responsive design

**Scenario Selector**
- Dropdown to switch between scenarios
- Metro line updates dynamically
- Data preloaded for instant switching

---

## 📊 Key Metrics by Scenario

| Scenario | Cards | Duration | Customer Pays | Provider Paid | Platform Fee |
|----------|-------|----------|---------------|---------------|--------------|
| Standard | 21 | 3-5 days | €701.10 | €560.88 | €140.22 (20%) |
| Rework | 15 | 1-2 days | €0.00 | €0 or Full* | Conditional |
| Maintenance | 15 | Same day | €147.60 | €118.08 | €29.52 (20%) |
| Dépannage | 20 | Hours | €774.90 | €620.90 | €154.00 (20%) |
| Subscription | 20 | Quarterly | €203.88/yr | €48/visit | Variable |

\* Rework: €0 if same provider, full cost if different provider

---

## 🔧 Technical Implementation

### Files
- **demo-interactive.html** (7,854 lines)
  - Complete interactive demo
  - 5 scenario workflows
  - Custom render functions
  - Metro line visualization

### Data Structure
Each scenario contains:
- Sales order details
- Customer information
- Products (if applicable)
- Services with pricing breakdown
- Provider information
- Payment financials
- Workflow-specific metadata

### Render Functions
- **Standard:** Generic renderer
- **Rework:** Custom renderer showing problem assessment
- **Maintenance:** Asset history and service report
- **Dépannage:** Multi-provider bidding race visualization
- **Subscription:** Health tracking and auto-scheduling

---

## 🚀 Quick Start

1. Open `demo-interactive.html` in browser
2. Select scenario from dropdown
3. Navigate through cards using "Next Card" button
4. Observe metro line progression
5. Review data panels for detailed information

---

## 📝 Documentation Files

**Core Documentation:**
- `README.md` - This file (master overview)

**Archived/Superseded:**
- All other .md files contain historical implementation notes
- Refer to this README for current accurate information
- Code in `demo-interactive.html` is source of truth

---

## ✅ Latest Updates

**Dépannage Payment Model Correction (Nov 2025)**
- Fixed fundamental business logic error
- Customer pays RETAILER at purchase (not provider)
- Platform pays provider after completion
- No direct customer-provider payment ever
- Updated all notes, render functions, and documentation

**Key Correction:**
```
WRONG: Customer → Provider (direct payment)
RIGHT: Customer → Retailer | Platform → Provider (B2B flow)
```

This applies to **ALL scenarios** - platform is B2B, customers belong to retailer/insurance company.

---

## 🎯 Demo Highlights

**What Makes This Demo Powerful:**

1. **Complete End-to-End Flow**
   - From retail sale to provider payment
   - Real Kafka integration pattern
   - Full financial transparency

2. **Multiple Scenario Types**
   - Standard, rework, maintenance, urgent, subscription
   - Each demonstrates different platform capabilities
   - Shows workflow flexibility

3. **B2B Platform Model**
   - Clearly shows platform orchestration role
   - Separates customer payment (retailer) from provider payment (platform)
   - Demonstrates multi-party coordination

4. **Quality & Rework Handling**
   - Shows how platform handles service failures
   - Conditional payment logic
   - Maintains customer satisfaction at €0 cost to customer

5. **Modern Service Models**
   - Expedited multi-provider dispatch (Dépannage)
   - SaaS-style subscriptions with auto-renewal
   - Health tracking and predictive maintenance

---

**Version:** 2.0 (Payment Model Corrected)  
**Last Updated:** November 17, 2025  
**Status:** ✅ Production Ready
