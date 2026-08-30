CREATE TABLE "MenuSection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "MenuSection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE "Category" ADD COLUMN "menuSectionId" TEXT REFERENCES "MenuSection" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE UNIQUE INDEX "MenuSection_organizationId_name_key" ON "MenuSection"("organizationId", "name");
CREATE INDEX "MenuSection_organizationId_idx" ON "MenuSection"("organizationId");
CREATE INDEX "Category_menuSectionId_idx" ON "Category"("menuSectionId");
