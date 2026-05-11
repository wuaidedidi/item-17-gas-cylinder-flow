import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RecordStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Length } from 'class-validator';

export class CreateOutboundDto {
  @ApiProperty({ description: '气瓶ID' })
  @Type(() => Number)
  @IsInt({ message: '请选择气瓶' })
  cylinderId: number;

  @ApiProperty({ description: '出库时间' })
  @IsDateString({}, { message: '出库时间格式不正确' })
  outboundAt: string;

  @ApiPropertyOptional({ description: '目标地点' })
  @IsOptional()
  @IsString({ message: '目标地点格式不正确' })
  targetLocation?: string;

  @ApiProperty({ description: '经办人' })
  @IsString({ message: '经办人不能为空' })
  @Length(2, 64, { message: '经办人长度需要在 2 到 64 个字符之间' })
  handlerName: string;

  @ApiPropertyOptional({ description: '用途' })
  @IsOptional()
  @IsString({ message: '用途格式不正确' })
  purpose?: string;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsEnum(RecordStatus, { message: '状态选择不正确' })
  status?: RecordStatus;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString({ message: '备注格式不正确' })
  remark?: string;
}

