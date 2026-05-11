import { PartialType } from '@nestjs/swagger';
import { CreateWarningRuleDto } from './create-warning-rule.dto';

export class UpdateWarningRuleDto extends PartialType(CreateWarningRuleDto) {}

