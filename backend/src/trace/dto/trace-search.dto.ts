import { TraceQuerySource } from '@prisma/client';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';

export class TraceSearchDto {
  @IsString({ message: '请输入气瓶编码或关键词' })
  @Length(2, 128, { message: '查询关键词长度需要在 2 到 128 个字符之间' })
  keyword: string;

  @IsOptional()
  @IsEnum(TraceQuerySource, { message: '查询来源选择不正确' })
  source?: TraceQuerySource;
}

