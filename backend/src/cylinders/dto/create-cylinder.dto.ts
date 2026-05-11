import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CylinderStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, Length } from 'class-validator';

export class CreateCylinderDto {
  @ApiProperty({ description: '气瓶编码' })
  @IsString({ message: '气瓶编码不能为空' })
  @Length(2, 64, { message: '气瓶编码长度需要在 2 到 64 个字符之间' })
  code: string;

  @ApiProperty({ description: '气瓶名称' })
  @IsString({ message: '气瓶名称不能为空' })
  @Length(2, 128, { message: '气瓶名称长度需要在 2 到 128 个字符之间' })
  name: string;

  @ApiPropertyOptional({ description: '气瓶类型' })
  @IsOptional()
  @IsString({ message: '气瓶类型格式不正确' })
  type?: string;

  @ApiPropertyOptional({ description: '气体类型' })
  @IsOptional()
  @IsString({ message: '气体类型格式不正确' })
  gasType?: string;

  @ApiPropertyOptional({ description: '容量' })
  @IsOptional()
  @IsString({ message: '容量格式不正确' })
  capacity?: string;

  @ApiPropertyOptional({ description: '压力等级' })
  @IsOptional()
  @IsString({ message: '压力等级格式不正确' })
  pressureLevel?: string;

  @ApiPropertyOptional({ description: '制造商' })
  @IsOptional()
  @IsString({ message: '制造商格式不正确' })
  manufacturer?: string;

  @ApiPropertyOptional({ description: '出厂编号' })
  @IsOptional()
  @IsString({ message: '出厂编号格式不正确' })
  serialNo?: string;

  @ApiPropertyOptional({ description: '库位' })
  @IsOptional()
  @IsString({ message: '库位格式不正确' })
  warehouseLocation?: string;

  @ApiPropertyOptional({ description: '当前责任方' })
  @IsOptional()
  @IsString({ message: '当前责任方格式不正确' })
  currentHolder?: string;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsEnum(CylinderStatus, { message: '气瓶状态选择不正确' })
  status?: CylinderStatus;

  @ApiPropertyOptional({ description: '上次巡检时间' })
  @IsOptional()
  @IsDateString({}, { message: '上次巡检时间格式不正确' })
  lastInspectionAt?: string;

  @ApiPropertyOptional({ description: '下次巡检时间' })
  @IsOptional()
  @IsDateString({}, { message: '下次巡检时间格式不正确' })
  nextInspectionAt?: string;

  @ApiPropertyOptional({ description: '下次保养时间' })
  @IsOptional()
  @IsDateString({}, { message: '下次保养时间格式不正确' })
  nextMaintenanceAt?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString({ message: '备注格式不正确' })
  remark?: string;
}

