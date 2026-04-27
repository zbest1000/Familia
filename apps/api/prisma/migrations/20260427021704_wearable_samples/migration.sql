-- CreateTable
CREATE TABLE "WearableSample" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WearableSample_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WearableSample_userId_metric_capturedAt_idx" ON "WearableSample"("userId", "metric", "capturedAt");

-- CreateIndex
CREATE INDEX "WearableSample_userId_capturedAt_idx" ON "WearableSample"("userId", "capturedAt");

-- AddForeignKey
ALTER TABLE "WearableSample" ADD CONSTRAINT "WearableSample_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
