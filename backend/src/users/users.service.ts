import { Injectable, ForbiddenException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../common/services/prisma.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { buildPagination } from '../common/utils/pagination';
import { UpdateUserDto } from './dto/update-user.dto';
import { BusinessException } from '../common/exceptions/business-exception';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: PaginationQueryDto & { role?: UserRole }) {
    const { skip, take, page, pageSize } = buildPagination(query.page, query.pageSize);
    const where: Prisma.UserWhereInput = {
      OR: query.keyword
        ? [
            { username: { contains: query.keyword } },
            { name: { contains: query.keyword } },
            { phone: { contains: query.keyword } },
            { email: { contains: query.keyword } },
          ]
        : undefined,
      role: query.role,
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { id: 'desc' },
        skip,
        take,
      }),
    ]);

    return {
      list: items.map((user) => this.toSafeUser(user)),
      total,
      page,
      pageSize,
    };
  }

  async detail(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new BusinessException('用户不存在', 10003);
    }
    return this.toSafeUser(user);
  }

  async update(id: number, dto: UpdateUserDto, operatorId: number) {
    if (id === operatorId) {
      if (dto.role && dto.role !== UserRole.ADMIN) {
        throw new BusinessException('不能修改自己的角色', 10004);
      }
      if (dto.status && dto.status !== 'ACTIVE') {
        throw new BusinessException('不能修改自己的状态', 10005);
      }
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new BusinessException('用户不存在', 10003);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        role: dto.role,
        status: dto.status,
        remark: dto.remark,
      },
    });
    return this.toSafeUser(updated);
  }

  private toSafeUser(user: {
    id: number;
    username: string;
    name: string;
    phone: string | null;
    email: string | null;
    role: UserRole;
    status: string;
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

