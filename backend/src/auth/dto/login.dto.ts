import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: '用户名' })
  @IsString({ message: '用户名不能为空' })
  @Length(2, 64, { message: '用户名长度需要在 2 到 64 个字符之间' })
  username: string;

  @ApiProperty({ description: '密码' })
  @IsString({ message: '密码不能为空' })
  @Length(6, 32, { message: '密码长度需要在 6 到 32 个字符之间' })
  password: string;
}

