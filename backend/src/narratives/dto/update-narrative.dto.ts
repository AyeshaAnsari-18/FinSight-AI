import { PartialType } from '@nestjs/mapped-types';
import { CreateNarrativeDto } from './create-narrative.dto';

export class UpdateNarrativeDto extends PartialType(CreateNarrativeDto) {}
