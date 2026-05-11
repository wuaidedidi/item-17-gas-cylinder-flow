import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: '姓名' })
  @IsOptional()
  @IsString({ message: '姓名格式不正确' })
  @Length(2, 64, { message: '姓名长度需要在 2 到 64 个字符之间' })
  name?: string;

  @ApiPropertyOptional({ description: '手机号' })
  @Transform(({ value }) => (value === '' ? null : value))
  @IsOptional()
  @Matches(/^1\d{10}$/, { message: '手机号格式不正确' })
  phone?: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @Transform(({ value }) => (value === '' ? null : value))
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @ApiPropertyOptional({ description: '角色' })
  @IsOptional()
  @IsEnum(UserRole, { message: '角色选择不正确' })
  role?: UserRole;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsEnum(UserStatus, { message: '状态选择不正确' })
  status?: UserStatus;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString({ message: '备注格式不正确' })
  remark?: string;
}
