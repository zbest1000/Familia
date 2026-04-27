-- Per-user Row-Level Security.
--
-- Defense in depth on top of the application-layer userId scoping. Every
-- query the API issues for a per-user table is filtered against the
-- session GUC `app.current_user_id`. If that GUC is unset (e.g. a
-- background job that forgot to set it) the policy denies the row,
-- failing safe.
--
-- The application sets the GUC inside each authenticated request via the
-- PrismaService middleware (see apps/api/src/common/prisma.service.ts)
-- driven by AsyncLocalStorage from the UserContextInterceptor.
--
-- IMPORTANT: prisma migrate deploy runs as the migration role, which
-- usually has BYPASSRLS implicitly (it's the DB owner). RLS only kicks in
-- for the API runtime role. If your runtime role is the same as the
-- migration role, RLS is effectively disabled — fix that by creating a
-- least-privilege runtime role and granting it only what the API needs.
--
-- This migration is idempotent: re-running it (after a partial failure
-- or a manual edit) drops and recreates each policy from scratch.
--
-- Tables covered: per-user data with a single owner column.
-- Tables NOT covered (need bespoke policies — Sprint 2):
--   - Alert (creator + recipients fan-out)
--   - AlertRecipient (recipient is one of N)
--   - ConsentGrant (granter + grantee both have read rights)
--   - AuditEntry (actor + target both have read rights)
--   - FamilyInvite (inviter + invitee email)

-- ─── helper schema + function ─────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS app;

-- Returns the GUC as text (Prisma stores ids as TEXT, not UUID, so we
-- compare against text). Returns NULL when unset → policies fail-closed.
CREATE OR REPLACE FUNCTION app.current_user_id() RETURNS text
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  v text;
BEGIN
  v := current_setting('app.current_user_id', true);
  IF v IS NULL OR v = '' THEN
    RETURN NULL;
  END IF;
  RETURN v;
END;
$$;

-- Helper: enable RLS + (re)create a single self-scoped policy.
-- We use DO blocks for the DROP POLICY IF EXISTS so the migration is
-- safe to re-run after a partial failure.
DO $$
BEGIN
  -- User
  ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS user_self ON "User";
  CREATE POLICY user_self ON "User" USING (id = app.current_user_id());

  -- Session
  ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS session_self ON "Session";
  CREATE POLICY session_self ON "Session" USING ("userId" = app.current_user_id());

  -- Profile
  ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS profile_owner ON "Profile";
  CREATE POLICY profile_owner ON "Profile" USING ("ownerUserId" = app.current_user_id());

  -- ProfileCoManager
  ALTER TABLE "ProfileCoManager" ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS profile_comanager_self ON "ProfileCoManager";
  CREATE POLICY profile_comanager_self ON "ProfileCoManager" USING ("userId" = app.current_user_id());

  -- FamilyRelationship
  ALTER TABLE "FamilyRelationship" ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS family_relationship_self ON "FamilyRelationship";
  CREATE POLICY family_relationship_self ON "FamilyRelationship" USING ("userId" = app.current_user_id());

  -- Health records (one owner per row)
  ALTER TABLE "Condition" ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS condition_self ON "Condition";
  CREATE POLICY condition_self ON "Condition" USING ("userId" = app.current_user_id());

  ALTER TABLE "Medication" ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS medication_self ON "Medication";
  CREATE POLICY medication_self ON "Medication" USING ("userId" = app.current_user_id());

  ALTER TABLE "Allergy" ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS allergy_self ON "Allergy";
  CREATE POLICY allergy_self ON "Allergy" USING ("userId" = app.current_user_id());

  ALTER TABLE "Immunization" ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS immunization_self ON "Immunization";
  CREATE POLICY immunization_self ON "Immunization" USING ("userId" = app.current_user_id());

  ALTER TABLE "Encounter" ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS encounter_self ON "Encounter";
  CREATE POLICY encounter_self ON "Encounter" USING ("userId" = app.current_user_id());

  -- Check-ins
  ALTER TABLE "CheckIn" ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS checkin_self ON "CheckIn";
  CREATE POLICY checkin_self ON "CheckIn" USING ("userId" = app.current_user_id());

  -- Wearable samples
  ALTER TABLE "WearableSample" ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS wearable_sample_self ON "WearableSample";
  CREATE POLICY wearable_sample_self ON "WearableSample" USING ("userId" = app.current_user_id());

  -- Vault documents
  ALTER TABLE "VaultDocument" ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS vault_document_self ON "VaultDocument";
  CREATE POLICY vault_document_self ON "VaultDocument" USING ("userId" = app.current_user_id());

  -- StagedExtraction has no userId column directly — link via documentId
  ALTER TABLE "StagedExtraction" ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS staged_extraction_via_doc ON "StagedExtraction";
  CREATE POLICY staged_extraction_via_doc ON "StagedExtraction"
    USING (
      EXISTS (
        SELECT 1 FROM "VaultDocument" d
        WHERE d.id = "StagedExtraction"."documentId"
          AND d."userId" = app.current_user_id()
      )
    );
END $$;
