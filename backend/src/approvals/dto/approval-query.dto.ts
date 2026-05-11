import { ApprovalStatus, ApprovalTargetType } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ApprovalQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(ApprovalStatus, { message: '审批状态选择不正确' })
  status?: ApprovalStatus;

  @IsOptional()
  @IsEnum(ApprovalTargetType, { message: '审批对象选择不正确' })
  targetType?: ApprovalTargetType;
}

