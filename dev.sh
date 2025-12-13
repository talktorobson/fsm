#!/bin/bash
# Quick development commands for Yellow Grid
# Usage: ./dev.sh [command]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() { echo -e "${GREEN}[DEV]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# =============================================================================
# Commands
# =============================================================================

cmd_start() {
    log "Starting local development environment..."
    docker compose -f docker-compose.dev.yml up -d postgres redis
    log "Waiting for services..."
    sleep 3
    log "Running database migrations..."
    npx prisma migrate dev --skip-generate 2>/dev/null || npx prisma migrate deploy
    log "Starting API in watch mode..."
    npm run start:dev
}

cmd_stop() {
    log "Stopping local development environment..."
    docker compose -f docker-compose.dev.yml down
}

cmd_db() {
    case "${2:-}" in
        reset)
            log "Resetting database..."
            docker compose -f docker-compose.dev.yml down -v postgres
            docker compose -f docker-compose.dev.yml up -d postgres
            sleep 3
            npx prisma migrate dev
            log "Database reset complete!"
            ;;
        seed)
            log "Seeding database..."
            npx ts-node prisma/seed.ts
            ;;
        studio)
            log "Opening Prisma Studio..."
            npx prisma studio
            ;;
        *)
            log "Database commands: reset | seed | studio"
            ;;
    esac
}

cmd_test() {
    case "${2:-}" in
        unit)
            npm test -- --coverage --runInBand
            ;;
        e2e)
            npm run test:e2e
            ;;
        watch)
            npm run test:watch
            ;;
        *)
            npm test -- --runInBand
            ;;
    esac
}

cmd_lint() {
    log "Running lint and type check..."
    npm run lint
    npm run typecheck
}

cmd_deploy() {
    log "Deploying to staging..."
    git push origin main
    log "Deployment triggered! Monitor at: https://github.com/talktorobson/yellow-grid/actions"
}

cmd_logs() {
    local service="${2:-api}"
    log "Fetching logs for $service..."
    ssh -i deploy/vps_key root@135.181.96.93 \
        "cd /root/yellow-grid/deploy && docker compose logs --tail 100 -f $service"
}

cmd_ssh() {
    log "Connecting to staging VPS..."
    ssh -i deploy/vps_key root@135.181.96.93
}

cmd_status() {
    log "Staging VPS Status:"
    echo ""
    ssh -i deploy/vps_key root@135.181.96.93 \
        "cd /root/yellow-grid/deploy && docker compose ps --format 'table {{.Name}}\t{{.Status}}'"
    echo ""
    log "API Health:"
    curl -sf https://goexec.de/api/v1/health | jq -r '.data.status // "offline"'
}

cmd_reset_demo() {
    log "Resetting demo data on staging..."
    ssh -i deploy/vps_key root@135.181.96.93 << 'EOF'
        cd /root/yellow-grid/deploy
        docker compose exec -T api npx ts-node prisma/seed.ts
        echo "✅ Demo data reset complete!"
EOF
}

cmd_web() {
    log "Starting web app in dev mode..."
    cd web && npm run dev
}

cmd_help() {
    echo ""
    echo -e "${BLUE}Yellow Grid Development Commands${NC}"
    echo ""
    echo "Usage: ./dev.sh [command]"
    echo ""
    echo "Local Development:"
    echo "  start       Start local dev (postgres, redis, API)"
    echo "  stop        Stop local dev environment"
    echo "  web         Start web app in dev mode"
    echo ""
    echo "Database:"
    echo "  db reset    Reset local database"
    echo "  db seed     Seed local database"
    echo "  db studio   Open Prisma Studio"
    echo ""
    echo "Testing:"
    echo "  test        Run unit tests"
    echo "  test unit   Run unit tests with coverage"
    echo "  test e2e    Run E2E tests"
    echo "  test watch  Run tests in watch mode"
    echo "  lint        Run lint and type check"
    echo ""
    echo "Staging VPS:"
    echo "  deploy      Push to main (triggers CI/CD)"
    echo "  status      Check staging VPS status"
    echo "  logs [svc]  Tail logs (api, frontend, postgres)"
    echo "  ssh         SSH into staging VPS"
    echo "  reset-demo  Reset demo data on staging"
    echo ""
}

# =============================================================================
# Main
# =============================================================================

case "${1:-help}" in
    start)      cmd_start ;;
    stop)       cmd_stop ;;
    db)         cmd_db "$@" ;;
    test)       cmd_test "$@" ;;
    lint)       cmd_lint ;;
    deploy)     cmd_deploy ;;
    logs)       cmd_logs "$@" ;;
    ssh)        cmd_ssh ;;
    status)     cmd_status ;;
    reset-demo) cmd_reset_demo ;;
    web)        cmd_web ;;
    help|*)     cmd_help ;;
esac
