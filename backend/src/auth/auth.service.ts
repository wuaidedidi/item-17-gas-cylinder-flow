import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../common/services/prisma.service';
import { PasswordService } from '../common/services/password.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { BusinessException } from '../common/exceptions/business-exception';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { username: dto.username } });
    if (exists) {
      throw new BusinessException('用户名已存在', 10001);
    }

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        password: this.passwordService.hash(dto.password),
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        remark: dto.remark,
        role: UserRole.GENERAL_USER,
        status: UserStatus.ACTIVE,
      },
    });

    return this.toSafeUser(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { username: dto.username } });
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('账号已被禁用，请联系管理员');
    }
    if (!this.passwordService.verify(dto.password, user.password)) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const token = this.jwtService.sign({
      sub: String(user.id),
      username: user.username,
      role: user.role,
    });

    return {
      token,
      user: this.toSafeUser(user),
    };
  }

  async me(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('登录已过期，请重新登录');
    }
    return this.toSafeUser(user);
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        remark: dto.remark,
      },
    });
    return this.toSafeUser(user);
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('登录已过期，请重新登录');
    }
    if (!this.passwordService.verify(dto.oldPassword, user.password)) {
      throw new BusinessException('原密码不正确', 10002);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: this.passwordService.hash(dto.newPassword),
      },
    });

    return true;
  }

  private toSafeUser(user: {
    id: number;
    username: string;
    name: string;
    phone: string | null;
    email: string | null;
    role: UserRole;
    status: UserStatus;
    remark: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      status: user.status,
      remark: user.remark,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

