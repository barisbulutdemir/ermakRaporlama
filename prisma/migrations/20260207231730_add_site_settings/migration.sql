-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteName" TEXT NOT NULL DEFAULT 'ERMAK Rapor',
    "description" TEXT NOT NULL DEFAULT 'Servis Raporlama Sistemi',
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "aboutText" TEXT NOT NULL DEFAULT '',
    "updatedAt" DATETIME NOT NULL
);
