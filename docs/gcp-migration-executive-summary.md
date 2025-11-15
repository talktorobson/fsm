# GCP SaaS Migration - Executive Summary

## Overview

Analysis of the AHS Field Service Management platform architecture reveals significant AWS/Azure assumptions that require adaptation for GCP deployment. This document summarizes critical findings and required changes.

---

## Critical GCP-Specific Concerns

### 1. Database Connections - HIGH PRIORITY

**Current Pattern:**
```typescript
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/db
```

**GCP Requirement:**
```typescript
// Must use Cloud SQL Proxy - either as:
// 1. Sidecar container in GKE pods
// 2. npm package (@google-cloud/cloud-sql-connector)
DATABASE_URL=postgresql://user:pass@127.0.0.1:5432/db
```

**Impact:**
- All database connection code needs Cloud SQL Proxy integration
- K8s deployments need sidecar containers
- Connection pooling strategy may need PgBouncer

**Effort:** 3-5 days

---

### 2. Kubernetes Platform - MEDIUM PRIORITY

**Current:** EKS-specific configurations
**GCP Options:**
- **GKE Autopilot** (Recommended): Fully managed, simpler, higher cost per pod
- **GKE Standard**: More control, node pools, lower cost at scale

**Key Differences:**
- Workload Identity replaces IRSA (IAM Roles for Service Accounts)
- Different network plugin (GKE uses Calico/Cilium)
- No separate public subnets needed (Cloud NAT handles egress)

**Required Changes:**
```hcl
# Replace AWS EKS module
module "eks" { ... }

# With GKE
resource "google_container_cluster" "primary" {
  enable_autopilot = true
  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }
}
```

**Effort:** 2-4 weeks (Terraform rewrite)

---

### 3. Secrets Management - HIGH PRIORITY

**Current:** AWS Secrets Manager / Azure Key Vault
**GCP:** Secret Manager

**Recommended Approach:**
```yaml
# Use External Secrets Operator
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
spec:
  provider:
    gcpsm:
      projectID: "project-id"
      auth:
        workloadIdentity: {}
```

**Application Code Impact:**
- Replace AWS SDK calls with GCP Secret Manager SDK
- OR use External Secrets Operator (no code changes)

**Effort:** 1-2 days (if using External Secrets Operator), 5-7 days (if direct SDK)

---

### 4. Messaging Architecture - CRITICAL DECISION

**Current Plan (per ARCHITECTURE_SIMPLIFICATION.md):**
- Remove Kafka entirely
- Use PostgreSQL Outbox pattern
- Handles 10k events/sec

**GCP Options:**
- **Option A: Outbox Pattern** (Recommended) - No GCP-specific changes
- **Option B: Pub/Sub** - If need > 10k events/sec or cross-region

**Recommendation:** Stick with Outbox pattern (no GCP changes needed)

**Cost Savings:** $1000/mo from removing Kafka

---

### 5. File Storage - MEDIUM PRIORITY

**Current:** S3/Azure Blob with pre-signed URLs
**GCP:** Cloud Storage with signed URLs

**Code Changes:**
```typescript
// Replace AWS SDK
import { S3 } from 'aws-sdk';

// With GCP SDK
import { Storage } from '@google-cloud/storage';

const storage = new Storage();
const [url] = await bucket.file(path).getSignedUrl({
  version: 'v4',
  action: 'write',
  expires: Date.now() + 15 * 60 * 1000,
});
```

**Effort:** 2-3 days

---

### 6. Authentication & Authorization

**Current:** PingID SSO + JWT
**GCP Additions:**

1. **Workload Identity** (Service-to-Service)
   - Replaces IAM roles for pods
   - No service account keys needed
   - Configuration in Terraform + K8s SA annotations

2. **Identity Platform** (External Users)
   - Supports SAML/OIDC (PingID compatible)
   - Managed user database
   - Optional if continuing with custom auth

3. **Identity-Aware Proxy (IAP)** (Optional)
   - GCP-managed auth layer
   - Validates JWT before reaching app
   - Good for admin portals

**Recommendation:** Workload Identity (required), Identity Platform (optional if centralizing auth)

**Effort:** 3-5 days for Workload Identity, 5-10 days for Identity Platform

---

### 7. Monitoring & Logging

**Current:** Grafana + Loki + Tempo + Prometheus
**GCP:** Cloud Operations Suite (formerly Stackdriver)

**Changes:**
```typescript
// Keep OpenTelemetry instrumentation
import { NodeSDK } from '@opentelemetry/sdk-node';
import { TraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter';

const sdk = new NodeSDK({
  traceExporter: new TraceExporter(),
  // ... existing instrumentations
});
```

**Benefits:**
- No self-hosted Grafana/Loki/Tempo
- Lower cost ($0-50/mo vs $200/mo)
- Automatic integration with GKE

**Effort:** 3-5 days

---

### 8. Networking Architecture

**Current:** AWS VPC with public/private subnets, NAT Gateways per AZ
**GCP:** VPC with Cloud NAT

**Key Differences:**

| AWS | GCP |
|-----|-----|
| Public + Private subnets | All subnets private |
| Internet Gateway for public | Cloud NAT for outbound |
| NAT Gateway per AZ | Regional Cloud NAT |
| Security Groups | Firewall Rules |
| VPC Endpoints | Private Google Access |

**Terraform Changes:**
```hcl
# Replace AWS VPC module
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  # ...
}

# With GCP VPC
resource "google_compute_network" "vpc" {
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "private" {
  ip_cidr_range = "10.0.0.0/20"

  # GKE secondary ranges
  secondary_ip_range {
    range_name    = "gke-pods"
    ip_cidr_range = "10.1.0.0/16"
  }
  secondary_ip_range {
    range_name    = "gke-services"
    ip_cidr_range = "10.2.0.0/20"
  }

  private_ip_google_access = true
}

resource "google_compute_router_nat" "nat" {
  # Regional NAT for outbound
}
```

**Effort:** 1-2 weeks (Terraform rewrite)

---

## Migration Cost Analysis

### Infrastructure Costs

| Component | Current (AWS) | GCP | Delta |
|-----------|---------------|-----|-------|
| Kubernetes | EKS $72 + EC2 $500 | GKE Autopilot $600 | +$28/mo |
| Database | RDS $500 | Cloud SQL $400 | +$100/mo |
| ~~Kafka~~ | ~~MSK $1000~~ | **Removed** | **+$1000/mo** |
| Redis | ElastiCache $150 | Memorystore $120 | +$30/mo |
| Storage | S3 $50 | GCS $40 | +$10/mo |
| Monitoring | Grafana Cloud $200 | Cloud Ops $50 | +$150/mo |
| Load Balancer | ALB $50 | Cloud LB $20 | +$30/mo |
| **Total** | **~$2522/mo** | **~$1230/mo** | **+$1292/mo savings** |

### Development Effort

| Area | Effort | Priority |
|------|--------|----------|
| Terraform Infrastructure | 3-4 weeks | HIGH |
| Database Connection (Cloud SQL Proxy) | 3-5 days | HIGH |
| Secrets Management | 1-2 days | HIGH |
| File Storage (GCS) | 2-3 days | MEDIUM |
| Workload Identity | 3-5 days | HIGH |
| Monitoring Integration | 3-5 days | MEDIUM |
| Testing & Validation | 2-3 weeks | HIGH |
| **Total** | **8-12 weeks** | |

---

## Key Decisions Required

### 1. GKE Mode: Autopilot vs Standard?

**Autopilot (Recommended):**
- ✅ Fully managed, less config
- ✅ Faster to production
- ✅ Automatic scaling
- ❌ Higher cost per pod (~20% more)
- ❌ Less control over node config

**Standard:**
- ✅ Full control (taints, node pools)
- ✅ Lower cost at scale
- ❌ More operational overhead
- ❌ Manage node upgrades

**Recommendation:** Start with Autopilot, migrate to Standard if cost becomes issue (>$5k/mo K8s spend)

---

### 2. Messaging: Outbox Pattern vs Pub/Sub?

**Outbox Pattern (Recommended):**
- ✅ No additional infrastructure
- ✅ $0 cost (uses existing DB)
- ✅ Simple, proven
- ❌ Limited to 10k events/sec
- ❌ No cross-region delivery

**Pub/Sub:**
- ✅ Scales to millions of events/sec
- ✅ Cross-region, geo-replication
- ✅ Third-party integrations
- ❌ $2000/mo for 10k events/sec
- ❌ More complexity

**Recommendation:** Outbox Pattern unless you have:
- > 10k events/sec sustained
- Cross-region event delivery needs
- External system integrations via events

---

### 3. Multi-Region from Day 1?

**Single Region:**
- ✅ Simpler, faster to launch
- ✅ Lower cost
- ❌ No geographic redundancy

**Multi-Region:**
- ✅ Disaster recovery
- ✅ Geo-distribution
- ❌ 2-3x cost
- ❌ Data sync complexity

**Recommendation:** Single region (us-central1) initially, add regions based on:
- Customer geographic distribution
- Compliance requirements (GDPR data residency)
- SLA requirements

---

### 4. Identity Platform Integration?

**Continue Custom Auth:**
- ✅ No migration needed
- ✅ Full control
- ❌ Maintain auth code

**Use Identity Platform:**
- ✅ Managed user database
- ✅ Built-in MFA, password policies
- ✅ SAML/OIDC connectors
- ❌ Migration effort
- ❌ Lock-in to GCP

**Recommendation:** Keep custom auth initially, evaluate Identity Platform after stabilizing on GCP

---

## Migration Risks & Mitigations

### Risk 1: Cloud SQL Connection Failures
**Impact:** High - Application can't connect to database
**Mitigation:**
- Extensive testing of Cloud SQL Proxy in dev
- PgBouncer for connection pooling
- Health checks and automatic restarts

### Risk 2: Workload Identity Misconfiguration
**Impact:** High - Pods can't access GCP resources
**Mitigation:**
- Test in dev environment thoroughly
- Clear documentation of SA bindings
- Monitoring for auth failures

### Risk 3: Network Connectivity Issues
**Impact:** Medium - Services can't communicate
**Mitigation:**
- Validate firewall rules in staging
- Test Cloud NAT for external APIs
- Document all network flows

### Risk 4: Cost Overruns
**Impact:** Medium - Budget exceeded
**Mitigation:**
- Start with Autopilot (predictable pricing)
- Set billing alerts
- Use Cloud Pricing Calculator
- Monitor actual usage weekly

### Risk 5: Performance Degradation
**Impact:** High - SLA violations
**Mitigation:**
- Load test in staging before production
- Compare Cloud SQL vs RDS performance
- Monitor latency metrics
- Have rollback plan

---

## Migration Timeline

### Phase 1: Foundation (Weeks 1-4)
- ✅ GCP project setup
- ✅ VPC networking
- ✅ GKE cluster (Autopilot)
- ✅ Cloud SQL instance
- ✅ Secret Manager setup
- ✅ Workload Identity configuration

### Phase 2: Application Integration (Weeks 5-8)
- ✅ Cloud SQL Proxy integration
- ✅ External Secrets Operator
- ✅ Cloud Storage SDK
- ✅ Monitoring integration
- ✅ Deploy to dev environment

### Phase 3: Testing (Weeks 9-10)
- ✅ Functional testing
- ✅ Performance testing
- ✅ Security testing
- ✅ Disaster recovery testing

### Phase 4: Production Migration (Weeks 11-12)
- ✅ Staging deployment
- ✅ Production deployment (blue/green)
- ✅ DNS cutover
- ✅ Decommission AWS resources

---

## Success Criteria

1. **Functional Parity:** All features work on GCP
2. **Performance:** p95 latency ≤ AWS baseline
3. **Cost:** ≤ $1500/mo (50% reduction)
4. **Reliability:** 99.9% uptime in first month
5. **Security:** Pass security audit
6. **Team Knowledge:** Team comfortable operating on GCP

---

## Recommendations

### Immediate Actions (Week 1)
1. ✅ Create GCP dev project
2. ✅ Prototype Cloud SQL Proxy connection
3. ✅ Test GKE Autopilot cluster creation
4. ✅ Validate Workload Identity setup
5. ✅ Review this doc with engineering team

### Short-term (Weeks 2-4)
1. ✅ Complete Terraform infrastructure code
2. ✅ Deploy dev environment
3. ✅ Integrate Secret Manager
4. ✅ Test Cloud Storage SDK

### Medium-term (Weeks 5-8)
1. ✅ Full application deployment to dev
2. ✅ Integration testing
3. ✅ Performance testing
4. ✅ Document operational runbooks

### Long-term (Weeks 9-12)
1. ✅ Staging deployment
2. ✅ Production migration
3. ✅ Cost optimization review
4. ✅ Post-migration retrospective

---

## Questions for Architecture Review

1. **Database:** Acceptable to use Cloud SQL Proxy sidecar vs direct connections?
2. **Messaging:** Confirm Outbox pattern sufficient (no Pub/Sub needed)?
3. **Multi-region:** Required from day 1 or acceptable to add later?
4. **Identity:** Continue custom auth or migrate to Identity Platform?
5. **GKE Mode:** Autopilot for simplicity or Standard for cost control?
6. **Monitoring:** Cloud Operations sufficient or need self-hosted Grafana?
7. **Compliance:** Any GCP-specific compliance requirements?
8. **Budget:** $1500/mo target acceptable?

---

## Conclusion

The migration to GCP is **technically feasible** with moderate effort (8-12 weeks) and offers **significant cost savings** (~$1300/mo, 50% reduction).

**Key enablers:**
- Architecture simplification (removing Kafka) reduces complexity
- GCP's managed services (Cloud SQL, GKE Autopilot, Cloud Operations) reduce operational burden
- Workload Identity simplifies auth vs managing keys

**Key challenges:**
- Cloud SQL Proxy integration requires code changes
- Terraform infrastructure complete rewrite
- Team learning curve on GCP-specific patterns

**Recommended path:**
1. Start with GKE Autopilot for speed
2. Use Outbox pattern (no Pub/Sub)
3. Single region initially (us-central1)
4. Continue custom auth (no Identity Platform migration yet)
5. Migrate after thorough testing in dev/staging

**Next step:** Review with team, get alignment on key decisions, proceed with Phase 1 (Foundation).
