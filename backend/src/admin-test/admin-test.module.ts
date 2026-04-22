import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminTestController } from './admin-test.controller';
import { AdminTestService } from './admin-test.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminTestController],
  providers: [AdminTestService],
})
export class AdminTestModule {}
