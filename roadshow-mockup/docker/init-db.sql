-- Initialize Yellow Grid Database (Demo Mockup)
-- This script runs on first database creation

-- Set default encoding and locale
SET client_encoding = 'UTF8';

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- For UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gist";     -- For advanced indexing

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE yellowgrid_dev TO fsm_user;

-- Log initialization
DO $$
BEGIN
  RAISE NOTICE 'Yellow Grid Database initialized successfully';
  RAISE NOTICE 'Database: yellowgrid_dev (DEMO/MOCKUP)';
  RAISE NOTICE 'User: fsm_user';
  RAISE NOTICE 'Extensions: uuid-ossp, pg_trgm, btree_gist';
END $$;
