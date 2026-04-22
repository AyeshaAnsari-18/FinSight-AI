/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { PrismaClient, UserRole, JournalStatus, TaskStatus, Priority, ReconStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Production Mock Seeding...');

  const passwordHash = await argon2.hash('password123');

  // CLEANUP EXISTING DATA to ensure clean slate
  await prisma.chatMessage.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.policy.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.journalEntry.deleteMany({});
  await prisma.riskControl.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.reconciliation.deleteMany({});
  await prisma.fiscalClose.deleteMany({});
  await prisma.adminTestReport.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Old records cleared.');

  // USERS
  const accountant = await prisma.user.create({
    data: {
      email: 'accountant@finsight.ai',
      password: passwordHash,
      name: 'Sarah Accountant',
      role: UserRole.ACCOUNTANT,
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@finsight.ai',
      password: passwordHash,
      name: 'Mike Manager',
      role: UserRole.MANAGER,
    },
  });

  const auditor = await prisma.user.create({
    data: {
      email: 'auditor@finsight.ai',
      password: passwordHash,
      name: 'Alex Auditor',
      role: UserRole.AUDITOR,
    },
  });

  const compliance = await prisma.user.create({
    data: {
      email: 'compliance@finsight.ai',
      password: passwordHash,
      name: 'Rachel Compliance',
      role: UserRole.COMPLIANCE,
    },
  });

  await prisma.user.create({
    data: {
      email: 'admin@finsight.ai',
      password: await argon2.hash('admin'),
      name: 'admin',
      role: UserRole.ADMIN,
    },
  });

  console.log('Users created: accountant, manager, auditor, compliance, admin');

  // JOURNALS
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 5);

  const pendingDate = new Date();

  await prisma.journalEntry.createMany({
    data: [
      {
        date: pastDate,
        description: 'Office Supplies - Corporate HQ',
        reference: 'INV-2026-HQ44',
        debit: 5200.00,
        credit: 0.00,
        status: JournalStatus.POSTED,
        riskScore: 12,
      },
      {
        date: pendingDate,
        description: 'Marketing Agency Retainer',
        reference: 'INV-2026-MKTG',
        debit: 12500.00,
        credit: 0.00,
        status: JournalStatus.FLAGGED,
        flagReason: 'Unusual amount for vendor context',
        riskScore: 78,
      },
      {
        date: pendingDate,
        description: 'Marketing Retainer (Duplicate)',
        reference: 'INV-2026-MKTG',
        debit: 12500.00,
        credit: 0.00,
        status: JournalStatus.FLAGGED,
        flagReason: 'Exact duplicate of INV-2026-MKTG',
        riskScore: 95,
      },
      {
        date: pastDate,
        description: 'AWS Cloud Infrastructure Q3',
        reference: 'INV-AWS-1092',
        debit: 3450.75,
        credit: 0.00,
        status: JournalStatus.POSTED,
        riskScore: 5,
      },
      {
        date: new Date(),
        description: 'Suspicious Wire Transfer - Offshore',
        reference: 'WT-OFF-921',
        debit: 500000.00,
        credit: 0.00,
        status: JournalStatus.REJECTED,
        flagReason: 'High-risk offshore account detected',
        riskScore: 99,
      },
    ],
  });

  // TASKS
  await prisma.task.createMany({
    data: [
      {
        title: 'Review Q3 Accruals',
        description: 'Need to review and approve the latest accrual adjustments.',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
        status: TaskStatus.TODO,
        priority: Priority.HIGH,
        assignedToId: accountant.id,
      },
      {
        title: 'Clear Suspicious Retainer Fragment',
        description: 'Examine flagged journal entry for marketing duplication.',
        dueDate: new Date(),
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.URGENT,
        assignedToId: accountant.id,
      },
      {
        title: 'Audit Offshore Wire Transfers',
        description: 'Check WT-OFF-921 logs for compliance breach.',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
        status: TaskStatus.REVIEW,
        priority: Priority.URGENT,
        assignedToId: auditor.id,
      },
      {
        title: 'Approve Department Clearance: HR',
        description: 'Pending clearance for final payroll reconciliation.',
        dueDate: new Date(new Date().setDate(new Date().getDate() - 1)),
        status: TaskStatus.TODO,
        priority: Priority.HIGH,
        assignedToId: compliance.id,
      },
      {
        title: 'Execute Fiscal Close - Period 4',
        description: 'Run final manager review on period 4 closure.',
        dueDate: new Date(),
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.MEDIUM,
        assignedToId: manager.id,
      },
    ],
  });

  // POLICIES
  await prisma.policy.createMany({
    data: [
      {
        title: 'Anti-Money Laundering (AML) Guidelines',
        content: 'All transfers above $10,000 must undergo Level 2 Manager review. Offshore transfers above $50,000 require immediate Compliance Officer sign-off. Any flagged duplicate invoices must be manually verified with the vendor before payout.',
        category: 'Financial Risk',
      },
      {
        title: 'Data Privacy & GDPR Framework',
        content: 'Employee data access is strictly limited by RBAC (Role-Based Access Control). Managers explicitly cannot access raw PII of non-subordinates without an active Auditor ticket.',
        category: 'Information Security',
      },
      {
        title: 'Expense Reimbursement Policy v3',
        content: 'Reimbursements for travel exceeding $500/day must include itemized PDFs. Meal caps are strictly enforced at $100/day. Alcohol is totally excluded from corporate spending.',
        category: 'Operations',
      },
    ],
  });

  // DOCUMENTS
  await prisma.document.createMany({
    data: [
      {
        fileName: 'Q3_Financial_Report_Final.pdf',
        fileUrl: 'https://cdn.finsight.ai/docs/q3-report.pdf',
        fileType: 'PDF',
        extractedText: 'Total Q3 revenue hit an all-time high of $4.2M, representing a 15% YoY growth. Operating expenses increased by 8% mostly due to cloud infrastructure and marketing retainers.',
        summary: 'Q3 Earnings Report indicating 15% revenue growth and 8% OpEx growth.',
        uploadedById: manager.id,
      },
      {
        fileName: 'Vendor_Invoice_MKTG_Oct.pdf',
        fileUrl: 'https://cdn.finsight.ai/docs/invoice-mktg.pdf',
        fileType: 'PDF',
        extractedText: 'Invoice #INV-2026-MKTG. Billed to FinSight AI. Amount: $12,500.00. Description: Retainer for October Marketing Campaigns.',
        summary: 'Marketing Invoice for $12,500.',
        uploadedById: accountant.id,
      },
    ],
  });

  // RISK CONTROLS
  await prisma.riskControl.createMany({
    data: [
      {
        riskName: 'Duplicate Invoice Detection',
        controlDesc: 'Algorithmic scan across all inbound journals for fuzzy string match and exact amount matches within a 30-day window.',
        status: 'Active',
        lastTested: new Date(new Date().setDate(new Date().getDate() - 2)),
      },
      {
        riskName: 'Offshore Vendor Wire Limits',
        controlDesc: 'Systemic block on offshore wire transfers failing to meet AML policy thresholds without manual Compliance override.',
        status: 'Failing',
        lastTested: new Date(),
      },
      {
        riskName: 'Automated Bank Reconciliation',
        controlDesc: 'Nightly CRON job reconciling General Ledger against Plaid/Bank feeds.',
        status: 'Active',
        lastTested: new Date(),
      },
    ],
  });

  // AUDIT LOGS
  await prisma.auditLog.createMany({
    data: [
      {
        action: 'USER_LOGIN',
        details: 'Manager successfully authenticated.',
        ipAddress: '192.168.1.45',
        userId: manager.id,
      },
      {
        action: 'JOURNAL_FLAGGED',
        details: 'System flagged INV-2026-MKTG for duplicate entry possibility.',
        ipAddress: 'SYSTEM',
        userId: auditor.id,
      },
      {
        action: 'POLICY_VIEWED',
        details: 'Compliance Officer assessed AML policy routing.',
        ipAddress: '10.0.0.98',
        userId: compliance.id,
      },
      {
        action: 'TASK_COMPLETED',
        details: 'Accountant finished Q2 reconciliation items.',
        ipAddress: '192.168.1.112',
        userId: accountant.id,
      },
    ],
  });

  // RECONCILIATIONS
  await prisma.reconciliation.createMany({
    data: [
      {
        month: new Date('2026-01-01'),
        bankBalance: 154200.50,
        ledgerBalance: 154200.50,
        variance: 0.00,
        status: ReconStatus.MATCHED,
        notes: 'Perfect match for January EOM.',
      },
      {
        month: new Date('2026-02-01'),
        bankBalance: 245000.00,
        ledgerBalance: 248000.00,
        variance: -3000.00,
        status: ReconStatus.DISCREPANCY,
        notes: 'Unexplained $3000 variance traced to missing AWS wire transfer logs.',
      },
      {
        month: new Date('2026-03-01'),
        bankBalance: 320000.25,
        ledgerBalance: 319500.25,
        variance: 500.00,
        status: ReconStatus.PENDING,
        notes: 'Pending final review by Manager before committing.',
      },
    ],
  });

  // FISCAL CLOSE
  await prisma.fiscalClose.createMany({
    data: [
      {
        period: new Date('2025-12-31'),
        currentStage: 'Completed',
        completion: 100,
        logs: { "approver": "Mike Manager", "signOffDate": "2026-01-05" },
      },
      {
        period: new Date('2026-03-31'),
        currentStage: 'Pending Executive Review',
        completion: 85,
        logs: { "outstandingTasks": 2, "pendingDepartment": "HR" },
      },
    ],
  });

  console.log('Database fully populated with robust showcase data for all roles!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
