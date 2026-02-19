import { PartialType } from '@nestjs/mapped-types';
import { CreateFiscalDto } from './create-fiscal.dto';

export class UpdateFiscalDto extends PartialType(CreateFiscalDto) {}
