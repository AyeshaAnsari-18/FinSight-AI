import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EngineService } from './engine.service';
import { EngineController } from './engine.controller';

@Global()
@Module({
  imports: [HttpModule],
  providers: [EngineService],
  exports: [EngineService],
  controllers: [EngineController],
})
export class EngineModule {}
