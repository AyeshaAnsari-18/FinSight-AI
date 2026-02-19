import { PartialType } from '@nestjs/mapped-types';
import { CreateReconcileDto } from './create-reconcile.dto';

export class UpdateReconcileDto extends PartialType(CreateReconcileDto) {}
