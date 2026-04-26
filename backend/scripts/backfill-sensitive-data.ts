import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';
import {
  decryptBuffer,
  decryptJsonValue,
  decryptText,
  encryptBuffer,
  encryptText,
} from '../src/common/security/data-protection';

const prisma = new PrismaClient();

async function encryptFileIfPresent(sourcePath: string, targetPath: string) {
  try {
    const source = await fs.readFile(sourcePath);
    const plain = decryptBuffer(source);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, encryptBuffer(plain));
    if (sourcePath !== targetPath) {
      await fs.unlink(sourcePath).catch(() => undefined);
    }
    return targetPath;
  } catch {
    return null;
  }
}

async function firstExisting(paths: string[]) {
  for (const candidate of paths) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // try next
    }
  }

  return null;
}

async function backfillDocuments() {
  const documents = await prisma.document.findMany();

  for (const document of documents) {
    const invoiceCandidates = [
      path.resolve(process.cwd(), 'storage', 'documents', `invoice-${document.id}.pdf.enc`),
      path.resolve(process.cwd(), 'storage', 'documents', `invoice-${document.id}.pdf`),
    ];
    const reportCandidates = [
      path.resolve(process.cwd(), 'storage', 'documents', `report-${document.id}.pdf.enc`),
      path.resolve(process.cwd(), 'storage', 'documents', `report-${document.id}.pdf`),
    ];

    const invoicePath = await firstExisting(invoiceCandidates);
    const reportPath = await firstExisting(reportCandidates);

    if (invoicePath) {
      await encryptFileIfPresent(
        invoicePath,
        path.resolve(process.cwd(), 'storage', 'documents', `invoice-${document.id}.pdf.enc`),
      );
    }

    if (reportPath) {
      await encryptFileIfPresent(
        reportPath,
        path.resolve(process.cwd(), 'storage', 'documents', `report-${document.id}.pdf.enc`),
      );
    }

    await prisma.document.update({
      where: { id: document.id },
      data: {
        fileName: encryptText(decryptText(document.fileName) || document.fileName),
        fileUrl: encryptText(decryptText(document.fileUrl) || document.fileUrl),
        generatedFileUrl: document.generatedFileUrl
          ? encryptText(decryptText(document.generatedFileUrl) || document.generatedFileUrl)
          : null,
        fileType: encryptText(decryptText(document.fileType) || document.fileType),
        extractedText: document.extractedText
          ? encryptText(decryptText(document.extractedText) || document.extractedText)
          : null,
        summary: document.summary
          ? encryptText(decryptText(document.summary) || document.summary)
          : null,
      },
    });
  }
}

async function backfillJournals() {
  const journals = await prisma.journalEntry.findMany();

  for (const journal of journals) {
    await prisma.journalEntry.update({
      where: { id: journal.id },
      data: {
        description: encryptText(decryptText(journal.description) || journal.description),
        reference: encryptText(decryptText(journal.reference) || journal.reference),
        flagReason: journal.flagReason
          ? encryptText(decryptText(journal.flagReason) || journal.flagReason)
          : null,
      },
    });
  }
}

async function backfillReconciliations() {
  const records = await prisma.reconciliation.findMany();

  for (const record of records) {
    await prisma.reconciliation.update({
      where: { id: record.id },
      data: {
        notes: record.notes
          ? encryptText(decryptText(record.notes) || record.notes)
          : null,
      },
    });
  }
}

async function backfillTasks() {
  const tasks = await prisma.task.findMany();

  for (const task of tasks) {
    await prisma.task.update({
      where: { id: task.id },
      data: {
        title: encryptText(decryptText(task.title) || task.title),
        description: task.description
          ? encryptText(decryptText(task.description) || task.description)
          : null,
      },
    });
  }
}

async function backfillPolicies() {
  const policies = await prisma.policy.findMany();

  for (const policy of policies) {
    await prisma.policy.update({
      where: { id: policy.id },
      data: {
        title: encryptText(decryptText(policy.title) || policy.title),
        content: encryptText(decryptText(policy.content) || policy.content),
        category: encryptText(decryptText(policy.category) || policy.category),
      },
    });
  }
}

async function backfillRiskControls() {
  const risks = await prisma.riskControl.findMany();

  for (const risk of risks) {
    await prisma.riskControl.update({
      where: { id: risk.id },
      data: {
        riskName: encryptText(decryptText(risk.riskName) || risk.riskName),
        controlDesc: encryptText(decryptText(risk.controlDesc) || risk.controlDesc),
      },
    });
  }
}

async function backfillAuditLogs() {
  const logs = await prisma.auditLog.findMany();

  for (const log of logs) {
    await prisma.auditLog.update({
      where: { id: log.id },
      data: {
        details: log.details
          ? encryptText(decryptText(log.details) || log.details)
          : null,
        ipAddress: log.ipAddress
          ? encryptText(decryptText(log.ipAddress) || log.ipAddress)
          : null,
      },
    });
  }
}

async function backfillChatMessages() {
  const messages = await prisma.chatMessage.findMany();

  for (const message of messages) {
    await prisma.chatMessage.update({
      where: { id: message.id },
      data: {
        content: encryptText(decryptText(message.content) || message.content),
      },
    });
  }
}

async function backfillAdminReports() {
  const reports = await prisma.adminTestReport.findMany();

  for (const report of reports) {
    const reportPath = path.resolve(process.cwd(), 'storage', 'admin-test-reports', path.basename(report.pdfPath));
    const encryptedReportPath = reportPath.endsWith('.enc') ? reportPath : `${reportPath}.enc`;
    await encryptFileIfPresent(reportPath, encryptedReportPath);

    await prisma.adminTestReport.update({
      where: { id: report.id },
      data: {
        title: encryptText(decryptText(report.title) || report.title),
        status: encryptText(decryptText(report.status) || report.status),
        mode: encryptText(decryptText(report.mode) || report.mode),
        summary: encryptText(JSON.stringify(decryptJsonValue(report.summary, report.summary))),
        results: encryptText(JSON.stringify(decryptJsonValue(report.results, report.results))),
        pdfPath: encryptText(encryptedReportPath),
        reportUrl: encryptText(decryptText(report.reportUrl) || report.reportUrl),
        createdBy: encryptText(decryptText(report.createdBy) || report.createdBy),
      },
    });
  }
}

async function main() {
  await backfillDocuments();
  await backfillJournals();
  await backfillReconciliations();
  await backfillTasks();
  await backfillPolicies();
  await backfillRiskControls();
  await backfillAuditLogs();
  await backfillChatMessages();
  await backfillAdminReports();
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Sensitive data backfill completed.');
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
