-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ServiceReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "siteName" TEXT NOT NULL,
    "siteColor" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "excludedDates" TEXT,
    "holidays" TEXT,
    "summaryNotes" TEXT,
    "workerSignature" TEXT,
    "totalWorkingDays" INTEGER NOT NULL DEFAULT 0,
    "extraTime50" REAL NOT NULL DEFAULT 0,
    "extraTime100" REAL NOT NULL DEFAULT 0,
    "holidayTime100" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ServiceReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ServiceReport" ("createdAt", "endDate", "excludedDates", "extraTime100", "extraTime50", "holidayTime100", "holidays", "id", "siteColor", "siteName", "startDate", "summaryNotes", "totalWorkingDays", "updatedAt", "userId", "workerSignature") SELECT "createdAt", "endDate", "excludedDates", "extraTime100", "extraTime50", "holidayTime100", "holidays", "id", "siteColor", "siteName", "startDate", "summaryNotes", "totalWorkingDays", "updatedAt", "userId", "workerSignature" FROM "ServiceReport";
DROP TABLE "ServiceReport";
ALTER TABLE "new_ServiceReport" RENAME TO "ServiceReport";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "signature" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("approved", "approvedAt", "approvedBy", "createdAt", "id", "name", "password", "role", "signature", "updatedAt", "username") SELECT "approved", "approvedAt", "approvedBy", "createdAt", "id", "name", "password", "role", "signature", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
