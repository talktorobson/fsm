-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN     "is_revoked" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
