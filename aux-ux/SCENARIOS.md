# Scenario Quick Reference Cards

## 🔵 Standard Service
**When:** New product installation or basic service  
**Cards:** 21  
**Duration:** 3-5 days  
**Payment:** Customer → Retailer (€701.10) | Platform → Provider (€560.88)

**Flow:** Sales Integration → Contract → Delivery → Go Exec → Execution → WCF → Provider Payment

---

## 🔴 Rework
**When:** Quality issue, warranty claim, WCF rejection  
**Cards:** 15  
**Duration:** 1-2 days  
**Payment:** Customer (€0) | Provider (€0 if same, full cost if different)

**Trigger:** WCF with reserves OR warranty claim  
**Key:** Service domain only, no sales involvement

---

## 🟢 Maintenance  
**When:** Service existing equipment (no product needed)  
**Cards:** 15  
**Duration:** Same day  
**Payment:** Customer → Retailer (€147.60) | Platform → Provider (€118.08)

**Key:** No product delivery, no Go Exec gate, provider brings all parts

---

## 🟠 Dépannage (Urgent)
**When:** Expedited service needed (hours, not days)  
**Cards:** 20  
**Duration:** Hours  
**Payment:** Customer → Retailer (€774.90) | Platform → Provider (€620.90)

**Key:** Multi-provider dispatch (5 at once), first-to-accept wins, 23-40% urgency premium

**CRITICAL:** Sales-initiated (NOT emergency call), customer pays retailer upfront

---

## 🟣 Subscription
**When:** Recurring scheduled maintenance  
**Cards:** 20  
**Duration:** Quarterly/Monthly  
**Payment:** Customer → Retailer (€16.99/mo) | Platform → Provider (€48/visit)

**Key:** Auto-scheduling, same technician, health tracking, priority benefits

---

## Payment Model (ALL Scenarios)

```
┌─────────┐           ┌──────────┐           ┌──────────┐
│Customer │──pays at──▶│ Retailer │           │ Provider │
└─────────┘  purchase  └──────────┘           └──────────┘
                                                    ▲
                                                    │
                                        ┌───────────┴──────────┐
                                        │   Platform pays      │
                                        │  after completion    │
                                        └──────────────────────┘
```

**NO direct customer-to-provider payment in ANY scenario**

---

## Card Count Breakdown

| Scenario | Sales | Service | Payment | Total |
|----------|-------|---------|---------|-------|
| Standard | 5 | 12 | 4 | 21 |
| Rework | 0 | 11 | 4 | 15 |
| Maintenance | 5 | 6 | 4 | 15 |
| Dépannage | 5 | 10 | 5 | 20 |
| Subscription | 5 | 11 | 4 | 20 |

---

## Workflow Patterns

**Full Flow (Standard, Dépannage, Subscription):**
Kafka → Enrichment → SO → AI → Operator → [Scenario-specific] → WCF → Invoice → Payment

**Service-Only (Rework):**
Problem Assessment → Provider Assignment → [Execution] → WCF → Invoice → Payment

**No-Product (Maintenance):**
Kafka → SO → Contract → Provider → Execution (no Go Exec) → WCF → Report → Payment

---

## Platform Capabilities Demonstrated

✅ Multi-channel sales integration (Kafka)  
✅ AI-powered routing and analysis  
✅ Complex provider orchestration  
✅ Quality control and rework handling  
✅ Multi-provider competitive dispatch  
✅ Subscription/SaaS service models  
✅ Complete financial transparency  
✅ B2B payment orchestration  
✅ Asset health tracking  
✅ Auto-scheduling and renewals
