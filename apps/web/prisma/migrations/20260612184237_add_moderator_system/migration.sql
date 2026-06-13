-- AlterTable
ALTER TABLE "certifications" ADD COLUMN     "rejection_reason" TEXT,
ADD COLUMN     "review_status" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "reviewed_at" TIMESTAMP(3),
ADD COLUMN     "reviewed_by" TEXT;

-- CreateTable
CREATE TABLE "moderator_actions" (
    "id" TEXT NOT NULL,
    "moderator_alias" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "reason" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderator_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "moderator_actions_moderator_alias_idx" ON "moderator_actions"("moderator_alias");

-- CreateIndex
CREATE INDEX "moderator_actions_target_type_target_id_idx" ON "moderator_actions"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "moderator_actions_action_type_idx" ON "moderator_actions"("action_type");

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("alias") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderator_actions" ADD CONSTRAINT "moderator_actions_moderator_alias_fkey" FOREIGN KEY ("moderator_alias") REFERENCES "users"("alias") ON DELETE RESTRICT ON UPDATE CASCADE;
