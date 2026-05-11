import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WarningSeverity } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateWarningRuleDto {
  @ApiProperty({ description: '规则名称' })
  @IsString({ message: '规则名称不能为空' })
  @Length(2, 128, { message: '规则名称长度需要在 2 到 128 个字符之间' })
  ruleName: string;

  @ApiProperty({ description: '规则类型' })
  @IsString({ message: '规则类型不能为空' })
  ruleType: string;

  @ApiProperty({ description: '阈值' })
  @Type(() => Number)
  @IsInt({ message: '阈值必须是整数' })
  @Min(1, { message: '阈值不能小于 1' })
  thresholdValue: number;

  @ApiProperty({ description: '预警级别' })
  @IsEnum(WarningSeverity, { message: '预警级别选择不正确' })
  severity: WarningSeverity;

  @ApiPropertyOptional({ description: '是否启用' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: '启用状态格式不正确' })
  enabled?: boolean;

  @ApiPropertyOptional({ description: '规则说明' })
  @IsOptional()
  @IsString({ message: '规则说明格式不正确' })
  description?: string;
}

