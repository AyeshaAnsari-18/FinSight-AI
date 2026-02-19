import { Test, TestingModule } from '@nestjs/testing';
import { EngineService } from './engine.service';
import * as FormData from 'form-data';

describe('EngineService', () => {
  let service: EngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EngineService],
    }).compile();

    service = module.get<EngineService>(EngineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
