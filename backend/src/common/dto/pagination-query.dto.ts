import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '页码必须是数字' })
  @Min(1, { message: '页码不能小于 1' })
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '每页条数必须是数字' })
  @Min(1, { message: '每页条数不能小于 1' })
  @Max(100, { message: '每页条数不能超过 100' })
  pageSize = 10;

  @IsOptional()
  @IsString({ message: '关键词格式不正确' })
  keyword?: string;
}

