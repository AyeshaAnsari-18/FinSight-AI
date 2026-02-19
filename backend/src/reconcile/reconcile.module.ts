import { Module } from '@nestjs/common';
import { ReconcileService } from './reconcile.service';
import { ReconcileController } from './reconcile.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [ReconcileController],
  providers: [ReconcileService],
})
export class ReconcileModule {}
