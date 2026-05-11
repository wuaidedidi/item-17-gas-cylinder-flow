import { CylinderStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class CylinderQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(CylinderStatus, { message: '气瓶状态选择不正确' })
  status?: CylinderStatus;
}

