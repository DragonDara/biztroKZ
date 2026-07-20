-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Location" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'Main',
    "description" TEXT,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "twitter" TEXT,
    "tiktok" TEXT,
    "whatsapp" TEXT,
    "website" TEXT,
    "serviceDelivery" BOOLEAN NOT NULL DEFAULT false,
    "serviceTakeout" BOOLEAN NOT NULL DEFAULT false,
    "serviceDineIn" BOOLEAN NOT NULL DEFAULT false,
    "deliveryFee" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'KZT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "Location_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Location" ("address", "createdAt", "currency", "deliveryFee", "description", "facebook", "id", "instagram", "name", "organizationId", "phone", "serviceDelivery", "serviceDineIn", "serviceTakeout", "tiktok", "twitter", "updatedAt", "website", "whatsapp") SELECT "address", "createdAt", "currency", "deliveryFee", "description", "facebook", "id", "instagram", "name", "organizationId", "phone", "serviceDelivery", "serviceDineIn", "serviceTakeout", "tiktok", "twitter", "updatedAt", "website", "whatsapp" FROM "Location";
DROP TABLE "Location";
ALTER TABLE "new_Location" RENAME TO "Location";
CREATE TABLE "new_MenuItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "imageAssetId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "categoryId" TEXT,
    "organizationId" TEXT NOT NULL,
    "allergens" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'KZT',
    CONSTRAINT "MenuItem_imageAssetId_fkey" FOREIGN KEY ("imageAssetId") REFERENCES "MediaAsset" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MenuItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_MenuItem" ("allergens", "categoryId", "createdAt", "currency", "description", "featured", "id", "image", "imageAssetId", "name", "organizationId", "status", "updatedAt") SELECT "allergens", "categoryId", "createdAt", "currency", "description", "featured", "id", "image", "imageAssetId", "name", "organizationId", "status", "updatedAt" FROM "MenuItem";
DROP TABLE "MenuItem";
ALTER TABLE "new_MenuItem" RENAME TO "MenuItem";
CREATE UNIQUE INDEX "MenuItem_organizationId_name_key" ON "MenuItem"("organizationId", "name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Verification_identifier_idx" ON "Verification"("identifier");
