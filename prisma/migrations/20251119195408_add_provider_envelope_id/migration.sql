-- AlterTable
ALTER TABLE "contracts" ADD COLUMN     "provider_envelope_id" TEXT,
ADD COLUMN     "signed_document_checksum" TEXT,
ADD COLUMN     "signed_document_url" TEXT;
