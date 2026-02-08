-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteName" TEXT NOT NULL DEFAULT 'ERMAK Rapor',
    "description" TEXT NOT NULL DEFAULT 'Servis Raporlama Sistemi',
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "aboutText" TEXT NOT NULL DEFAULT '',
    "enableThemeSwitch" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SiteSettings" ("aboutText", "contactEmail", "contactPhone", "description", "id", "siteName", "updatedAt") SELECT "aboutText", "contactEmail", "contactPhone", "description", "id", "siteName", "updatedAt" FROM "SiteSettings";
DROP TABLE "SiteSettings";
ALTER TABLE "new_SiteSettings" RENAME TO "SiteSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
