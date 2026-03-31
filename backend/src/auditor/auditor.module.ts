import { Module } from '@nestjs/common';
import { AuditorService } from './auditor.service';
import { AuditorController } from './auditor.controller';

@Module({
  controllers: [AuditorController],
  providers: [AuditorService],
})
export class AuditorModule {}
