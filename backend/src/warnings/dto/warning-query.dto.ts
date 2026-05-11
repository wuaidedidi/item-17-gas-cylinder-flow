import { WarningSeverity, WarningStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class WarningQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(WarningStatus, { message: '预警状态选择不正确' })
  status?: WarningStatus;

  @IsOptional()
  @IsEnum(WarningSeverity, { message: '预警级别选择不正确' })
  severity?: WarningSeverity;
}

