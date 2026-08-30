-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN "externalId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "MenuItem_organizationId_externalId_key" ON "MenuItem"("organizationId", "externalId");
