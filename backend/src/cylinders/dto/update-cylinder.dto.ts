import { PartialType } from '@nestjs/swagger';
import { CreateCylinderDto } from './create-cylinder.dto';

export class UpdateCylinderDto extends PartialType(CreateCylinderDto) {}

