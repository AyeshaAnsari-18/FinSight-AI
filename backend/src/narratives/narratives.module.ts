import { Module } from '@nestjs/common';
import { NarrativesService } from './narratives.service';
import { NarrativesController } from './narratives.controller';

@Module({
  controllers: [NarrativesController],
  providers: [NarrativesService],
})
export class NarrativesModule {}
