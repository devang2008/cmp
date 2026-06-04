-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "verification_token" TEXT,
    "verification_expires" TIMESTAMP(3),
    "onboarding_complete" BOOLEAN NOT NULL DEFAULT false,
    "trust_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rating_as_vendor" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rating_as_buyer" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_vendor_reviews" INTEGER NOT NULL DEFAULT 0,
    "total_buyer_reviews" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alias_directory" (
    "alias" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "trust_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cert_badges" TEXT[],
    "skills" TEXT[],
    "completed_deals" INTEGER NOT NULL DEFAULT 0,
    "response_rate" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "rating_as_vendor" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rating_as_buyer" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_vendor_reviews" INTEGER NOT NULL DEFAULT 0,
    "total_buyer_reviews" INTEGER NOT NULL DEFAULT 0,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alias_directory_pkey" PRIMARY KEY ("alias")
);

-- CreateTable
CREATE TABLE "deals" (
    "id" TEXT NOT NULL,
    "buyer_alias" TEXT NOT NULL,
    "vendor_alias" TEXT,
    "requirement_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'POSTED',
    "agreed_price" DOUBLE PRECISION,
    "original_price" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "price_updated_at" TIMESTAMP(3),
    "buyer_consented_reveal" BOOLEAN NOT NULL DEFAULT false,
    "vendor_consented_reveal" BOOLEAN NOT NULL DEFAULT false,
    "identity_revealed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "closed_at" TIMESTAMP(3),

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deal_events" (
    "id" TEXT NOT NULL,
    "deal_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "from_status" TEXT,
    "to_status" TEXT,
    "actor_alias" TEXT NOT NULL,
    "note" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deal_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "deal_id" TEXT NOT NULL,
    "sender_alias" TEXT NOT NULL,
    "encrypted_content" TEXT NOT NULL,
    "message_type" TEXT NOT NULL DEFAULT 'text',
    "file_url" TEXT,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_keys" (
    "deal_id" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_keys_pkey" PRIMARY KEY ("deal_id","alias")
);

-- CreateTable
CREATE TABLE "certifications" (
    "id" TEXT NOT NULL,
    "vendor_alias" TEXT NOT NULL,
    "cert_name" TEXT NOT NULL,
    "cert_type" TEXT NOT NULL,
    "file_url" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verification_score" INTEGER NOT NULL DEFAULT 0,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified_at" TIMESTAMP(3),

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trust_events" (
    "id" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "score_delta" DOUBLE PRECISION NOT NULL,
    "deal_id" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trust_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "recipient_alias" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "ref_id" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "deal_id" TEXT NOT NULL,
    "reviewer_alias" TEXT NOT NULL,
    "reviewee_alias" TEXT NOT NULL,
    "reviewer_role" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "actor_alias" TEXT,
    "target_alias" TEXT,
    "deal_id" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "ip_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_alias_key" ON "users"("alias");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_deal_id_reviewer_role_key" ON "reviews"("deal_id", "reviewer_role");

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_buyer_alias_fkey" FOREIGN KEY ("buyer_alias") REFERENCES "users"("alias") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_vendor_alias_fkey" FOREIGN KEY ("vendor_alias") REFERENCES "users"("alias") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_events" ADD CONSTRAINT "deal_events_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_alias_fkey" FOREIGN KEY ("sender_alias") REFERENCES "users"("alias") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_keys" ADD CONSTRAINT "chat_keys_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_keys" ADD CONSTRAINT "chat_keys_alias_fkey" FOREIGN KEY ("alias") REFERENCES "users"("alias") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_vendor_alias_fkey" FOREIGN KEY ("vendor_alias") REFERENCES "users"("alias") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trust_events" ADD CONSTRAINT "trust_events_alias_fkey" FOREIGN KEY ("alias") REFERENCES "users"("alias") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_alias_fkey" FOREIGN KEY ("recipient_alias") REFERENCES "users"("alias") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_alias_fkey" FOREIGN KEY ("reviewer_alias") REFERENCES "users"("alias") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewee_alias_fkey" FOREIGN KEY ("reviewee_alias") REFERENCES "users"("alias") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_alias_fkey" FOREIGN KEY ("actor_alias") REFERENCES "users"("alias") ON DELETE SET NULL ON UPDATE CASCADE;
