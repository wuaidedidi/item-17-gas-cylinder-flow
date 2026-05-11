import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RecordStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Length } from 'class-validator';

export class CreateInboundDto {
  @ApiProperty({ description: '气瓶ID' })
  @Type(() => Number)
  @IsInt({ message: '请选择气瓶' })
  cylinderId: number;

  @ApiProperty({ description: '入库时间' })
  @IsDateString({}, { message: '入库时间格式不正确' })
  inboundAt: string;

  @ApiPropertyOptional({ description: '来源地点' })
  @IsOptional()
  @IsString({ message: '来源地点格式不正确' })
  sourceLocation?: string;

  @ApiPropertyOptional({ description: '目标库位' })
  @IsOptional()
  @IsString({ message: '目标库位格式不正确' })
  destinationLocation?: string;

  @ApiProperty({ description: '经办人' })
  @IsString({ message: '经办人不能为空' })
  @Length(2, 64, { message: '经办人长度需要在 2 到 64 个字符之间' })
  handlerName: string;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsEnum(RecordStatus, { message: '状态选择不正确' })
  status?: RecordStatus;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString({ message: '备注格式不正确' })
  remark?: string;
}

