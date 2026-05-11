import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RecordStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Length } from 'class-validator';

export class CreateMaintenanceDto {
  @ApiProperty({ description: '气瓶ID' })
  @Type(() => Number)
  @IsInt({ message: '请选择气瓶' })
  cylinderId: number;

  @ApiProperty({ description: '保养时间' })
  @IsDateString({}, { message: '保养时间格式不正确' })
  maintainedAt: string;

  @ApiProperty({ description: '维修人员' })
  @IsString({ message: '维修人员不能为空' })
  @Length(2, 64, { message: '维修人员长度需要在 2 到 64 个字符之间' })
  technicianName: string;

  @ApiProperty({ description: '维修内容' })
  @IsString({ message: '维修内容不能为空' })
  content: string;

  @ApiPropertyOptional({ description: '维修结果' })
  @IsOptional()
  @IsString({ message: '维修结果格式不正确' })
  result?: string;

  @ApiPropertyOptional({ description: '下次保养时间' })
  @IsOptional()
  @IsDateString({}, { message: '下次保养时间格式不正确' })
  nextMaintenanceAt?: string;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsEnum(RecordStatus, { message: '状态选择不正确' })
  status?: RecordStatus;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString({ message: '备注格式不正确' })
  remark?: string;
}

