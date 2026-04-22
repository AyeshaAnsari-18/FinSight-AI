/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JournalsModule } from './journals/journals.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AtGuard } from './auth/guards/at.guard';
import { DashboardModule } from './dashboard/dashboard.module';
import { EngineModule } from './engine/engine.module';
import { ReconcileModule } from './reconcile/reconcile.module';
import { TasksModule } from './tasks/tasks.module';
import { FiscalModule } from './fiscal/fiscal.module';
import { AuditTrailModule } from './audit-trail/audit-trail.module';
import { ComplianceModule } from './compliance/compliance.module';
import { ForecastModule } from './forecast/forecast.module';
import { NarrativesModule } from './narratives/narratives.module';
import { AuditorModule } from './auditor/auditor.module';
import { CopilotModule } from './copilot/copilot.module';
import { SearchModule } from './search/search.module';
import { AdminTestModule } from './admin-test/admin-test.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrometheusModule.register(),
    PrismaModule,
    AuthModule,
    UsersModule,
    JournalsModule,
    DashboardModule,
    EngineModule,
    ReconcileModule,
    TasksModule,
    FiscalModule,
    AuditTrailModule,
    ComplianceModule,
    ForecastModule,
    NarrativesModule,
    AuditorModule,
    CopilotModule,
    SearchModule,
    AdminTestModule,
  ],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}
