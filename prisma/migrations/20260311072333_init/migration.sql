-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ExtractionLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT,
    "fileName" TEXT NOT NULL,
    "extractedCount" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExtractionLog_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ExtractionLog" ("createdAt", "extractedCount", "fileName", "id", "subjectId", "userId") SELECT "createdAt", "extractedCount", "fileName", "id", "subjectId", "userId" FROM "ExtractionLog";
DROP TABLE "ExtractionLog";
ALTER TABLE "new_ExtractionLog" RENAME TO "ExtractionLog";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
