# AHS Field Service Management Platform - Roadshow Mockup

## Overview

This is a demo/mockup implementation of the AHS FSM Platform designed for roadshow presentations to investors and potential clients. It showcases the key value propositions and core workflows of the platform.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm 10+
- Docker and Docker Compose
- PostgreSQL (via Docker)

### Setup

```bash
# Install dependencies
npm install

# Start infrastructure (PostgreSQL, Redis)
npm run docker:up

# Run database migrations
npm run db:migrate

# Seed demo data
npm run seed

# Start all services
npm run dev:backend  # Terminal 1
npm run dev:web      # Terminal 2
npm run dev:mobile   # Terminal 3 (optional)
```

### Access

- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api
- **Web App (Control Tower)**: http://localhost:5173
- **Mobile App**: Expo Go app (scan QR code)

## 📁 Project Structure

```
ahs-fsm-platform/
├── apps/
│   ├── backend/        # NestJS API server
│   ├── web/            # React Control Tower web app
│   └── mobile/         # React Native mobile app
├── packages/
│   └── shared/         # Shared types and utilities
├── docker/             # Docker Compose configuration
├── product-docs/       # Comprehensive engineering documentation
└── scripts/            # Build and deployment scripts
```

## 🎯 Demo Scenarios

### Scenario 1: Happy Path Installation (France)
- Customer: Jean Dupont, Paris
- Service: Kitchen installation (P2)
- Provider: InstallPro France
- Flow: Auto-assignment → Acceptance → Completion

### Scenario 2: Technical Visit Flow (Spain)
- Customer: Maria Garcia, Madrid
- Service: Bathroom renovation (requires TV)
- Shows TV dependency management

### Scenario 3: Assignment Transparency (Italy)
- Urgent P1 repair
- Demonstrates funnel filtering and scoring

## 📚 Documentation

- **Product Documentation**: `/product-docs/README.md`
- **Architecture Overview**: `/product-docs/architecture/01-architecture-overview.md`
- **Implementation Guide**: `/product-docs/IMPLEMENTATION_GUIDE.md`
- **AI Assistant Guide**: `/CLAUDE.md`
- **Simplification Recommendations**: `/ARCHITECTURE_SIMPLIFICATION.md`

## 🛠️ Development

### Backend (NestJS)
```bash
cd apps/backend
npm run dev          # Start in watch mode
npm run test         # Run tests
npm run db:studio    # Open Prisma Studio
```

### Web App (React)
```bash
cd apps/web
npm run dev          # Start dev server
npm run build        # Production build
```

### Mobile App (React Native)
```bash
cd apps/mobile
npm run dev          # Start Expo
npm run android      # Run on Android
npm run ios          # Run on iOS (macOS only)
```

## 🎬 Running the Demo

1. **Prepare**: Ensure all services are running and seeded with demo data
2. **Open Control Tower**: Navigate to http://localhost:5173
3. **Login**: Use demo credentials (admin@ahs.com / demo123)
4. **Follow Script**: See `/docs/demo-script.md` for presentation flow

## 📊 Key Features Demonstrated

- ✅ Multi-country, multi-tenant operations
- ✅ Intelligent assignment with transparency
- ✅ Technical Visit dependency management
- ✅ Real-time operations dashboard
- ✅ Mobile field technician app
- ✅ Contract lifecycle management
- ✅ Analytics and reporting

## 🔧 Technology Stack

### Backend
- Node.js 20 LTS
- NestJS 10
- TypeScript 5
- Prisma ORM
- PostgreSQL 15

### Frontend
- React 18
- Vite
- TailwindCSS
- Ant Design

### Mobile
- React Native
- Expo
- React Navigation

## 🐳 Docker Services

- **PostgreSQL**: Main database (port 5432)
- **Redis**: Caching (port 6379)
- **Adminer**: Database UI (port 8080)

## 🧪 Testing

```bash
# Run all tests
npm run test

# Backend tests only
npm run test --workspace=apps/backend

# Web tests only
npm run test --workspace=apps/web
```

## 📝 License

UNLICENSED - Internal demonstration only

## 👥 Team

AHS Platform Team - Built for roadshow demonstration purposes

---

**For detailed documentation, see `/product-docs/` directory**
