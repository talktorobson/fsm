# GCP SaaS Deployment - Implementation Guide

## Executive Summary

This document provides concrete, actionable implementation details for adapting the AHS Field Service Management platform from the current AWS/Azure multi-cloud architecture to a GCP-native SaaS deployment. It addresses specific code changes, configuration adjustments, and migration patterns needed.

**Key Finding**: The current architecture assumes AWS/Azure patterns extensively. GCP migration requires changes across 8 major areas.

---

## 1. Infrastructure as Code Changes

### Current State Analysis

The existing Terraform assumes:
- AWS-specific resources (EKS, RDS, MSK, ElastiCache, S3)
- Azure-specific resources (AKS, Azure Database, Event Hubs)
- AWS/Azure VPC/VNet networking patterns

### GCP-Specific Terraform Adaptations

#### 1.1 GKE Cluster Configuration

**Current (AWS EKS):**
```hcl
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = "ahs-fsm-${var.environment}"
  cluster_version = "1.28"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets
}
```

**GCP Adaptation (GKE Autopilot):**
```hcl
# terraform/modules/gke/main.tf
resource "google_container_cluster" "primary" {
  name     = "ahs-fsm-${var.environment}"
  location = var.region  # Regional cluster for HA

  # Autopilot mode - fully managed
  enable_autopilot = true

  # Release channel for automatic upgrades
  release_channel {
    channel = "REGULAR"  # RAPID, REGULAR, or STABLE
  }

  # Network configuration
  network    = google_compute_network.vpc.id
  subnetwork = google_compute_subnetwork.private.id

  # IP allocation for pods and services
  ip_allocation_policy {
    cluster_secondary_range_name  = "gke-pods"
    services_secondary_range_name = "gke-services"
  }

  # Private cluster configuration
  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false  # Allow public endpoint for CI/CD
    master_ipv4_cidr_block = "172.16.0.0/28"
  }

  # Workload Identity for service-to-service auth
  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  # Master authorized networks
  master_authorized_networks_config {
    cidr_blocks {
      cidr_block   = "10.0.0.0/8"
      display_name = "internal"
    }
  }

  # Monitoring and logging
  logging_config {
    enable_components = ["SYSTEM_COMPONENTS", "WORKLOADS"]
  }

  monitoring_config {
    enable_components = ["SYSTEM_COMPONENTS"]
    managed_prometheus {
      enabled = true
    }
  }

  # Binary authorization
  binary_authorization {
    evaluation_mode = "PROJECT_SINGLETON_POLICY_ENFORCE"
  }

  # Maintenance window
  maintenance_policy {
    daily_maintenance_window {
      start_time = "03:00"
    }
  }
}

# For more control, use Standard GKE with node pools:
resource "google_container_cluster" "standard" {
  name     = "ahs-fsm-${var.environment}-standard"
  location = var.region

  # Remove default node pool
  remove_default_node_pool = true
  initial_node_count       = 1

  # Same network/IP/workload identity config as above
  # ...
}

resource "google_container_node_pool" "primary_nodes" {
  name       = "primary-pool"
  cluster    = google_container_cluster.standard.id
  node_count = 3

  autoscaling {
    min_node_count = 3
    max_node_count = 10
  }

  node_config {
    machine_type = "n2-standard-4"
    disk_size_gb = 100
    disk_type    = "pd-standard"

    # Service account with minimal permissions
    service_account = google_service_account.gke_nodes.email
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]

    # Workload Identity
    workload_metadata_config {
      mode = "GKE_METADATA"
    }

    # Shielded nodes
    shielded_instance_config {
      enable_secure_boot          = true
      enable_integrity_monitoring = true
    }

    metadata = {
      disable-legacy-endpoints = "true"
    }

    labels = {
      environment = var.environment
      managed-by  = "terraform"
    }

    taint {
      key    = "workload-type"
      value  = "api"
      effect = "NO_SCHEDULE"
    }
  }

  management {
    auto_repair  = true
    auto_upgrade = true
  }
}
```

**Decision Point:**
- **Autopilot**: Fully managed, less config, higher cost per pod, best for most workloads
- **Standard**: More control, node pools, taints/tolerations, cost optimization

**Recommendation**: Start with Autopilot for speed, migrate to Standard if cost becomes issue.

---

#### 1.2 VPC Network Configuration

**GCP-Specific Networking:**
```hcl
# terraform/modules/networking/main.tf
resource "google_compute_network" "vpc" {
  name                    = "ahs-fsm-${var.environment}"
  auto_create_subnetworks = false
  routing_mode            = "REGIONAL"
  mtu                     = 1460
}

# Private subnet for GKE and VMs
resource "google_compute_subnetwork" "private" {
  name          = "private-${var.region}"
  ip_cidr_range = "10.0.0.0/20"  # 10.0.0.0 - 10.0.15.255 (4096 IPs)
  region        = var.region
  network       = google_compute_network.vpc.id

  # Secondary ranges for GKE pods and services
  secondary_ip_range {
    range_name    = "gke-pods"
    ip_cidr_range = "10.1.0.0/16"  # 65k pod IPs
  }

  secondary_ip_range {
    range_name    = "gke-services"
    ip_cidr_range = "10.2.0.0/20"  # 4k service IPs
  }

  # Private Google Access for GCP APIs without NAT
  private_ip_google_access = true

  log_config {
    aggregation_interval = "INTERVAL_10_MIN"
    flow_sampling        = 0.5
    metadata             = "INCLUDE_ALL_METADATA"
  }
}

# Data subnet for Cloud SQL, Memorystore
resource "google_compute_subnetwork" "data" {
  name          = "data-${var.region}"
  ip_cidr_range = "10.0.16.0/24"
  region        = var.region
  network       = google_compute_network.vpc.id

  private_ip_google_access = true
}

# Cloud NAT for outbound internet (external APIs, webhooks)
resource "google_compute_router" "router" {
  name    = "router-${var.region}"
  region  = var.region
  network = google_compute_network.vpc.id
}

resource "google_compute_router_nat" "nat" {
  name   = "nat-${var.region}"
  router = google_compute_router.router.name
  region = var.region

  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}

# Firewall rules
resource "google_compute_firewall" "allow_internal" {
  name    = "allow-internal"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }

  allow {
    protocol = "udp"
    ports    = ["0-65535"]
  }

  allow {
    protocol = "icmp"
  }

  source_ranges = ["10.0.0.0/8"]
}

resource "google_compute_firewall" "allow_healthchecks" {
  name    = "allow-healthchecks"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
    ports    = ["80", "443", "8080"]
  }

  # Google Cloud health check ranges
  source_ranges = [
    "35.191.0.0/16",
    "130.211.0.0/22"
  ]
}
```

**Key Differences from AWS:**
- No separate "public" subnets - Cloud NAT handles outbound
- Secondary IP ranges required for GKE
- Private Google Access replaces VPC endpoints
- Firewall rules instead of Security Groups

---

## 2. Database Connection Patterns

### Current State
- Direct PostgreSQL connections to AWS RDS
- Connection string: `postgresql://user:pass@host:5432/db`
- Prisma ORM with DATABASE_URL

### GCP Cloud SQL Adaptations

#### 2.1 Cloud SQL Proxy Integration

**Infrastructure:**
```hcl
# terraform/modules/database/cloudsql.tf
resource "google_sql_database_instance" "postgres" {
  name             = "ahs-fsm-${var.environment}"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier              = "db-custom-8-32768"  # 8 vCPU, 32GB RAM
    availability_type = "REGIONAL"           # Multi-zone HA
    disk_type         = "PD_SSD"
    disk_size         = 100
    disk_autoresize   = true

    # Backups
    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      point_in_time_recovery_enabled = true
      transaction_log_retention_days = 7
      backup_retention_settings {
        retained_backups = 30
        retention_unit   = "COUNT"
      }
    }

    # Maintenance window
    maintenance_window {
      day          = 7  # Sunday
      hour         = 4
      update_track = "stable"
    }

    # IP configuration
    ip_configuration {
      ipv4_enabled    = false  # Private IP only
      private_network = google_compute_network.vpc.id
      require_ssl     = true

      # No authorized networks - use Cloud SQL Proxy
    }

    # Database flags (PostgreSQL tuning)
    database_flags {
      name  = "max_connections"
      value = "500"
    }

    database_flags {
      name  = "shared_buffers"
      value = "8388608"  # 8GB in 8KB blocks
    }

    database_flags {
      name  = "effective_cache_size"
      value = "25165824"  # 24GB
    }

    database_flags {
      name  = "work_mem"
      value = "16384"  # 16MB
    }

    database_flags {
      name  = "random_page_cost"
      value = "1.1"  # SSD
    }

    insights_config {
      query_insights_enabled  = true
      query_string_length     = 1024
      record_application_tags = true
      record_client_address   = true
    }
  }

  deletion_protection = var.environment == "production"
}

# Read replicas
resource "google_sql_database_instance" "postgres_replica" {
  count            = var.read_replica_count
  name             = "ahs-fsm-${var.environment}-replica-${count.index + 1}"
  database_version = "POSTGRES_15"
  region           = var.region

  master_instance_name = google_sql_database_instance.postgres.name

  replica_configuration {
    failover_target = false
  }

  settings {
    tier              = "db-custom-4-16384"
    availability_type = "ZONAL"
    disk_type         = "PD_SSD"

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
      require_ssl     = true
    }
  }
}
```

#### 2.2 Application Code Changes

**Option 1: Cloud SQL Proxy Sidecar (Recommended)**

```yaml
# k8s/deployments/api.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fsm-api
spec:
  template:
    spec:
      serviceAccountName: fsm-api
      containers:
      # Main application container
      - name: api
        image: gcr.io/PROJECT_ID/fsm-api:latest
        env:
        - name: DATABASE_URL
          value: "postgresql://user:pass@127.0.0.1:5432/fsm_prod?sslmode=disable"
        - name: DATABASE_HOST
          value: "127.0.0.1"  # Proxy on localhost
        ports:
        - containerPort: 3000

      # Cloud SQL Proxy sidecar
      - name: cloud-sql-proxy
        image: gcr.io/cloud-sql-connectors/cloud-sql-proxy:2.8.0
        args:
          - "--structured-logs"
          - "--port=5432"
          - "PROJECT_ID:REGION:INSTANCE_NAME"
        securityContext:
          runAsNonRoot: true
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "250m"
```

**Workload Identity Setup:**
```hcl
# terraform/modules/workload-identity/main.tf
resource "google_service_account" "fsm_api" {
  account_id   = "fsm-api"
  display_name = "FSM API Service Account"
}

resource "google_project_iam_member" "cloudsql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.fsm_api.email}"
}

resource "google_service_account_iam_member" "workload_identity" {
  service_account_id = google_service_account.fsm_api.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.project_id}.svc.id.goog[default/fsm-api]"
}
```

**Option 2: Cloud SQL Auth Proxy npm Package**

```typescript
// src/lib/db/connection.ts
import { Connector } from '@google-cloud/cloud-sql-connector';
import { Pool } from 'pg';

const connector = new Connector();

let pool: Pool | null = null;

export async function getPostgresPool(): Promise<Pool> {
  if (pool) return pool;

  const clientOpts = await connector.getOptions({
    instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME!,
    ipType: 'PRIVATE',  // Use private IP
  });

  pool = new Pool({
    ...clientOpts,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  return pool;
}

// Prisma integration
import { PrismaClient } from '@prisma/client';

export async function getPrismaClient(): Promise<PrismaClient> {
  const pool = await getPostgresPool();

  // Use pg pool with Prisma
  // Note: Prisma needs DATABASE_URL, use pg-connection-string
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
}
```

**Environment Variables:**
```bash
# .env.gcp
INSTANCE_CONNECTION_NAME=project-id:region:instance-name
DB_USER=fsm_app
DB_PASSWORD=<from Secret Manager>
DB_NAME=fsm_prod
DATABASE_URL=postgresql://fsm_app:PASSWORD@/fsm_prod?host=/cloudsql/project-id:region:instance-name
```

#### 2.3 Connection Pooling with PgBouncer on GKE

Since Cloud SQL has connection limits, use PgBouncer:

```yaml
# k8s/pgbouncer/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pgbouncer
spec:
  replicas: 3
  selector:
    matchLabels:
      app: pgbouncer
  template:
    metadata:
      labels:
        app: pgbouncer
    spec:
      containers:
      - name: pgbouncer
        image: edoburu/pgbouncer:1.21.0
        ports:
        - containerPort: 5432
        env:
        - name: DATABASE_URL
          value: "postgresql://user:pass@127.0.0.1:5432/fsm_prod"
        - name: POOL_MODE
          value: "transaction"
        - name: MAX_CLIENT_CONN
          value: "10000"
        - name: DEFAULT_POOL_SIZE
          value: "25"
        - name: MIN_POOL_SIZE
          value: "10"
        - name: RESERVE_POOL_SIZE
          value: "10"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"

      # Cloud SQL Proxy sidecar
      - name: cloud-sql-proxy
        image: gcr.io/cloud-sql-connectors/cloud-sql-proxy:2.8.0
        args:
          - "--port=5432"
          - "PROJECT_ID:REGION:INSTANCE_NAME"
---
apiVersion: v1
kind: Service
metadata:
  name: pgbouncer
spec:
  selector:
    app: pgbouncer
  ports:
  - port: 5432
    targetPort: 5432
  type: ClusterIP
```

**Application connects to PgBouncer instead:**
```bash
DATABASE_URL=postgresql://user:pass@pgbouncer:5432/fsm_prod
```

---

## 3. Environment Configuration & Secrets

### Current State
- AWS Secrets Manager / Azure Key Vault
- Environment variables from CI/CD or k8s secrets

### GCP Secret Manager Integration

#### 3.1 Store Secrets in Secret Manager

```hcl
# terraform/modules/secrets/main.tf
resource "google_secret_manager_secret" "db_password" {
  secret_id = "db-password"

  replication {
    user_managed {
      replicas {
        location = var.region
      }
    }
  }
}

resource "google_secret_manager_secret_version" "db_password" {
  secret = google_secret_manager_secret.db_password.id

  secret_data = var.db_password  # From tfvars, never in code
}

# Grant access to GKE service account
resource "google_secret_manager_secret_iam_member" "fsm_api" {
  secret_id = google_secret_manager_secret.db_password.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.fsm_api.email}"
}
```

#### 3.2 Access Secrets from Application

**Option 1: External Secrets Operator (Recommended)**

```yaml
# k8s/external-secrets/secret-store.yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: gcpsm-secret-store
spec:
  provider:
    gcpsm:
      projectID: "project-id"
      auth:
        workloadIdentity:
          clusterLocation: us-central1
          clusterName: ahs-fsm-prod
          serviceAccountRef:
            name: fsm-api
---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: database-credentials
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: gcpsm-secret-store
    kind: SecretStore
  target:
    name: database-credentials
    creationPolicy: Owner
  data:
  - secretKey: password
    remoteRef:
      key: db-password
  - secretKey: username
    remoteRef:
      key: db-username
```

Then mount as env vars:
```yaml
envFrom:
- secretRef:
    name: database-credentials
```

**Option 2: Direct SDK Access**

```typescript
// src/lib/secrets/gcp-secret-manager.ts
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

async function accessSecret(secretName: string): Promise<string> {
  const name = `projects/${process.env.GCP_PROJECT_ID}/secrets/${secretName}/versions/latest`;

  const [version] = await client.accessSecretVersion({ name });

  if (!version.payload?.data) {
    throw new Error(`Secret ${secretName} not found`);
  }

  return version.payload.data.toString();
}

// Cache secrets on startup
let dbPassword: string;

export async function initSecrets() {
  dbPassword = await accessSecret('db-password');
  // ... other secrets
}

export function getDbPassword(): string {
  if (!dbPassword) throw new Error('Secrets not initialized');
  return dbPassword;
}
```

#### 3.3 Feature Flags with GCP

Since the architecture proposes simple environment-based flags:

```typescript
// src/lib/config/feature-flags.ts
interface FeatureFlags {
  providerScoringV2: boolean;
  newSchedulingEngine: boolean;
  advancedAnalytics: boolean;
}

const flags: Record<string, FeatureFlags> = {
  dev: {
    providerScoringV2: true,
    newSchedulingEngine: true,
    advancedAnalytics: true,
  },
  staging: {
    providerScoringV2: true,
    newSchedulingEngine: true,
    advancedAnalytics: false,
  },
  prod: {
    providerScoringV2: false,
    newSchedulingEngine: false,
    advancedAnalytics: false,
  },
};

export function getFeatureFlags(): FeatureFlags {
  const env = process.env.NODE_ENV || 'dev';
  return flags[env] || flags.dev;
}
```

**OR use GCP Config Connector for dynamic flags:**

```yaml
# k8s/configmaps/feature-flags.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: feature-flags
data:
  flags.json: |
    {
      "providerScoringV2": false,
      "newSchedulingEngine": true,
      "advancedAnalytics": false
    }
```

---

## 4. Messaging Patterns (Pub/Sub vs Kafka)

### Current Architecture Decision Point

The ARCHITECTURE_SIMPLIFICATION.md proposes **removing Kafka** in favor of PostgreSQL Outbox pattern. This aligns well with GCP, but you have two paths:

**Option A: Outbox Pattern + PostgreSQL (Recommended per simplification doc)**
- No Kafka, no Pub/Sub
- Events stored in `outbox` table, polled by worker
- Simpler, cheaper, handles 10k events/sec

**Option B: GCP Pub/Sub (If you need distributed messaging)**
- Managed service, auto-scaling
- Better for microservices, cross-region
- More expensive ($40/GB ingress + $40/GB egress)

### 4.1 Outbox Pattern Implementation (No GCP-specific changes)

Already covered in simplification doc. No GCP adaptation needed.

### 4.2 GCP Pub/Sub Integration (If chosen)

**Infrastructure:**
```hcl
# terraform/modules/pubsub/main.tf
resource "google_pubsub_topic" "task_events" {
  name = "task-events"

  message_retention_duration = "604800s"  # 7 days

  schema_settings {
    schema   = google_pubsub_schema.task_event.id
    encoding = "JSON"
  }
}

resource "google_pubsub_schema" "task_event" {
  name       = "task-event-schema"
  type       = "AVRO"
  definition = file("${path.module}/schemas/task-event.avsc")
}

resource "google_pubsub_subscription" "task_processor" {
  name  = "task-processor"
  topic = google_pubsub_topic.task_events.name

  ack_deadline_seconds = 20

  message_retention_duration = "604800s"
  retain_acked_messages      = false

  expiration_policy {
    ttl = ""  # Never expire
  }

  dead_letter_policy {
    dead_letter_topic     = google_pubsub_topic.dlq.id
    max_delivery_attempts = 5
  }

  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "600s"
  }
}
```

**Publishing Events:**
```typescript
// src/lib/pubsub/publisher.ts
import { PubSub } from '@google-cloud/pubsub';

const pubsub = new PubSub();

export async function publishTaskEvent(event: any) {
  const topic = pubsub.topic('task-events');

  const message = {
    data: Buffer.from(JSON.stringify(event)),
    attributes: {
      eventType: event.type,
      timestamp: new Date().toISOString(),
    },
  };

  const messageId = await topic.publishMessage(message);
  console.log(`Published message ${messageId}`);
}
```

**Consuming Events:**
```typescript
// src/workers/task-event-consumer.ts
import { PubSub } from '@google-cloud/pubsub';

const pubsub = new PubSub();
const subscription = pubsub.subscription('task-processor');

subscription.on('message', async (message) => {
  try {
    const event = JSON.parse(message.data.toString());

    await processTaskEvent(event);

    message.ack();
  } catch (error) {
    console.error('Error processing message:', error);
    message.nack();  // Will retry up to 5 times
  }
});

subscription.on('error', (error) => {
  console.error('Subscription error:', error);
});
```

**Cost Comparison:**

| Solution | Monthly Cost (10k events/sec) | Complexity |
|----------|-------------------------------|------------|
| Outbox Pattern | $0 (uses existing DB) | Low |
| Pub/Sub | ~$2,000/month | Medium |
| Kafka (MSK) | ~$1,000/month + ops | High |

**Recommendation**: Start with Outbox Pattern per simplification doc. Only use Pub/Sub if:
- Need > 10k events/sec
- Need cross-region delivery
- Need third-party integrations

---

## 5. Authentication & Authorization

### Current State
- PingID SSO (SAML 2.0 / OIDC)
- JWT tokens signed with RS256
- AWS Secrets Manager for keys

### GCP Adaptations

#### 5.1 Identity Platform Integration

```hcl
# terraform/modules/identity/main.tf
resource "google_identity_platform_config" "default" {
  project = var.project_id

  autodelete_anonymous_users = true

  sign_in {
    allow_duplicate_emails = false

    email {
      enabled           = true
      password_required = true
    }
  }

  # Multi-tenancy support
  multi_tenant {
    allow_tenants = true
  }
}

# SAML provider (PingID)
resource "google_identity_platform_inbound_saml_config" "pingid" {
  name         = "saml.pingid"
  display_name = "PingID SSO"

  idp_config {
    idp_entity_id = var.ping_entity_id
    sso_url       = var.ping_sso_url

    idp_certificates {
      x509_certificate = var.ping_certificate
    }
  }

  sp_config {
    sp_entity_id = "https://fsm.example.com"
    callback_uri = "https://fsm.example.com/api/auth/saml/callback"
  }
}
```

#### 5.2 Workload Identity for Service-to-Service Auth

This replaces IAM roles for pods:

```yaml
# k8s/service-accounts/fsm-api.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: fsm-api
  annotations:
    iam.gke.io/gcp-service-account: fsm-api@project-id.iam.gserviceaccount.com
```

**Terraform binding:**
```hcl
resource "google_service_account_iam_member" "fsm_api_workload_identity" {
  service_account_id = google_service_account.fsm_api.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.project_id}.svc.id.goog[default/fsm-api]"
}
```

Now pods can access GCP APIs without service account keys!

#### 5.3 External Auth via Identity-Aware Proxy (IAP)

For external SSO (Ping) with GCP-managed auth:

```hcl
# terraform/modules/iap/main.tf
resource "google_compute_backend_service" "fsm_api" {
  name = "fsm-api-backend"

  backend {
    group = google_compute_instance_group_manager.fsm.instance_group
  }

  # Enable IAP
  iap {
    oauth2_client_id     = google_iap_client.fsm.client_id
    oauth2_client_secret = google_iap_client.fsm.secret
  }
}

resource "google_iap_client" "fsm" {
  display_name = "FSM Application"
  brand        = google_iap_brand.project.name
}

resource "google_iap_brand" "project" {
  support_email     = "support@example.com"
  application_title = "FSM Platform"
}
```

IAP validates JWT and adds `X-Goog-IAP-JWT-Assertion` header to requests.

**Application code to verify IAP JWT:**
```typescript
// src/middleware/iap-auth.ts
import { OAuth2Client } from 'google-auth-library';

const oAuth2Client = new OAuth2Client();

export async function verifyIAPJWT(req: Request) {
  const iapJWT = req.headers['x-goog-iap-jwt-assertion'];

  if (!iapJWT) {
    throw new Error('No IAP JWT found');
  }

  const ticket = await oAuth2Client.verifyIdToken({
    idToken: iapJWT,
    audience: `/projects/${process.env.PROJECT_NUMBER}/apps/${process.env.PROJECT_ID}`,
  });

  const payload = ticket.getPayload();

  return {
    userId: payload.sub,
    email: payload.email,
  };
}
```

---

## 6. File Storage (Cloud Storage)

### Current State
- S3 / Azure Blob
- Lifecycle policies for archival
- Pre-signed URLs for uploads

### GCP Cloud Storage Adaptation

#### 6.1 Bucket Configuration

```hcl
# terraform/modules/storage/main.tf
resource "google_storage_bucket" "media" {
  name          = "ahs-fsm-${var.environment}-media"
  location      = var.region
  storage_class = "STANDARD"

  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }

  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type          = "SetStorageClass"
      storage_class = "COLDLINE"
    }
  }

  lifecycle_rule {
    condition {
      age                = 1825  # 5 years
      with_state         = "ARCHIVED"
    }
    action {
      type = "Delete"
    }
  }

  cors {
    origin          = ["https://app.example.com"]
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

resource "google_storage_bucket" "contracts" {
  name          = "ahs-fsm-${var.environment}-contracts"
  location      = var.region
  storage_class = "STANDARD"

  # Retain for 10 years (compliance)
  lifecycle_rule {
    condition {
      age = 730  # 2 years
    }
    action {
      type          = "SetStorageClass"
      storage_class = "ARCHIVE"
    }
  }

  lifecycle_rule {
    condition {
      age = 3650  # 10 years
    }
    action {
      type = "Delete"
    }
  }
}
```

#### 6.2 Application Code

**Upload with signed URL:**
```typescript
// src/lib/storage/gcs.ts
import { Storage } from '@google-cloud/storage';

const storage = new Storage();
const bucket = storage.bucket(process.env.GCS_BUCKET!);

export async function generateUploadURL(
  filename: string,
  contentType: string,
  expiresIn: number = 15 * 60 * 1000  // 15 minutes
): Promise<string> {
  const file = bucket.file(`uploads/${Date.now()}-${filename}`);

  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + expiresIn,
    contentType,
  });

  return url;
}

export async function generateDownloadURL(
  filePath: string,
  expiresIn: number = 60 * 60 * 1000  // 1 hour
): Promise<string> {
  const file = bucket.file(filePath);

  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + expiresIn,
  });

  return url;
}

export async function uploadFile(
  filePath: string,
  content: Buffer,
  metadata?: Record<string, string>
): Promise<void> {
  const file = bucket.file(filePath);

  await file.save(content, {
    metadata: {
      contentType: metadata?.contentType || 'application/octet-stream',
      metadata,
    },
  });
}
```

**Direct upload from client:**
```typescript
// Frontend (React/Next.js)
async function uploadFile(file: File) {
  // 1. Get signed URL from backend
  const { uploadUrl } = await fetch('/api/storage/upload-url', {
    method: 'POST',
    body: JSON.stringify({ filename: file.name, contentType: file.type }),
  }).then(r => r.json());

  // 2. Upload directly to GCS
  await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
}
```

#### 6.3 CDN Integration (Cloud CDN)

```hcl
# terraform/modules/cdn/main.tf
resource "google_compute_backend_bucket" "media" {
  name        = "media-backend"
  bucket_name = google_storage_bucket.media.name
  enable_cdn  = true

  cdn_policy {
    cache_mode        = "CACHE_ALL_STATIC"
    client_ttl        = 3600
    default_ttl       = 3600
    max_ttl           = 86400
    negative_caching  = true
    serve_while_stale = 86400
  }
}

resource "google_compute_url_map" "cdn" {
  name            = "cdn-url-map"
  default_service = google_compute_backend_bucket.media.id
}

resource "google_compute_global_forwarding_rule" "cdn" {
  name       = "cdn-forwarding-rule"
  target     = google_compute_target_https_proxy.cdn.id
  port_range = "443"
}

resource "google_compute_managed_ssl_certificate" "cdn" {
  name = "cdn-cert"

  managed {
    domains = ["cdn.example.com"]
  }
}

resource "google_compute_target_https_proxy" "cdn" {
  name             = "cdn-https-proxy"
  url_map          = google_compute_url_map.cdn.id
  ssl_certificates = [google_compute_managed_ssl_certificate.cdn.id]
}
```

---

## 7. Monitoring & Logging

### Current State
- Grafana + Loki + Tempo + Prometheus
- OpenTelemetry instrumentation

### GCP Cloud Operations Suite

#### 7.1 Structured Logging for Cloud Logging

**Current Winston config - needs minor changes:**
```typescript
// src/lib/logging/winston.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()  // Already JSON - good for GCP!
  ),
  defaultMeta: {
    service: 'fsm-api',
    environment: process.env.NODE_ENV,
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

export default logger;
```

**GCP-specific logging:**
```typescript
// src/lib/logging/gcp.ts
import { Logging } from '@google-cloud/logging';
import winston from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';

const loggingWinston = new LoggingWinston({
  projectId: process.env.GCP_PROJECT_ID,
  logName: 'fsm-api',
  resource: {
    type: 'k8s_container',
    labels: {
      project_id: process.env.GCP_PROJECT_ID,
      location: process.env.GCP_REGION,
      cluster_name: process.env.GKE_CLUSTER_NAME,
      namespace_name: 'default',
      pod_name: process.env.HOSTNAME,
    },
  },
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    new winston.transports.Console(),
    loggingWinston,
  ],
});

export default logger;
```

**For GKE, simpler - just log to stdout with structured JSON:**
```typescript
logger.info('User created', {
  userId: user.id,
  email: user.email,
  correlationId: req.correlationId,
});
```

GKE automatically sends stdout to Cloud Logging.

#### 7.2 OpenTelemetry → Cloud Trace

**Instrument with OTel:**
```typescript
// src/lib/tracing/otel.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { TraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'fsm-api',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.APP_VERSION,
  }),
  traceExporter: new TraceExporter({
    projectId: process.env.GCP_PROJECT_ID,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
  ],
});

sdk.start();

process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.error('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
```

**No Grafana Tempo needed - Cloud Trace is built-in!**

#### 7.3 Custom Metrics → Cloud Monitoring

```typescript
// src/lib/metrics/gcp.ts
import { MetricServiceClient } from '@google-cloud/monitoring';

const client = new MetricServiceClient();
const projectId = process.env.GCP_PROJECT_ID!;
const projectName = client.projectPath(projectId);

export async function recordMetric(
  metricType: string,
  value: number,
  labels: Record<string, string> = {}
) {
  const dataPoint = {
    interval: {
      endTime: {
        seconds: Date.now() / 1000,
      },
    },
    value: {
      doubleValue: value,
    },
  };

  const timeSeries = {
    metric: {
      type: `custom.googleapis.com/${metricType}`,
      labels,
    },
    resource: {
      type: 'k8s_container',
      labels: {
        project_id: projectId,
        location: process.env.GCP_REGION!,
        cluster_name: process.env.GKE_CLUSTER_NAME!,
        namespace_name: 'default',
        pod_name: process.env.HOSTNAME!,
      },
    },
    points: [dataPoint],
  };

  await client.createTimeSeries({
    name: projectName,
    timeSeries: [timeSeries],
  });
}

// Usage
await recordMetric('task_created', 1, { projectId: project.id });
```

**Alternative: Use OpenTelemetry Metrics:**
```typescript
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { MetricExporter } from '@google-cloud/opentelemetry-cloud-monitoring-exporter';

const meterProvider = new MeterProvider({
  exporter: new MetricExporter(),
  interval: 60000,  // Export every 60 seconds
});

const meter = meterProvider.getMeter('fsm-api');

const taskCounter = meter.createCounter('tasks_created', {
  description: 'Number of tasks created',
});

// Increment
taskCounter.add(1, { projectId: project.id });
```

---

## 8. Local Development Impact

### Current State
- Docker Compose with Postgres, Redis, Kafka, etc.

### GCP Emulators for Local Dev

```yaml
# docker-compose.gcp.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: fsm_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  # GCP Pub/Sub Emulator
  pubsub-emulator:
    image: google/cloud-sdk:latest
    command: gcloud beta emulators pubsub start --host-port=0.0.0.0:8085
    ports:
      - "8085:8085"
    environment:
      PUBSUB_PROJECT_ID: dev-project

  # GCP Datastore/Firestore Emulator (if needed)
  firestore-emulator:
    image: google/cloud-sdk:latest
    command: gcloud beta emulators firestore start --host-port=0.0.0.0:8080
    ports:
      - "8080:8080"

  # Cloud Storage Emulator
  storage-emulator:
    image: fsouza/fake-gcs-server
    command: -scheme http -port 4443 -external-url http://localhost:4443
    ports:
      - "4443:4443"
```

**Environment for local dev:**
```bash
# .env.local
NODE_ENV=development

# Use local Postgres (not Cloud SQL)
DATABASE_URL=postgresql://dev:dev@localhost:5432/fsm_dev

# Pub/Sub emulator
PUBSUB_EMULATOR_HOST=localhost:8085
PUBSUB_PROJECT_ID=dev-project

# Storage emulator
STORAGE_EMULATOR_HOST=http://localhost:4443
GCS_BUCKET=local-bucket

# Skip GCP auth locally
GOOGLE_APPLICATION_CREDENTIALS=/path/to/fake-credentials.json
```

**Testing against real GCP (dev project):**

Use separate GCP project for dev:
```bash
# .env.dev-gcp
GCP_PROJECT_ID=ahs-fsm-dev
INSTANCE_CONNECTION_NAME=ahs-fsm-dev:us-central1:fsm-dev
GCS_BUCKET=ahs-fsm-dev-media

# Use service account key for local auth
GOOGLE_APPLICATION_CREDENTIALS=/path/to/dev-service-account-key.json
```

---

## Summary: Key Implementation Priorities

### Phase 1: Infrastructure Foundation (Week 1-2)
1. **GKE Autopilot cluster** - Start simple
2. **VPC with Cloud NAT** - Private GKE nodes
3. **Cloud SQL with proxy** - Private PostgreSQL
4. **Workload Identity** - Service account bindings

### Phase 2: Application Integration (Week 3-4)
1. **Cloud SQL Proxy sidecar** - Database connections
2. **Secret Manager integration** - External Secrets Operator
3. **Cloud Storage SDK** - File uploads/downloads
4. **Structured logging** - Winston → Cloud Logging

### Phase 3: Observability (Week 5)
1. **OpenTelemetry → Cloud Trace**
2. **Custom metrics → Cloud Monitoring**
3. **Error Reporting integration**

### Phase 4: Advanced Features (Week 6+)
1. **Cloud CDN for media**
2. **Identity Platform + IAP** (if needed)
3. **Pub/Sub** (if outbox pattern insufficient)

---

## Cost Estimation

| Component | AWS/Azure (Current) | GCP | Savings |
|-----------|---------------------|-----|---------|
| Kubernetes | EKS $72/mo + EC2 | GKE Autopilot $100/mo | -$28/mo |
| Database | RDS $500/mo | Cloud SQL $400/mo | +$100/mo |
| ~~Kafka~~ | ~~MSK $1000/mo~~ | ~~Removed~~ | +$1000/mo |
| Redis | ElastiCache $150/mo | Memorystore $120/mo | +$30/mo |
| Storage | S3 $50/mo | GCS $40/mo | +$10/mo |
| Monitoring | Grafana Cloud $200/mo | Cloud Operations $0-50/mo | +$150/mo |
| **Total** | ~$2000/mo | ~$800/mo | **+$1200/mo savings** |

**Key savings from simplification + GCP:**
- Removing Kafka: $1000/mo
- Cloud Operations vs Grafana: $150/mo
- Managed services efficiency: $50/mo

---

## Next Steps

1. **Review this doc with team** - Validate assumptions
2. **Create GCP dev project** - Test infra code
3. **Prototype Cloud SQL Proxy** - Validate connection pattern
4. **Test Outbox pattern** - Confirm no Pub/Sub needed
5. **Implement Workload Identity** - Auth pattern
6. **Migrate one service** - Learn before full migration

**Questions to Answer:**
- GKE Autopilot or Standard? (Cost vs control)
- Pub/Sub or Outbox pattern? (Event volume?)
- Multi-region from day 1? (Compliance?)
- Identity Platform needed or just Workload Identity? (External users?)
