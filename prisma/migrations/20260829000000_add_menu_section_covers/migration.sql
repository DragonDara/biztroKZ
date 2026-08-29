ALTER TABLE "MenuSection" ADD COLUMN "coverImage" TEXT;
ALTER TABLE "MenuSection" ADD COLUMN "coverImageAssetId" TEXT REFERENCES "MediaAsset" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "MenuSection_coverImageAssetId_idx" ON "MenuSection"("coverImageAssetId");
