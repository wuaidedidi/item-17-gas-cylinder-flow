import { RecordStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class RecordQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '气瓶编号格式不正确' })
  cylinderId?: number;

  @IsOptional()
  @IsEnum(RecordStatus, { message: '记录状态选择不正确' })
  status?: RecordStatus;
}

