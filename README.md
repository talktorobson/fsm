# Yellow Grid - Field Service Execution Platform

> **Repository Organization**: This repository contains both the **production specifications** and a **roadshow demo mockup**. See structure below for clear separation.

## 🏗️ Repository Structure

```
yellow-grid-platform/
│
├── product-docs/          📚 REAL PRODUCT - Complete engineering specifications
│   ├── architecture/      System design, technical decisions (production-ready)
│   ├── domain/            Business domain models & logic
│   ├── api/               REST API specifications (OpenAPI 3.1)
│   ├── integration/       External system integrations
│   ├── security/          Security, RBAC, GDPR compliance
│   ├── infrastructure/    Database, messaging, deployment
│   ├── operations/        Monitoring, logging, incident response
│   ├── testing/           Testing strategies & standards
│   └── development/       Dev workflows, coding standards
│
├── roadshow-mockup/       🎬 DEMO ONLY - Simplified mockup for presentations
│   ├── apps/              Demo applications (backend, web, mobile)
│   ├── docker/            Local development infrastructure
│   └── README.md          ⚠️ DEMO DOCUMENTATION
│
├── docs/                  📋 Architecture analysis & recommendations
├── CLAUDE.md              🤖 AI Assistant guide
├── ENGINEERING_KIT_SUMMARY.md  📖 Project overview
└── README.md              👈 You are here
```

## ⚠️ IMPORTANT: Mockup vs. Real Product

### 📚 Product Documentation (`/product-docs/`)
- **Status**: Complete, production-ready specifications
- **Purpose**: Blueprint for building the real Yellow Grid platform
- **Content**: 40+ engineering documents, ~39,400 lines
- **Use**: Reference for actual product development
- **Team Size**: 10-14 engineers recommended
- **Timeline**: 28-week implementation roadmap

### 🎬 Roadshow Mockup (`/roadshow-mockup/`)
- **Status**: Simplified demo implementation
- **Purpose**: Investor/client presentations and roadshows
- **Content**: Working prototype with core features
- **Use**: Demo scenarios, not production code
- **Limitations**: Simplified architecture, mock data, no security hardening
- **Timeline**: 6-8 week build for demo purposes

**⚠️ DO NOT use mockup code as production code base!**

---

## 🌟 About Yellow Grid

Yellow Grid is a comprehensive **Field Service Management (FSM) platform** designed for multi-country, multi-tenant operations in the home services industry.

### Key Value Propositions

1. **Assignment Transparency** ⭐ UNIQUE DIFFERENTIATOR
   - Complete audit trail showing why providers were selected/rejected
   - Scoring breakdown (distance, rating, availability, skills)
   - Funnel analytics for every assignment decision

2. **Technical Visit Intelligence**
   - Smart dependency management (TV → Installation)
   - Automatic blocking/unblocking based on outcomes
   - YES/YES-BUT/NO outcome tracking

3. **Multi-Country Operations at Scale**
   - Handles 4+ countries simultaneously
   - Country-specific business rules
   - Multi-currency, multi-language support

4. **Real-Time Field Operations**
   - Offline-first mobile app for technicians
   - GPS check-in/check-out
   - Photo capture, customer signatures
   - Live status updates

5. **Enterprise-Grade Architecture**
   - Multi-tenant SaaS platform
   - GDPR compliant
   - Role-based access control (RBAC)
   - 99.9% uptime SLA

---

## 🚀 Quick Start

### For Product Development (Real Platform)

1. **Read Specifications**:
   ```bash
   # Start here
   cat product-docs/README.md
   cat product-docs/IMPLEMENTATION_GUIDE.md
   cat CLAUDE.md  # If you're an AI assistant
   ```

2. **Understand Architecture**:
   - Review `/product-docs/architecture/` for system design
   - Check `/product-docs/domain/` for business logic
   - Study `/ARCHITECTURE_SIMPLIFICATION.md` for recommendations

3. **Plan Implementation**:
   - Follow the 28-week roadmap in `IMPLEMENTATION_GUIDE.md`
   - Assemble 10-14 person team
   - Set up infrastructure per specs

### For Roadshow Demo

1. **Run the Mockup**:
   ```bash
   cd roadshow-mockup
   cat README.md  # Demo-specific instructions
   ```

2. **Present to Investors/Clients**:
   - Use pre-loaded demo scenarios
   - Follow demo script (see mockup README)
   - Showcase key differentiators

---

## 📚 Documentation

| Document | Purpose | Audience |
|----------|---------|----------|
| **product-docs/README.md** | Master documentation index | All team members |
| **IMPLEMENTATION_GUIDE.md** | 28-week roadmap | Tech lead, PM |
| **CLAUDE.md** | AI assistant guide | AI assistants |
| **ENGINEERING_KIT_SUMMARY.md** | High-level overview | Stakeholders |
| **ARCHITECTURE_SIMPLIFICATION.md** | Simplification recommendations | Tech lead, architects |
| **roadshow-mockup/README.md** | Demo setup & usage | Sales, marketing |

---

## 📝 Key Documents by Use Case

**Starting Development?**
→ `product-docs/IMPLEMENTATION_GUIDE.md`

**Understanding Architecture?**
→ `product-docs/architecture/01-architecture-overview.md`

**Building APIs?**
→ `product-docs/api/01-api-design-principles.md`

**Security & Compliance?**
→ `product-docs/security/03-data-privacy-gdpr.md`

**Running Demo?**
→ `roadshow-mockup/README.md`

**AI Assistant?**
→ `CLAUDE.md`

---

## 📊 Project Scope

### Core Features

✅ **Orchestration & Control**: Projects, service orders, journeys, tasks
✅ **Provider & Capacity Management**: Providers, teams, calendars, zones
✅ **Scheduling & Availability**: Buffer logic, slot calculation
✅ **Assignment & Dispatch**: Intelligent matching with transparency
✅ **Execution & Mobile**: Check-in/out, checklists, offline sync
✅ **Communication**: SMS, email, masked communication
✅ **Contracts & Documents**: E-signature, work closing forms
✅ **Analytics & Reporting**: Provider scorecards, KPIs

---

## 🛠️ Technology Stack (Production)

### Backend
- **Language**: TypeScript
- **Runtime**: Node.js 20 LTS
- **Framework**: NestJS 10+
- **ORM**: Prisma
- **Database**: PostgreSQL 15+
- **Messaging**: Apache Kafka (or simplified Outbox pattern)
- **Cache**: Redis/Valkey

### Frontend
- **Web**: React 18 + TypeScript
- **Mobile**: React Native + Expo
- **State**: Redux/Zustand
- **API**: REST (OpenAPI 3.1)

### Infrastructure
- **Container**: Docker
- **Orchestration**: Kubernetes (AWS EKS / Azure AKS)
- **CI/CD**: GitHub Actions
- **Cloud**: AWS or Azure
- **Observability**: OpenTelemetry, Prometheus, Grafana

---

## 📈 Success Metrics

### Technical KPIs
- API latency < 500ms (p95)
- Uptime: 99.9%
- Test coverage: >80%
- Build time: <10 min

### Business KPIs
- 10,000 service orders/month
- >95% assignment success rate
- >85% provider acceptance rate
- >4.5/5 customer satisfaction (CSAT)
- >90% first-time-fix rate

---

## 🗓️ Timeline

### Production Platform
- **Phase 1**: Foundation (Weeks 1-4)
- **Phase 2**: Core Business Logic (Weeks 5-12)
- **Phase 3**: Communication & UX (Weeks 13-16)
- **Phase 4**: Mobile & Advanced (Weeks 17-24)
- **Phase 5**: Integration & Production (Weeks 25-28)
- **Phase 6**: Scale (Week 29+)

**Total**: 28 weeks to production-ready with 10-14 person team

### Roadshow Mockup
- **Week 1-6**: Build demo platform
- **Week 7**: Polish & rehearse
- **Week 8+**: Present to investors/clients

---

## ⚖️ License

UNLICENSED - Proprietary platform

---

## 🔄 Document Version

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2025-11-15 | Rebranded to Yellow Grid, separated mockup from product |
| 1.0.0 | 2025-01-15 | Initial project documentation |

---

**Yellow Grid** - Transforming Field Service Management 🌟
