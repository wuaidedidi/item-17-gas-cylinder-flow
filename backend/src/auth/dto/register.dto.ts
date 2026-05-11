import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Length, Matches } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: '用户名' })
  @IsString({ message: '用户名不能为空' })
  @Length(2, 64, { message: '用户名长度需要在 2 到 64 个字符之间' })
  username: string;

  @ApiProperty({ description: '密码' })
  @IsString({ message: '密码不能为空' })
  @Length(6, 32, { message: '密码长度需要在 6 到 32 个字符之间' })
  password: string;

  @ApiProperty({ description: '姓名' })
  @IsString({ message: '姓名不能为空' })
  @Length(2, 64, { message: '姓名长度需要在 2 到 64 个字符之间' })
  name: string;

  @ApiProperty({ description: '手机号', required: false })
  @Transform(({ value }) => (value === '' ? null : value))
  @IsOptional()
  @Matches(/^1\d{10}$/, { message: '手机号格式不正确' })
  phone?: string;

  @ApiProperty({ description: '邮箱', required: false })
  @Transform(({ value }) => (value === '' ? null : value))
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString({ message: '备注格式不正确' })
  remark?: string;
}
