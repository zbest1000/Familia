-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "dateOfBirth" DATE,
    "sexAtBirth" TEXT,
    "genderIdentity" TEXT,
    "bloodType" TEXT,
    "preferredUnits" TEXT NOT NULL DEFAULT 'imperial',
    "primaryLanguage" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT,
    "privacyLevel" TEXT NOT NULL DEFAULT 'standard',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "ownerUserId" TEXT,
    "displayName" TEXT NOT NULL,
    "dateOfBirth" DATE,
    "deceasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileCoManager" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileCoManager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyRelationship" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "relatedUserId" TEXT,
    "relatedProfileGhostId" TEXT,
    "type" TEXT NOT NULL,
    "biologicalLink" BOOLEAN NOT NULL DEFAULT false,
    "biologicalConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "doNotAlert" BOOLEAN NOT NULL DEFAULT false,
    "deceased" BOOLEAN NOT NULL DEFAULT false,
    "deceasedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyInvite" (
    "id" TEXT NOT NULL,
    "senderUserId" TEXT NOT NULL,
    "recipientUserId" TEXT,
    "proposedRelationship" TEXT NOT NULL,
    "proposedBiologicalLink" BOOLEAN NOT NULL,
    "proposedPreset" TEXT NOT NULL,
    "proposedReciprocalPreset" TEXT,
    "state" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "ttlSeconds" INTEGER NOT NULL DEFAULT 600,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "FamilyInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentGrant" (
    "id" TEXT NOT NULL,
    "grantorUserId" TEXT NOT NULL,
    "recipientUserId" TEXT NOT NULL,
    "preset" TEXT NOT NULL,
    "scopes" TEXT[],
    "purposes" TEXT[],
    "disclosureModeDefault" TEXT NOT NULL DEFAULT 'identified',
    "allowReDisclosure" BOOLEAN NOT NULL DEFAULT false,
    "consentTermsVersion" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "state" TEXT NOT NULL,
    "supersededByGrantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsentGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "senderUserId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "personalNote" TEXT,
    "disclosureMode" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "recalledAt" TIMESTAMP(3),

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertRecipient" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "recipientUserId" TEXT NOT NULL,
    "relationshipClass" TEXT NOT NULL,
    "messageVariantKey" TEXT NOT NULL,
    "renderedMessage" TEXT NOT NULL,
    "renderedMessageHash" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "acknowledgedAt" TIMESTAMP(3),

    CONSTRAINT "AlertRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Condition" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "codeSystem" TEXT,
    "code" TEXT,
    "status" TEXT NOT NULL,
    "onsetDate" TIMESTAMP(3),
    "resolvedDate" TIMESTAMP(3),
    "severity" TEXT,
    "source" TEXT NOT NULL,
    "sensitivity" TEXT NOT NULL DEFAULT 'standard',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Condition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "genericName" TEXT,
    "doseValue" DOUBLE PRECISION,
    "doseUnit" TEXT,
    "doseText" TEXT,
    "route" TEXT,
    "frequencyText" TEXT,
    "status" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "stopDate" TIMESTAMP(3),
    "prescriber" TEXT,
    "pharmacy" TEXT,
    "reason" TEXT,
    "source" TEXT NOT NULL,
    "sensitivity" TEXT NOT NULL DEFAULT 'standard',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Allergy" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "allergen" TEXT NOT NULL,
    "allergyType" TEXT NOT NULL,
    "reaction" TEXT,
    "severity" TEXT NOT NULL,
    "firstObserved" TIMESTAMP(3),
    "source" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Allergy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Immunization" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "administeredAt" TIMESTAMP(3),
    "lotNumber" TEXT,
    "notes" TEXT,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Immunization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Encounter" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "providerName" TEXT,
    "facilityName" TEXT,
    "location" TEXT,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "reason" TEXT,
    "notes" TEXT,
    "source" TEXT NOT NULL,
    "sensitivity" TEXT NOT NULL DEFAULT 'standard',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Encounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckIn" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "cadence" TEXT NOT NULL,
    "scoredAt" TIMESTAMP(3) NOT NULL,
    "physical" INTEGER,
    "mental" INTEGER,
    "energy" INTEGER,
    "pain" INTEGER,
    "symptoms" TEXT[],
    "freeText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VaultDocument" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "contentHash" TEXT NOT NULL,
    "pageCount" INTEGER,
    "capturedAt" TIMESTAMP(3),
    "attachedEncounterId" TEXT,
    "source" TEXT NOT NULL,
    "sensitivity" TEXT NOT NULL DEFAULT 'standard',
    "extractionState" TEXT NOT NULL DEFAULT 'uploaded',
    "extractionConfidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VaultDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StagedExtraction" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "overallConfidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StagedExtraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEntry" (
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "targetUserId" TEXT NOT NULL,
    "fromState" TEXT,
    "toState" TEXT,
    "metadata" JSONB NOT NULL,
    "policyVersion" TEXT NOT NULL,
    "requestSource" TEXT NOT NULL,
    "clientIp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEntry_pkey" PRIMARY KEY ("eventId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");

-- CreateIndex
CREATE INDEX "Profile_ownerUserId_idx" ON "Profile"("ownerUserId");

-- CreateIndex
CREATE INDEX "ProfileCoManager_userId_idx" ON "ProfileCoManager"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileCoManager_profileId_userId_key" ON "ProfileCoManager"("profileId", "userId");

-- CreateIndex
CREATE INDEX "FamilyRelationship_userId_idx" ON "FamilyRelationship"("userId");

-- CreateIndex
CREATE INDEX "FamilyRelationship_relatedUserId_idx" ON "FamilyRelationship"("relatedUserId");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyRelationship_userId_relatedUserId_type_key" ON "FamilyRelationship"("userId", "relatedUserId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyInvite_tokenHash_key" ON "FamilyInvite"("tokenHash");

-- CreateIndex
CREATE INDEX "FamilyInvite_senderUserId_idx" ON "FamilyInvite"("senderUserId");

-- CreateIndex
CREATE INDEX "FamilyInvite_state_expiresAt_idx" ON "FamilyInvite"("state", "expiresAt");

-- CreateIndex
CREATE INDEX "ConsentGrant_grantorUserId_recipientUserId_state_idx" ON "ConsentGrant"("grantorUserId", "recipientUserId", "state");

-- CreateIndex
CREATE INDEX "ConsentGrant_recipientUserId_state_idx" ON "ConsentGrant"("recipientUserId", "state");

-- CreateIndex
CREATE INDEX "Alert_senderUserId_idx" ON "Alert"("senderUserId");

-- CreateIndex
CREATE INDEX "Alert_state_idx" ON "Alert"("state");

-- CreateIndex
CREATE INDEX "AlertRecipient_alertId_idx" ON "AlertRecipient"("alertId");

-- CreateIndex
CREATE INDEX "AlertRecipient_recipientUserId_state_idx" ON "AlertRecipient"("recipientUserId", "state");

-- CreateIndex
CREATE INDEX "Condition_userId_idx" ON "Condition"("userId");

-- CreateIndex
CREATE INDEX "Condition_profileId_idx" ON "Condition"("profileId");

-- CreateIndex
CREATE INDEX "Medication_userId_idx" ON "Medication"("userId");

-- CreateIndex
CREATE INDEX "Medication_profileId_idx" ON "Medication"("profileId");

-- CreateIndex
CREATE INDEX "Allergy_userId_idx" ON "Allergy"("userId");

-- CreateIndex
CREATE INDEX "Allergy_profileId_idx" ON "Allergy"("profileId");

-- CreateIndex
CREATE INDEX "Immunization_userId_idx" ON "Immunization"("userId");

-- CreateIndex
CREATE INDEX "Immunization_profileId_idx" ON "Immunization"("profileId");

-- CreateIndex
CREATE INDEX "Encounter_userId_idx" ON "Encounter"("userId");

-- CreateIndex
CREATE INDEX "Encounter_profileId_idx" ON "Encounter"("profileId");

-- CreateIndex
CREATE INDEX "CheckIn_userId_scoredAt_idx" ON "CheckIn"("userId", "scoredAt");

-- CreateIndex
CREATE INDEX "VaultDocument_userId_idx" ON "VaultDocument"("userId");

-- CreateIndex
CREATE INDEX "VaultDocument_profileId_idx" ON "VaultDocument"("profileId");

-- CreateIndex
CREATE INDEX "VaultDocument_extractionState_idx" ON "VaultDocument"("extractionState");

-- CreateIndex
CREATE UNIQUE INDEX "StagedExtraction_documentId_key" ON "StagedExtraction"("documentId");

-- CreateIndex
CREATE INDEX "AuditEntry_targetUserId_createdAt_idx" ON "AuditEntry"("targetUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEntry_actorUserId_createdAt_idx" ON "AuditEntry"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEntry_eventType_createdAt_idx" ON "AuditEntry"("eventType", "createdAt");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileCoManager" ADD CONSTRAINT "ProfileCoManager_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileCoManager" ADD CONSTRAINT "ProfileCoManager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyRelationship" ADD CONSTRAINT "FamilyRelationship_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyRelationship" ADD CONSTRAINT "FamilyRelationship_relatedUserId_fkey" FOREIGN KEY ("relatedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyInvite" ADD CONSTRAINT "FamilyInvite_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyInvite" ADD CONSTRAINT "FamilyInvite_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentGrant" ADD CONSTRAINT "ConsentGrant_grantorUserId_fkey" FOREIGN KEY ("grantorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentGrant" ADD CONSTRAINT "ConsentGrant_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertRecipient" ADD CONSTRAINT "AlertRecipient_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertRecipient" ADD CONSTRAINT "AlertRecipient_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condition" ADD CONSTRAINT "Condition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condition" ADD CONSTRAINT "Condition_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allergy" ADD CONSTRAINT "Allergy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allergy" ADD CONSTRAINT "Allergy_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Immunization" ADD CONSTRAINT "Immunization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Immunization" ADD CONSTRAINT "Immunization_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaultDocument" ADD CONSTRAINT "VaultDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaultDocument" ADD CONSTRAINT "VaultDocument_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaultDocument" ADD CONSTRAINT "VaultDocument_attachedEncounterId_fkey" FOREIGN KEY ("attachedEncounterId") REFERENCES "Encounter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StagedExtraction" ADD CONSTRAINT "StagedExtraction_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "VaultDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEntry" ADD CONSTRAINT "AuditEntry_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEntry" ADD CONSTRAINT "AuditEntry_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
