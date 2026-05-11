import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RecordStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, Length } from 'class-validator';

export class CreateInspectionDto {
  @ApiProperty({ description: '气瓶ID' })
  @Type(() => Number)
  @IsInt({ message: '请选择气瓶' })
  cylinderId: number;

  @ApiProperty({ description: '巡检时间' })
  @IsDateString({}, { message: '巡检时间格式不正确' })
  inspectedAt: string;

  @ApiProperty({ description: '巡检员' })
  @IsString({ message: '巡检员不能为空' })
  @Length(2, 64, { message: '巡检员长度需要在 2 到 64 个字符之间' })
  inspectorName: string;

  @ApiProperty({ description: '巡检结果' })
  @IsString({ message: '巡检结果不能为空' })
  result: string;

  @ApiProperty({ description: '是否异常' })
  @Type(() => Boolean)
  @IsBoolean({ message: '异常状态格式不正确' })
  isAbnormal: boolean;

  @ApiPropertyOptional({ description: '异常描述' })
  @IsOptional()
  @IsString({ message: '异常描述格式不正确' })
  issues?: string;

  @ApiPropertyOptional({ description: '下次巡检时间' })
  @IsOptional()
  @IsDateString({}, { message: '下次巡检时间格式不正确' })
  nextInspectionAt?: string;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsEnum(RecordStatus, { message: '状态选择不正确' })
  status?: RecordStatus;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString({ message: '备注格式不正确' })
  remark?: string;
}

