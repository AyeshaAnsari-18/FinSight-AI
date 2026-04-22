/* eslint-disable prettier/prettier */
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as argon2 from 'argon2';
import FormData from 'form-data';
import * as fs from 'fs';
import { promises as fsp } from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { AdminTestLoginDto } from './dto/admin-test-login.dto';
import { RunAdminTestDto } from './dto/run-admin-test.dto';

type RoleKey =
  | 'PUBLIC'
  | 'ADMIN'
  | 'ACCOUNTANT'
  | 'AUDITOR'
  | 'COMPLIANCE'
  | 'MANAGER';

type AuthenticatedRoleKey = Exclude<RoleKey, 'PUBLIC'>;

type UserSnapshot = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

type RequestContext = {
  tokens: Record<AuthenticatedRoleKey, string>;
  refreshTokens: Record<AuthenticatedRoleKey, string>;
  users: Record<AuthenticatedRoleKey, UserSnapshot>;
  artifacts: {
    journalId?: string;
    reconcileId?: string;
    taskId?: string;
    complianceId?: string;
  };
};

type TestCaseStatus = 'passed' | 'failed' | 'skipped';

type AdminTestReportRecord = {
  id: string;
  title: string;
  status: string;
  mode: string;
  includeAi: boolean;
  summary: unknown;
  results: unknown;
  startedAt: Date;
  finishedAt: Date | null;
  pdfPath: string;
  reportUrl: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

type TestCaseResult = {
  id: string;
  suiteId: string;
  suiteLabel: string;
  label: string;
  method: string;
  path: string;
  role: RoleKey;
  ai: boolean;
  status: TestCaseStatus;
  durationMs: number;
  statusCode?: number;
  message: string;
  responsePreview?: string;
};

type SuiteBreakdown = {
  suiteId: string;
  suiteLabel: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  aiCases: number;
  averageDurationMs: number;
};

type TestRunSummary = {
  suiteCount: number;
  caseCount: number;
  executedCaseCount: number;
  passed: number;
  failed: number;
  skipped: number;
  includeAi: boolean;
  totalDurationMs: number;
  successRate: number;
  suiteLabels: string[];
  aiCaseCount: number;
  aiCaseSkipped: number;
  suiteBreakdown: SuiteBreakdown[];
};

type CaseDefinition = {
  id: string;
  suiteId: string;
  suiteLabel: string;
  label: string;
  method: string;
  path: string;
  role: RoleKey;
  ai: boolean;
  execute: (
    http: AxiosInstance,
    context: RequestContext,
  ) => Promise<AxiosResponse<unknown>>;
};

type SuiteDefinition = {
  id: string;
  label: string;
  description: string;
  includesAi: boolean;
  cases: CaseDefinition[];
};

@Injectable()
export class AdminTestService {
  private readonly reportDirectory = path.resolve(
    process.cwd(),
    'storage',
    'admin-test-reports',
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private get adminReportStore() {
    return this.prisma as PrismaService & {
      adminTestReport: {
        findMany: (args: unknown) => Promise<AdminTestReportRecord[]>;
        findUnique: (args: unknown) => Promise<AdminTestReportRecord | null>;
        create: (args: unknown) => Promise<AdminTestReportRecord>;
        update: (args: unknown) => Promise<AdminTestReportRecord>;
      };
    };
  }

  async login(dto: AdminTestLoginDto) {
    if (dto.username.trim().toLowerCase() !== 'admin') {
      throw new ForbiddenException('Use the admin username for this panel.');
    }

    const admin = await this.prisma.user.findFirst({
      where: {
        role: 'ADMIN',
        OR: [{ email: 'admin@finsight.ai' }, { name: { equals: 'admin' } }],
      },
    });

    if (!admin) {
      throw new ForbiddenException('Admin test account is not provisioned in the database.');
    }

    const passwordMatches = await argon2.verify(admin.password, dto.password);
    if (!passwordMatches) {
      throw new ForbiddenException('Invalid admin credentials.');
    }

    const tokens = await this.authService.getTokens(admin.id, admin.email, admin.role);
    await this.authService.updateRtHash(admin.id, tokens.refresh_token);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    };
  }

  getCatalog() {
    return this.buildSuites().map((suite) => ({
      id: suite.id,
      label: suite.label,
      description: suite.description,
      includesAi: suite.includesAi,
      caseCount: suite.cases.length,
      cases: suite.cases.map((testCase) => ({
        id: testCase.id,
        label: testCase.label,
        method: testCase.method,
        path: testCase.path,
        role: testCase.role,
        ai: testCase.ai,
      })),
    }));
  }

  async listReports() {
    const reports = await this.adminReportStore.adminTestReport.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return reports.map((report) => this.serializeReport(report));
  }

  async getReport(id: string) {
    const report = await this.adminReportStore.adminTestReport.findUnique({ where: { id } });
    if (!report) {
      throw new NotFoundException('Admin test report not found.');
    }

    return this.serializeReport(report);
  }

  async getReportFile(id: string) {
    const report = await this.adminReportStore.adminTestReport.findUnique({ where: { id } });
    if (!report) {
      throw new NotFoundException('Admin test report not found.');
    }

    const fallbackPath = path.join(this.reportDirectory, path.basename(report.pdfPath));
    const filePath = fs.existsSync(report.pdfPath)
      ? report.pdfPath
      : fs.existsSync(fallbackPath)
        ? fallbackPath
        : await this.recoverMissingPdf(report);

    if (!filePath) {
      throw new NotFoundException('Admin test PDF report is no longer available on disk.');
    }

    return {
      filePath,
      fileName: path.basename(filePath),
    };
  }

  async runTests(dto: RunAdminTestDto, requestedBy: string) {
    const catalog = this.buildSuites();
    const selectedIds = dto.suiteIds?.length
      ? dto.suiteIds
      : catalog.map((suite) => suite.id);
    const suites = catalog.filter((suite) => selectedIds.includes(suite.id));

    if (!suites.length) {
      throw new NotFoundException('No admin test suites were selected.');
    }

    const includeAi = dto.includeAi === true;
    const startedAt = new Date();
    const context = await this.buildRequestContext();
    const http = axios.create({
      baseURL: this.getBaseUrl(),
      timeout: 45000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      validateStatus: () => true,
    });

    const results: TestCaseResult[] = [];

    for (const suite of suites) {
      for (const testCase of suite.cases) {
        if (testCase.ai && !includeAi) {
          results.push({
            id: testCase.id,
            suiteId: suite.id,
            suiteLabel: suite.label,
            label: testCase.label,
            method: testCase.method,
            path: testCase.path,
            role: testCase.role,
            ai: true,
            status: 'skipped',
            durationMs: 0,
            message:
              'Skipped to preserve the AI free-tier quota. Run the full AI sweep only when needed.',
          });
          continue;
        }

        const started = Date.now();

        try {
          const response = await testCase.execute(http, context);
          const durationMs = Date.now() - started;

          if (response.status >= 200 && response.status < 300) {
            results.push({
              id: testCase.id,
              suiteId: suite.id,
              suiteLabel: suite.label,
              label: testCase.label,
              method: testCase.method,
              path: testCase.path,
              role: testCase.role,
              ai: testCase.ai,
              status: 'passed',
              durationMs,
              statusCode: response.status,
              message: 'Request completed successfully.',
              responsePreview: this.formatPreview(response.data, 1200),
            });
            continue;
          }

          results.push({
            id: testCase.id,
            suiteId: suite.id,
            suiteLabel: suite.label,
            label: testCase.label,
            method: testCase.method,
            path: testCase.path,
            role: testCase.role,
            ai: testCase.ai,
            status: 'failed',
            durationMs,
            statusCode: response.status,
            message: `Unexpected response status ${response.status}.`,
            responsePreview: this.formatPreview(response.data, 1200),
          });
        } catch (error) {
          results.push({
            id: testCase.id,
            suiteId: suite.id,
            suiteLabel: suite.label,
            label: testCase.label,
            method: testCase.method,
            path: testCase.path,
            role: testCase.role,
            ai: testCase.ai,
            status: 'failed',
            durationMs: Date.now() - started,
            message:
              error instanceof Error ? error.message : 'Unknown admin test execution failure.',
          });
        }
      }
    }

    const finishedAt = new Date();
    const summary = this.buildSummary(results, suites, includeAi);
    const title = `Admin Test Run ${finishedAt.toISOString()}`;
    const pdfPath = await this.writePdfReport({
      title,
      requestedBy,
      startedAt,
      finishedAt,
      includeAi,
      summary,
      results,
    });

    const report = await this.adminReportStore.adminTestReport.create({
      data: {
        title,
        status: summary.failed > 0 ? 'FAILED' : 'PASSED',
        mode: includeAi ? 'FULL' : 'SAFE',
        includeAi,
        summary,
        results,
        startedAt,
        finishedAt,
        pdfPath,
        reportUrl: '',
        createdBy: requestedBy,
      },
    });

    const reportUrl = `/admin-test/reports/${report.id}/download`;
    const updated = await this.adminReportStore.adminTestReport.update({
      where: { id: report.id },
      data: { reportUrl },
    });

    return this.serializeReport(updated);
  }

  private async buildRequestContext(): Promise<RequestContext> {
    const roleProfiles: Record<AuthenticatedRoleKey, { email: string; password: string }> = {
      ADMIN: { email: 'admin@finsight.ai', password: 'admin' },
      ACCOUNTANT: { email: 'accountant@finsight.ai', password: 'password123' },
      AUDITOR: { email: 'auditor@finsight.ai', password: 'password123' },
      COMPLIANCE: { email: 'compliance@finsight.ai', password: 'password123' },
      MANAGER: { email: 'manager@finsight.ai', password: 'password123' },
    };

    const dbUsers = await this.prisma.user.findMany({
      where: {
        email: { in: Object.values(roleProfiles).map((profile) => profile.email) },
      },
    });

    const users = {} as RequestContext['users'];

    for (const [role, profile] of Object.entries(roleProfiles) as Array<
      [AuthenticatedRoleKey, { email: string; password: string }]
    >) {
      const user = dbUsers.find((item) => item.email === profile.email);
      if (!user) {
        throw new InternalServerErrorException(
          `Seed user ${profile.email} is missing. Run the backend seed before using admin tests.`,
        );
      }

      users[role] = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    }

    const tokens = {} as RequestContext['tokens'];
    const refreshTokens = {} as RequestContext['refreshTokens'];

    for (const [role, profile] of Object.entries(roleProfiles) as Array<
      [AuthenticatedRoleKey, { email: string; password: string }]
    >) {
      const issued = await this.authService.signinLocal({
        email: profile.email,
        password: profile.password,
      });

      tokens[role] = issued.access_token;
      refreshTokens[role] = issued.refresh_token;
    }

    return {
      tokens,
      refreshTokens,
      users,
      artifacts: {},
    };
  }

  private buildSuites(): SuiteDefinition[] {
    return [
      {
        id: 'public-core',
        label: 'Public Core',
        description: 'Validates the root backend route and auth lifecycle.',
        includesAi: false,
        cases: [
          this.case(
            'root-health',
            'public-core',
            'Public Core',
            'GET',
            '/',
            'PUBLIC',
            async (http) => http.get('/'),
          ),
          this.case(
            'auth-signup',
            'public-core',
            'Public Core',
            'POST',
            '/auth/signup',
            'PUBLIC',
            async (http) =>
              http.post('/auth/signup', {
                name: `Admin Test ${Date.now()}`,
                email: `admin-test-${Date.now()}@finsight.ai`,
                password: 'password123',
                role: 'ACCOUNTANT',
              }),
          ),
          this.case(
            'auth-signin',
            'public-core',
            'Public Core',
            'POST',
            '/auth/signin',
            'ACCOUNTANT',
            async (http, context) => {
              const response = await http.post('/auth/signin', {
                email: 'accountant@finsight.ai',
                password: 'password123',
              });

              const payload = response.data as {
                access_token?: string;
                refresh_token?: string;
              };

              if (payload.access_token) {
                context.tokens.ACCOUNTANT = payload.access_token;
              }

              if (payload.refresh_token) {
                context.refreshTokens.ACCOUNTANT = payload.refresh_token;
              }

              return response;
            },
          ),
          this.case(
            'auth-refresh',
            'public-core',
            'Public Core',
            'POST',
            '/auth/refresh',
            'ACCOUNTANT',
            async (http, context) => {
              const response = await http.post(
                '/auth/refresh',
                {},
                {
                  headers: {
                    Authorization: `Bearer ${context.refreshTokens.ACCOUNTANT}`,
                  },
                },
              );

              const payload = response.data as {
                access_token?: string;
                refresh_token?: string;
              };

              if (payload.access_token) {
                context.tokens.ACCOUNTANT = payload.access_token;
              }

              if (payload.refresh_token) {
                context.refreshTokens.ACCOUNTANT = payload.refresh_token;
              }

              return response;
            },
          ),
          this.case(
            'auth-logout',
            'public-core',
            'Public Core',
            'POST',
            '/auth/logout',
            'ACCOUNTANT',
            async (http, context) =>
              http.post(
                '/auth/logout',
                {},
                {
                  headers: this.authHeaders(context, 'ACCOUNTANT'),
                },
              ),
          ),
        ],
      },
      {
        id: 'identity-search',
        label: 'Identity & Search',
        description: 'Exercises users, departments, and search endpoints.',
        includesAi: false,
        cases: [
          this.case(
            'users-me',
            'identity-search',
            'Identity & Search',
            'GET',
            '/users/me',
            'MANAGER',
            async (http, context) =>
              http.get('/users/me', {
                headers: this.authHeaders(context, 'MANAGER'),
              }),
          ),
          this.case(
            'users-update',
            'identity-search',
            'Identity & Search',
            'PATCH',
            '/users/me',
            'MANAGER',
            async (http, context) =>
              http.patch(
                '/users/me',
                { name: context.users.MANAGER.name || 'Mike Manager' },
                {
                  headers: this.authHeaders(context, 'MANAGER'),
                },
              ),
          ),
          this.case(
            'users-departments',
            'identity-search',
            'Identity & Search',
            'GET',
            '/users/departments',
            'MANAGER',
            async (http, context) =>
              http.get('/users/departments', {
                headers: this.authHeaders(context, 'MANAGER'),
              }),
          ),
          this.case(
            'search-global',
            'identity-search',
            'Identity & Search',
            'GET',
            '/search?q=Marketing',
            'AUDITOR',
            async (http, context) =>
              http.get('/search?q=Marketing', {
                headers: this.authHeaders(context, 'AUDITOR'),
              }),
          ),
        ],
      },
      {
        id: 'accountant-ops',
        label: 'Accountant Operations',
        description: 'Covers journals, tasks, reconciliations, and accountant dashboards.',
        includesAi: true,
        cases: [
          this.case(
            'dashboard-accountant',
            'accountant-ops',
            'Accountant Operations',
            'GET',
            '/dashboard/accountant',
            'ACCOUNTANT',
            async (http, context) =>
              http.get('/dashboard/accountant', {
                headers: this.authHeaders(context, 'ACCOUNTANT'),
              }),
          ),
          this.case(
            'journal-create',
            'accountant-ops',
            'Accountant Operations',
            'POST',
            '/journals',
            'ACCOUNTANT',
            async (http, context) => {
              const response = await http.post(
                '/journals',
                {
                  date: new Date().toISOString(),
                  description: 'Admin test journal entry',
                  reference: `ADMIN-TEST-${Date.now()}`,
                  debit: 1200,
                  credit: 1200,
                  status: 'DRAFT',
                },
                {
                  headers: this.authHeaders(context, 'ACCOUNTANT'),
                },
              );

              const record = response.data as { id?: string };
              context.artifacts.journalId = record.id;
              return response;
            },
          ),
          this.case(
            'journal-list',
            'accountant-ops',
            'Accountant Operations',
            'GET',
            '/journals',
            'ACCOUNTANT',
            async (http, context) =>
              http.get('/journals', {
                headers: this.authHeaders(context, 'ACCOUNTANT'),
              }),
          ),
          this.case(
            'journal-get',
            'accountant-ops',
            'Accountant Operations',
            'GET',
            '/journals/:id',
            'ACCOUNTANT',
            async (http, context) =>
              http.get(`/journals/${context.artifacts.journalId}`, {
                headers: this.authHeaders(context, 'ACCOUNTANT'),
              }),
          ),
          this.case(
            'journal-analyze-payload',
            'accountant-ops',
            'Accountant Operations',
            'POST',
            '/journals/analyze',
            'AUDITOR',
            async (http, context) =>
              http.post(
                '/journals/analyze',
                {
                  description: 'Standalone admin test journal payload',
                  reference: `ANALYZE-${Date.now()}`,
                  debit: 4200,
                  credit: 4100,
                },
                {
                  headers: this.authHeaders(context, 'AUDITOR'),
                },
              ),
            true,
          ),
          this.case(
            'journal-review-summary',
            'accountant-ops',
            'Accountant Operations',
            'POST',
            '/journals/review-summary',
            'AUDITOR',
            async (http, context) =>
              http.post(
                '/journals/review-summary',
                {
                  scope: 'currentYear',
                  limit: 4,
                },
                {
                  headers: this.authHeaders(context, 'AUDITOR'),
                },
              ),
            true,
          ),
          this.case(
            'journal-analyze-one',
            'accountant-ops',
            'Accountant Operations',
            'POST',
            '/journals/:id/analyze',
            'AUDITOR',
            async (http, context) =>
              http.post(
                `/journals/${context.artifacts.journalId}/analyze`,
                {},
                {
                  headers: this.authHeaders(context, 'AUDITOR'),
                },
              ),
            true,
          ),
          this.case(
            'journal-update',
            'accountant-ops',
            'Accountant Operations',
            'PATCH',
            '/journals/:id',
            'ACCOUNTANT',
            async (http, context) =>
              http.patch(
                `/journals/${context.artifacts.journalId}`,
                { status: 'POSTED' },
                {
                  headers: this.authHeaders(context, 'ACCOUNTANT'),
                },
              ),
          ),
          this.case(
            'task-create',
            'accountant-ops',
            'Accountant Operations',
            'POST',
            '/tasks',
            'MANAGER',
            async (http, context) => {
              const response = await http.post(
                '/tasks',
                {
                  title: `Admin Test Task ${Date.now()}`,
                  description: 'Generated by the admin test console.',
                  dueDate: new Date().toISOString(),
                  priority: 'HIGH',
                  assignedToId: context.users.ACCOUNTANT.id,
                },
                {
                  headers: this.authHeaders(context, 'MANAGER'),
                },
              );

              const record = response.data as { id?: string };
              context.artifacts.taskId = record.id;
              return response;
            },
          ),
          this.case(
            'task-list',
            'accountant-ops',
            'Accountant Operations',
            'GET',
            '/tasks',
            'ACCOUNTANT',
            async (http, context) =>
              http.get('/tasks', {
                headers: this.authHeaders(context, 'ACCOUNTANT'),
              }),
          ),
          this.case(
            'task-my-list',
            'accountant-ops',
            'Accountant Operations',
            'GET',
            '/tasks/me',
            'ACCOUNTANT',
            async (http, context) =>
              http.get('/tasks/me', {
                headers: this.authHeaders(context, 'ACCOUNTANT'),
              }),
          ),
          this.case(
            'task-update',
            'accountant-ops',
            'Accountant Operations',
            'PATCH',
            '/tasks/:id',
            'ACCOUNTANT',
            async (http, context) =>
              http.patch(
                `/tasks/${context.artifacts.taskId}`,
                { status: 'IN_PROGRESS' },
                {
                  headers: this.authHeaders(context, 'ACCOUNTANT'),
                },
              ),
          ),
          this.case(
            'reconcile-analyze-payload',
            'accountant-ops',
            'Accountant Operations',
            'POST',
            '/reconcile/analyze',
            'AUDITOR',
            async (http, context) =>
              http.post(
                '/reconcile/analyze',
                {
                  bankBalance: 25000,
                  ledgerBalance: 24750,
                  notes: 'Admin test reconcile payload.',
                },
                {
                  headers: this.authHeaders(context, 'AUDITOR'),
                },
              ),
            true,
          ),
          this.case(
            'reconcile-create',
            'accountant-ops',
            'Accountant Operations',
            'POST',
            '/reconcile',
            'ACCOUNTANT',
            async (http, context) => {
              const response = await http.post(
                '/reconcile',
                {
                  month: new Date().toISOString(),
                  bankBalance: 25000,
                  ledgerBalance: 24750,
                  notes: 'Admin test reconciliation payload.',
                },
                {
                  headers: this.authHeaders(context, 'ACCOUNTANT'),
                },
              );

              const record = response.data as { id?: string };
              context.artifacts.reconcileId = record.id;
              return response;
            },
            true,
          ),
          this.case(
            'reconcile-list',
            'accountant-ops',
            'Accountant Operations',
            'GET',
            '/reconcile',
            'ACCOUNTANT',
            async (http, context) =>
              http.get('/reconcile', {
                headers: this.authHeaders(context, 'ACCOUNTANT'),
              }),
          ),
          this.case(
            'reconcile-review-summary',
            'accountant-ops',
            'Accountant Operations',
            'POST',
            '/reconcile/review-summary',
            'AUDITOR',
            async (http, context) =>
              http.post(
                '/reconcile/review-summary',
                {
                  scope: 'currentYear',
                  limit: 4,
                },
                {
                  headers: this.authHeaders(context, 'AUDITOR'),
                },
              ),
            true,
          ),
          this.case(
            'reconcile-analyze-one',
            'accountant-ops',
            'Accountant Operations',
            'POST',
            '/reconcile/:id/analyze',
            'AUDITOR',
            async (http, context) =>
              http.post(
                `/reconcile/${context.artifacts.reconcileId}/analyze`,
                {},
                {
                  headers: this.authHeaders(context, 'AUDITOR'),
                },
              ),
            true,
          ),
        ],
      },
      {
        id: 'audit-compliance',
        label: 'Audit & Compliance',
        description: 'Covers auditor dashboards, compliance datasets, and audit logs.',
        includesAi: false,
        cases: [
          this.case(
            'auditor-dashboard',
            'audit-compliance',
            'Audit & Compliance',
            'GET',
            '/auditor/dashboard',
            'AUDITOR',
            async (http, context) =>
              http.get('/auditor/dashboard', {
                headers: this.authHeaders(context, 'AUDITOR'),
              }),
          ),
          this.case(
            'auditor-compliance',
            'audit-compliance',
            'Audit & Compliance',
            'GET',
            '/auditor/compliance',
            'AUDITOR',
            async (http, context) =>
              http.get('/auditor/compliance', {
                headers: this.authHeaders(context, 'AUDITOR'),
              }),
          ),
          this.case(
            'auditor-departments',
            'audit-compliance',
            'Audit & Compliance',
            'GET',
            '/auditor/department-overview',
            'AUDITOR',
            async (http, context) =>
              http.get('/auditor/department-overview', {
                headers: this.authHeaders(context, 'AUDITOR'),
              }),
          ),
          this.case(
            'audit-trail-create',
            'audit-compliance',
            'Audit & Compliance',
            'POST',
            '/audit-trail',
            'AUDITOR',
            async (http, context) =>
              http.post(
                '/audit-trail',
                {
                  action: 'ADMIN_TEST',
                  details: 'Created by admin test console.',
                  ipAddress: '127.0.0.1',
                },
                {
                  headers: this.authHeaders(context, 'AUDITOR'),
                },
              ),
          ),
          this.case(
            'audit-trail-list',
            'audit-compliance',
            'Audit & Compliance',
            'GET',
            '/audit-trail',
            'AUDITOR',
            async (http, context) =>
              http.get('/audit-trail', {
                headers: this.authHeaders(context, 'AUDITOR'),
              }),
          ),
          this.case(
            'compliance-create',
            'audit-compliance',
            'Audit & Compliance',
            'POST',
            '/compliance',
            'COMPLIANCE',
            async (http, context) => {
              const response = await http.post(
                '/compliance',
                {
                  riskName: `Admin Test Control ${Date.now()}`,
                  controlDesc: 'Control inserted by the admin test console.',
                  status: 'Pending',
                  lastTested: new Date().toISOString(),
                },
                {
                  headers: this.authHeaders(context, 'COMPLIANCE'),
                },
              );

              const record = response.data as { id?: string };
              context.artifacts.complianceId = record.id;
              return response;
            },
          ),
          this.case(
            'compliance-issues',
            'audit-compliance',
            'Audit & Compliance',
            'GET',
            '/compliance/issues',
            'COMPLIANCE',
            async (http, context) =>
              http.get('/compliance/issues', {
                headers: this.authHeaders(context, 'COMPLIANCE'),
              }),
          ),
          this.case(
            'compliance-controls',
            'audit-compliance',
            'Audit & Compliance',
            'GET',
            '/compliance/controls',
            'COMPLIANCE',
            async (http, context) =>
              http.get('/compliance/controls', {
                headers: this.authHeaders(context, 'COMPLIANCE'),
              }),
          ),
          this.case(
            'compliance-policies',
            'audit-compliance',
            'Audit & Compliance',
            'GET',
            '/compliance/policies',
            'COMPLIANCE',
            async (http, context) =>
              http.get('/compliance/policies', {
                headers: this.authHeaders(context, 'COMPLIANCE'),
              }),
          ),
          this.case(
            'compliance-monitoring',
            'audit-compliance',
            'Audit & Compliance',
            'GET',
            '/compliance/monitoring',
            'COMPLIANCE',
            async (http, context) =>
              http.get('/compliance/monitoring', {
                headers: this.authHeaders(context, 'COMPLIANCE'),
              }),
          ),
        ],
      },
      {
        id: 'manager-ai',
        label: 'Manager & AI',
        description: 'Covers narratives, forecast, fiscal close, copilot, and engine proxy routes.',
        includesAi: true,
        cases: [
          this.case(
            'narratives-list',
            'manager-ai',
            'Manager & AI',
            'GET',
            '/narratives',
            'MANAGER',
            async (http, context) =>
              http.get('/narratives', {
                headers: this.authHeaders(context, 'MANAGER'),
              }),
          ),
          this.case(
            'forecast-predict',
            'manager-ai',
            'Manager & AI',
            'GET',
            '/forecast/predict?force=true',
            'MANAGER',
            async (http, context) =>
              http.get('/forecast/predict?force=true', {
                headers: this.authHeaders(context, 'MANAGER'),
              }),
            true,
          ),
          this.case(
            'forecast-what-if',
            'manager-ai',
            'Manager & AI',
            'GET',
            '/forecast/what-if?force=true',
            'MANAGER',
            async (http, context) =>
              http.get('/forecast/what-if?force=true', {
                headers: this.authHeaders(context, 'MANAGER'),
              }),
            true,
          ),
          this.case(
            'fiscal-run-close',
            'manager-ai',
            'Manager & AI',
            'POST',
            '/fiscal/run-close',
            'MANAGER',
            async (http, context) =>
              http.post(
                '/fiscal/run-close',
                {},
                {
                  headers: this.authHeaders(context, 'MANAGER'),
                },
              ),
            true,
          ),
          this.case(
            'copilot-chat',
            'manager-ai',
            'Manager & AI',
            'POST',
            '/copilot/chat',
            'MANAGER',
            async (http, context) =>
              http.post(
                '/copilot/chat',
                { message: 'Summarize the current workspace state in one sentence.' },
                {
                  headers: this.authHeaders(context, 'MANAGER'),
                },
              ),
            true,
          ),
          this.case(
            'copilot-history',
            'manager-ai',
            'Manager & AI',
            'GET',
            '/copilot/history',
            'MANAGER',
            async (http, context) =>
              http.get('/copilot/history', {
                headers: this.authHeaders(context, 'MANAGER'),
              }),
          ),
          this.case(
            'engine-analyze-journal',
            'manager-ai',
            'Manager & AI',
            'POST',
            '/engine/analyze-journal',
            'ADMIN',
            async (http, context) =>
              http.post(
                '/engine/analyze-journal',
                {
                  description: 'Admin engine smoke test journal',
                  debit: 1900,
                  credit: 1900,
                  reference: `ENGINE-${Date.now()}`,
                },
                {
                  headers: this.authHeaders(context, 'ADMIN'),
                },
              ),
            true,
          ),
          this.case(
            'engine-analyze-reconciliation',
            'manager-ai',
            'Manager & AI',
            'POST',
            '/engine/analyze-reconciliation',
            'ADMIN',
            async (http, context) =>
              http.post(
                '/engine/analyze-reconciliation',
                {
                  bank_balance: 11500,
                  ledger_balance: 11325,
                  notes: 'Admin engine smoke reconciliation.',
                },
                {
                  headers: this.authHeaders(context, 'ADMIN'),
                },
              ),
            true,
          ),
          this.case(
            'engine-predict-forecast',
            'manager-ai',
            'Manager & AI',
            'POST',
            '/engine/predict-forecast',
            'ADMIN',
            async (http, context) =>
              http.post(
                '/engine/predict-forecast',
                {
                  historical_data: [
                    { month: '2025-10', revenue: 120000, expenses: 76000 },
                    { month: '2025-11', revenue: 125000, expenses: 79000 },
                    { month: '2025-12', revenue: 131000, expenses: 81000 },
                  ],
                },
                {
                  headers: this.authHeaders(context, 'ADMIN'),
                },
              ),
            true,
          ),
          this.case(
            'engine-predict-what-if',
            'manager-ai',
            'Manager & AI',
            'POST',
            '/engine/predict-what-if',
            'ADMIN',
            async (http, context) =>
              http.post(
                '/engine/predict-what-if',
                {
                  historical_data: [
                    { month: '2025-10', revenue: 120000, expenses: 76000 },
                    { month: '2025-11', revenue: 125000, expenses: 79000 },
                    { month: '2025-12', revenue: 131000, expenses: 81000 },
                  ],
                },
                {
                  headers: this.authHeaders(context, 'ADMIN'),
                },
              ),
            true,
          ),
          this.case(
            'engine-run-fiscal',
            'manager-ai',
            'Manager & AI',
            'POST',
            '/engine/orchestrate-fiscal-close',
            'ADMIN',
            async (http, context) =>
              http.post(
                '/engine/orchestrate-fiscal-close',
                {
                  journals: [{ status: 'POSTED', _count: { status: 12 } }],
                  tasks: [{ status: 'TODO', priority: 'HIGH', _count: { status: 2 } }],
                },
                {
                  headers: this.authHeaders(context, 'ADMIN'),
                },
              ),
            true,
          ),
          this.case(
            'engine-copilot-rag',
            'manager-ai',
            'Manager & AI',
            'POST',
            '/engine/copilot-rag',
            'ADMIN',
            async (http, context) =>
              http.post(
                '/engine/copilot-rag',
                {
                  role: 'MANAGER',
                  message: 'Give me a one-line summary.',
                  context: 'Revenue is stable and no urgent blockers exist.',
                  history: [],
                },
                {
                  headers: this.authHeaders(context, 'ADMIN'),
                },
              ),
            true,
          ),
          this.case(
            'engine-upload-ocr',
            'manager-ai',
            'Manager & AI',
            'POST',
            '/engine/upload-ocr',
            'ADMIN',
            async (http, context) => {
              const formData = new FormData();
              formData.append('document', await fsp.readFile(this.resolveSampleInvoice()), {
                filename: 'invoice_sample_1.pdf',
                contentType: 'application/pdf',
              });

              return http.post('/engine/upload-ocr', formData, {
                headers: {
                  ...formData.getHeaders(),
                  ...this.authHeaders(context, 'ADMIN'),
                },
              });
            },
            true,
          ),
        ],
      },
    ];
  }

  private case(
    id: string,
    suiteId: string,
    suiteLabel: string,
    method: string,
    pathValue: string,
    role: RoleKey,
    execute: CaseDefinition['execute'],
    ai = false,
  ): CaseDefinition {
    return {
      id,
      suiteId,
      suiteLabel,
      label: id
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' '),
      method,
      path: pathValue,
      role,
      ai,
      execute,
    };
  }

  private authHeaders(context: RequestContext, role: AuthenticatedRoleKey) {
    return {
      Authorization: `Bearer ${context.tokens[role]}`,
    };
  }

  private buildSummary(
    results: TestCaseResult[],
    suites: SuiteDefinition[],
    includeAi: boolean,
  ): TestRunSummary {
    const passed = results.filter((result) => result.status === 'passed').length;
    const failed = results.filter((result) => result.status === 'failed').length;
    const skipped = results.filter((result) => result.status === 'skipped').length;
    const executedCaseCount = passed + failed;
    const totalDurationMs = results.reduce((sum, result) => sum + result.durationMs, 0);
    const aiCaseCount = results.filter((result) => result.ai).length;
    const aiCaseSkipped = results.filter(
      (result) => result.ai && result.status === 'skipped',
    ).length;
    const suiteGroups = this.groupResultsBySuite(results, suites);
    const successRate =
      executedCaseCount > 0
        ? Number(((passed / executedCaseCount) * 100).toFixed(1))
        : failed === 0
          ? 100
          : 0;

    return {
      suiteCount: suites.length,
      caseCount: results.length,
      executedCaseCount,
      passed,
      failed,
      skipped,
      includeAi,
      totalDurationMs,
      successRate,
      suiteLabels: suites.map((suite) => suite.label),
      aiCaseCount,
      aiCaseSkipped,
      suiteBreakdown: suiteGroups,
    };
  }

  private async writePdfReport(payload: {
    title: string;
    requestedBy: string;
    startedAt: Date;
    finishedAt: Date;
    includeAi: boolean;
    summary: TestRunSummary;
    results: TestCaseResult[];
    outputPath?: string;
  }) {
    await fsp.mkdir(this.reportDirectory, { recursive: true });

    const filePath =
      payload.outputPath ||
      path.join(
        this.reportDirectory,
        `${payload.finishedAt.toISOString().replace(/[:.]/g, '-')}.pdf`,
      );

    await new Promise<void>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const stream = fs.createWriteStream(filePath);
      const addPageIfNeeded = (minimumSpace = 96) => {
        if (doc.y + minimumSpace > doc.page.height - doc.page.margins.bottom) {
          doc.addPage();
        }
      };
      const writeLabelValue = (label: string, value: string) => {
        addPageIfNeeded(20);
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#64748b').text(label, {
          continued: true,
        });
        doc.font('Helvetica').fillColor('#111827').text(` ${value}`);
      };
      const writeSectionTitle = (label: string) => {
        addPageIfNeeded(32);
        doc.moveDown(0.6);
        doc.font('Helvetica-Bold').fontSize(14).fillColor('#0f172a').text(label);
        doc.moveDown(0.25);
      };

      doc.pipe(stream);
      doc.font('Helvetica-Bold').fontSize(22).fillColor('#0f172a').text(payload.title);
      doc.moveDown(0.25);
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#475569')
        .text('Technical validation report generated by the admin-test console.');

      writeSectionTitle('Execution Overview');
      writeLabelValue('Requested by:', payload.requestedBy);
      writeLabelValue('Started:', payload.startedAt.toISOString());
      writeLabelValue('Finished:', payload.finishedAt.toISOString());
      writeLabelValue(
        'Run mode:',
        payload.includeAi
          ? 'Full sweep with AI-backed smoke coverage enabled'
          : 'Safe sweep with AI-backed cases skipped',
      );
      writeLabelValue('Selected suites:', payload.summary.suiteLabels.join(', '));

      writeSectionTitle('Outcome Summary');
      writeLabelValue('Suites covered:', String(payload.summary.suiteCount));
      writeLabelValue('Cases in report:', String(payload.summary.caseCount));
      writeLabelValue('Executed cases:', String(payload.summary.executedCaseCount));
      writeLabelValue('Passed:', String(payload.summary.passed));
      writeLabelValue('Failed:', String(payload.summary.failed));
      writeLabelValue('Skipped:', String(payload.summary.skipped));
      writeLabelValue('Success rate:', `${payload.summary.successRate}%`);
      writeLabelValue('Total duration:', `${payload.summary.totalDurationMs}ms`);
      writeLabelValue('AI cases in scope:', String(payload.summary.aiCaseCount));
      writeLabelValue(
        'AI cases skipped for quota protection:',
        String(payload.summary.aiCaseSkipped),
      );

      writeSectionTitle('Suite Breakdown');
      for (const suite of payload.summary.suiteBreakdown) {
        addPageIfNeeded(72);
        doc.font('Helvetica-Bold').fontSize(11).fillColor('#0f172a').text(suite.suiteLabel);
        doc.font('Helvetica').fontSize(9).fillColor('#334155');
        doc.text(
          `Total ${suite.total} | Passed ${suite.passed} | Failed ${suite.failed} | Skipped ${suite.skipped} | AI cases ${suite.aiCases} | Avg duration ${suite.averageDurationMs}ms`,
        );
        doc.moveDown(0.3);
      }

      writeSectionTitle('Detailed Case Results');
      for (const suite of payload.summary.suiteBreakdown) {
        addPageIfNeeded(48);
        doc.font('Helvetica-Bold').fontSize(12).fillColor('#0f172a').text(suite.suiteLabel);
        doc.moveDown(0.2);

        for (const result of payload.results.filter(
          (entry) => entry.suiteId === suite.suiteId,
        )) {
          addPageIfNeeded(result.responsePreview ? 100 : 64);
          doc
            .font('Helvetica-Bold')
            .fontSize(10)
            .fillColor(
              result.status === 'passed'
                ? '#0f766e'
                : result.status === 'failed'
                  ? '#b91c1c'
                  : '#9a6700',
            )
            .text(
              `[${result.status.toUpperCase()}] ${result.label} | ${result.method} ${result.path}`,
            );
          doc
            .font('Helvetica')
            .fontSize(9)
            .fillColor('#334155')
            .text(
              `Role ${result.role} | Duration ${result.durationMs}ms${
                result.statusCode ? ` | Status ${result.statusCode}` : ''
              }${result.ai ? ' | AI-backed case' : ''}`,
            );
          doc.font('Helvetica').fontSize(9).fillColor('#111827').text(result.message);

          if (result.responsePreview) {
            doc
              .font('Helvetica')
              .fontSize(8)
              .fillColor('#475569')
              .text(`Response preview: ${this.formatPreview(result.responsePreview, 800)}`);
          }

          doc.moveDown(0.5);
        }
      }

      doc.end();
      stream.on('finish', () => resolve());
      stream.on('error', (error) => reject(error));
    });

    return filePath;
  }

  private async recoverMissingPdf(report: AdminTestReportRecord) {
    const results = this.normalizeStoredResults(report.results);
    const summary = this.normalizeStoredSummary(report.summary, results);
    const recoveredPath = path.join(
      this.reportDirectory,
      `${report.id}-recovered.pdf`,
    );

    await this.writePdfReport({
      title: report.title,
      requestedBy: report.createdBy,
      startedAt: report.startedAt,
      finishedAt: report.finishedAt || report.updatedAt,
      includeAi: report.includeAi,
      summary,
      results,
      outputPath: recoveredPath,
    });

    if (fs.existsSync(recoveredPath)) {
      await this.adminReportStore.adminTestReport.update({
        where: { id: report.id },
        data: { pdfPath: recoveredPath },
      });
      return recoveredPath;
    }

    return null;
  }

  private normalizeStoredSummary(summary: unknown, results: TestCaseResult[]): TestRunSummary {
    const raw = (summary && typeof summary === 'object' ? summary : {}) as Partial<TestRunSummary>;
    const passed = raw.passed ?? results.filter((result) => result.status === 'passed').length;
    const failed = raw.failed ?? results.filter((result) => result.status === 'failed').length;
    const skipped = raw.skipped ?? results.filter((result) => result.status === 'skipped').length;
    const executedCaseCount = raw.executedCaseCount ?? passed + failed;
    const suiteLabels =
      raw.suiteLabels?.length ? raw.suiteLabels : [...new Set(results.map((result) => result.suiteLabel))];

    return {
      suiteCount: raw.suiteCount ?? suiteLabels.length,
      caseCount: raw.caseCount ?? results.length,
      executedCaseCount,
      passed,
      failed,
      skipped,
      includeAi: raw.includeAi ?? results.some((result) => result.ai),
      totalDurationMs:
        raw.totalDurationMs ?? results.reduce((sum, result) => sum + result.durationMs, 0),
      successRate:
        raw.successRate ??
        (executedCaseCount > 0 ? Number(((passed / executedCaseCount) * 100).toFixed(1)) : 0),
      suiteLabels,
      aiCaseCount: raw.aiCaseCount ?? results.filter((result) => result.ai).length,
      aiCaseSkipped:
        raw.aiCaseSkipped ??
        results.filter((result) => result.ai && result.status === 'skipped').length,
      suiteBreakdown:
        raw.suiteBreakdown?.length ? raw.suiteBreakdown : this.buildSuiteBreakdown(results),
    };
  }

  private normalizeStoredResults(results: unknown): TestCaseResult[] {
    if (!Array.isArray(results)) {
      return [];
    }

    return results
      .map((result) => result as Partial<TestCaseResult>)
      .filter((result): result is Partial<TestCaseResult> & { id: string; suiteId: string; suiteLabel: string; label: string; method: string; path: string; role: RoleKey; ai: boolean; status: TestCaseStatus; durationMs: number; message: string } =>
        Boolean(
          result &&
            typeof result.id === 'string' &&
            typeof result.suiteId === 'string' &&
            typeof result.suiteLabel === 'string' &&
            typeof result.label === 'string' &&
            typeof result.method === 'string' &&
            typeof result.path === 'string' &&
            typeof result.role === 'string' &&
            typeof result.ai === 'boolean' &&
            typeof result.status === 'string' &&
            typeof result.durationMs === 'number' &&
            typeof result.message === 'string',
        ),
      );
  }

  private buildSuiteBreakdown(results: TestCaseResult[]): SuiteBreakdown[] {
    const groups = new Map<string, TestCaseResult[]>();

    for (const result of results) {
      const current = groups.get(result.suiteId) || [];
      current.push(result);
      groups.set(result.suiteId, current);
    }

    return [...groups.entries()].map(([suiteId, suiteResults]) => {
      const totalDurationMs = suiteResults.reduce((sum, result) => sum + result.durationMs, 0);

      return {
        suiteId,
        suiteLabel: suiteResults[0]?.suiteLabel || suiteId,
        total: suiteResults.length,
        passed: suiteResults.filter((result) => result.status === 'passed').length,
        failed: suiteResults.filter((result) => result.status === 'failed').length,
        skipped: suiteResults.filter((result) => result.status === 'skipped').length,
        aiCases: suiteResults.filter((result) => result.ai).length,
        averageDurationMs: suiteResults.length
          ? Number((totalDurationMs / suiteResults.length).toFixed(1))
          : 0,
      };
    });
  }

  private groupResultsBySuite(
    results: TestCaseResult[],
    suites: SuiteDefinition[],
  ): SuiteBreakdown[] {
    return suites.map((suite) => {
      const suiteResults = results.filter((result) => result.suiteId === suite.id);
      const totalDurationMs = suiteResults.reduce(
        (sum, result) => sum + result.durationMs,
        0,
      );

      return {
        suiteId: suite.id,
        suiteLabel: suite.label,
        total: suiteResults.length,
        passed: suiteResults.filter((result) => result.status === 'passed').length,
        failed: suiteResults.filter((result) => result.status === 'failed').length,
        skipped: suiteResults.filter((result) => result.status === 'skipped').length,
        aiCases: suiteResults.filter((result) => result.ai).length,
        averageDurationMs: suiteResults.length
          ? Number((totalDurationMs / suiteResults.length).toFixed(1))
          : 0,
      };
    });
  }

  private formatPreview(data: unknown, maxLength = 240) {
    try {
      const raw = typeof data === 'string' ? data : JSON.stringify(data);
      return raw.length > maxLength ? `${raw.slice(0, maxLength)}...` : raw;
    } catch {
      return 'Unable to serialize response preview.';
    }
  }

  private getBaseUrl() {
    return (
      this.configService.get<string>('ADMIN_TEST_BASE_URL') ||
      `http://127.0.0.1:${this.configService.get<string>('PORT') || '3000'}`
    );
  }

  private resolveSampleInvoice() {
    const candidates = [
      path.resolve(process.cwd(), '..', 'samples', 'invoice_sample_1.pdf'),
      path.resolve(process.cwd(), 'samples', 'invoice_sample_1.pdf'),
      path.resolve(process.cwd(), '..', '..', 'samples', 'invoice_sample_1.pdf'),
    ];

    const existing = candidates.find((candidate) => fs.existsSync(candidate));
    if (!existing) {
      throw new InternalServerErrorException(
        'The sample OCR invoice file could not be found for the admin test suite.',
      );
    }

    return existing;
  }

  private serializeReport(report: AdminTestReportRecord) {
    return {
      ...report,
      reportUrl:
        report.reportUrl || `/admin-test/reports/${report.id}/download`,
      startedAt: report.startedAt.toISOString(),
      finishedAt: report.finishedAt ? report.finishedAt.toISOString() : null,
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
    };
  }
}
