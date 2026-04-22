CREATE TABLE "AdminTestReport" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "includeAi" BOOLEAN NOT NULL DEFAULT false,
    "summary" JSONB NOT NULL,
    "results" JSONB NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),
    "pdfPath" TEXT NOT NULL,
    "reportUrl" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminTestReport_pkey" PRIMARY KEY ("id")
);
