import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: '原密码' })
  @IsString({ message: '原密码不能为空' })
  @Length(6, 32, { message: '原密码长度需要在 6 到 32 个字符之间' })
  oldPassword: string;

  @ApiProperty({ description: '新密码' })
  @IsString({ message: '新密码不能为空' })
  @Length(6, 32, { message: '新密码长度需要在 6 到 32 个字符之间' })
  newPassword: string;
}

