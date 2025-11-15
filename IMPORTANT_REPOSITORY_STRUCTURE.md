# ⚠️ IMPORTANT: Repository Structure & Usage

**READ THIS FIRST BEFORE WORKING IN THIS REPOSITORY**

---

## 🚨 Critical Separation

This repository contains **TWO DISTINCT** components that must NEVER be confused:

### 1. `/product-docs/` - REAL PRODUCT SPECIFICATIONS ✅

```
📚 PRODUCTION-READY DOCUMENTATION
Status: Complete, reviewed, approved
Purpose: Blueprint for building the actual Yellow Grid platform
Use: Reference for real product development
Team: 10-14 engineers recommended
Timeline: 28-week implementation plan
```

**What it contains:**
- Complete engineering specifications
- Production-grade architecture designs
- API contracts (OpenAPI 3.1)
- Security & GDPR compliance docs
- Database schemas for production
- Testing strategies
- Operations runbooks

**When to use:**
- Building the REAL Yellow Grid platform
- Planning production architecture
- Defining API contracts
- Implementing security features
- Production deployment

---

### 2. `/roadshow-mockup/` - DEMO ONLY ⚠️

```
🎬 SIMPLIFIED DEMONSTRATION CODE
Status: Demo/prototype quality
Purpose: Investor/client presentations
Use: Roadshow demos ONLY
Limitations: Simplified, no security hardening, mock data
Timeline: 6-8 weeks for demo build
```

**What it contains:**
- Working prototype/demo application
- Simplified NestJS backend
- React web app (Control Tower)
- React Native mobile app
- Pre-loaded demo scenarios
- Docker Compose for local dev

**When to use:**
- Presenting to investors
- Client demonstrations
- Roadshow presentations
- Proof of concept

**DO NOT use for:**
- ❌ Production deployment
- ❌ Real customer data
- ❌ As production code base
- ❌ Security-critical operations
- ❌ Actual business operations

---

## 📋 Decision Matrix

| Question | Answer |
|----------|--------|
| **Building the real product?** | Use `/product-docs/` |
| **Need API specifications?** | Use `/product-docs/api/` |
| **Security implementation?** | Use `/product-docs/security/` |
| **Database design for production?** | Use `/product-docs/infrastructure/02-database-design.md` |
| **Showing demo to investors?** | Use `/roadshow-mockup/` |
| **Quick prototype needed?** | Use `/roadshow-mockup/` (but DON'T evolve it into production!) |
| **Testing a concept?** | Use `/roadshow-mockup/` for quick validation |
| **Going to production?** | **START FRESH** following `/product-docs/` specs |

---

## 🏗️ Correct Development Workflow

### For Real Product Development

```bash
# 1. Read specifications
cd product-docs
cat README.md
cat IMPLEMENTATION_GUIDE.md

# 2. Create NEW production codebase (outside this repo or in /platform directory)
mkdir -p ../yellow-grid-production
cd ../yellow-grid-production

# 3. Follow specifications from /product-docs/
# 4. Build with production-grade patterns
# 5. Implement proper security, testing, monitoring
```

**❌ WRONG:** Taking `/roadshow-mockup/` and trying to make it production-ready
**✅ RIGHT:** Starting fresh with `/product-docs/` as the specification

### For Demo/Roadshow

```bash
# 1. Use existing mockup
cd roadshow-mockup

# 2. Run demo scenarios
npm install
npm run docker:up
npm run seed
npm run dev:backend

# 3. Present to stakeholders
# 4. Gather feedback
# 5. Update /product-docs/ based on feedback (NOT the mockup code)
```

---

## 🔥 Common Mistakes to AVOID

### ❌ Mistake #1: Evolving the Mockup
```
"Let's just add authentication to the mockup..."
"Let's make the mockup production-ready..."
"Let's fix security in the mockup for production..."
```
**Problem:** The mockup has architectural shortcuts that are fundamentally incompatible with production requirements.

**Solution:** Use mockup for demos only. Build production following `/product-docs/`.

### ❌ Mistake #2: Ignoring the Specs
```
"The mockup works fine, let's just use that pattern..."
"We don't need all that complexity in the docs..."
```
**Problem:** The specifications exist for a reason - production scale, security, compliance, multi-tenancy.

**Solution:** Follow `/product-docs/` specifications. They're based on real production requirements.

### ❌ Mistake #3: Mixing Code and Specs
```
"Let's copy the mockup database schema to production..."
"The mockup API is simpler, let's use that..."
```
**Problem:** Mockup = simplified for demo. Production = comprehensive for real operations.

**Solution:** Treat them as completely separate. Specs in `/product-docs/`, demo in `/roadshow-mockup/`.

---

## 📊 Comparison Table

| Aspect | `/product-docs/` (REAL) | `/roadshow-mockup/` (DEMO) |
|--------|------------------------|----------------------------|
| **Purpose** | Production blueprint | Investor demo |
| **Quality** | Production-grade | Prototype/POC |
| **Security** | Full RBAC, audit, encryption | Basic JWT only |
| **Testing** | 80%+ coverage required | Minimal/none |
| **Architecture** | Microservices/modular | Simplified monolith |
| **Database** | Multi-schema, RLS, partitioning | Single schema, app filtering |
| **Events** | Kafka/robust messaging | In-memory events |
| **Performance** | Optimized, load tested | Demo data only |
| **Scalability** | 100k+ orders/month | 500 demo records |
| **Monitoring** | Full observability stack | Basic logs |
| **Integrations** | Real external systems | Mocked/stubbed |
| **Deployment** | Kubernetes, multi-AZ | Docker Compose |
| **Cost** | $20k-$30k/month infra | $200/month dev |
| **Team** | 10-14 engineers | 3-4 developers |
| **Timeline** | 28 weeks | 6-8 weeks |
| **Use for production?** | ✅ YES | ❌ NO |

---

## 🎯 Key Takeaways

1. **`/product-docs/` = The Truth** - This is what we're actually building
2. **`/roadshow-mockup/` = Show & Tell** - This is what we show to get funding/customers
3. **They are SEPARATE** - Do not mix code from mockup into production
4. **Specifications First** - Always refer to `/product-docs/` for production decisions
5. **Demo is Disposable** - The mockup can be thrown away after funding/pilot secured

---

## 📞 Who to Ask

**Questions about:**
- **Product specifications** → Platform Architecture Team
- **Production implementation** → Tech Lead
- **Roadshow demo** → Sales Engineering Team
- **Demo scenarios** → Product/Marketing Team

---

## 📝 Document Updates

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-15 | Initial separation documentation |

---

**Remember:** Mockup = Demo Only. Real Product = Follow /product-docs/

**Yellow Grid Team** 🌟
