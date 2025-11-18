-- AlterTable
-- Add latitude and longitude columns to postal_codes for geographic distance calculations
ALTER TABLE "postal_codes"
  ADD COLUMN "latitude" DECIMAL(10,8),
  ADD COLUMN "longitude" DECIMAL(11,8);

-- Add comment for documentation
COMMENT ON COLUMN "postal_codes"."latitude" IS 'Geographic latitude coordinate for distance calculations (e.g., 40.41678901)';
COMMENT ON COLUMN "postal_codes"."longitude" IS 'Geographic longitude coordinate for distance calculations (e.g., -3.70378876)';
