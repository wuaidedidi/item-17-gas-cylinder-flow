import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WarningStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class HandleWarningDto {
  @ApiProperty({ description: '处理后的状态' })
  @IsEnum(WarningStatus, { message: '预警状态选择不正确' })
  status: WarningStatus;

  @ApiPropertyOptional({ description: '处理意见' })
  @IsOptional()
  @IsString({ message: '处理意见格式不正确' })
  resolvedRemark?: string;
}

