import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WarningSeverity } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Length } from 'class-validator';

export class CreateWarningDto {
  @ApiPropertyOptional({ description: '气瓶ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '气瓶编号格式不正确' })
  cylinderId?: number;

  @ApiProperty({ description: '预警标题' })
  @IsString({ message: '预警标题不能为空' })
  @Length(2, 128, { message: '预警标题长度需要在 2 到 128 个字符之间' })
  title: string;

  @ApiProperty({ description: '预警内容' })
  @IsString({ message: '预警内容不能为空' })
  content: string;

  @ApiProperty({ description: '预警级别' })
  @IsEnum(WarningSeverity, { message: '预警级别选择不正确' })
  severity: WarningSeverity;

  @ApiPropertyOptional({ description: '来源' })
  @IsOptional()
  @IsString({ message: '来源格式不正确' })
  source?: string;
}

