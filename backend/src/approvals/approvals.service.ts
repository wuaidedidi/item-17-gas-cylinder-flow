import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/services/prisma.service';
import { buildPagination } from '../common/utils/pagination';
import { ApprovalQueryDto } from './dto/approval-query.dto';

@Injectable()
export class ApprovalsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ApprovalQueryDto) {
    const { skip, take, page, pageSize } = buildPagination(query.page, query.pageSize);
    const where: Prisma.ApprovalLogWhereInput = {
      status: query.status,
      targetType: query.targetType,
      OR: query.keyword
        ? [
            { approvalNo: { contains: query.keyword } },
            { action: { contains: query.keyword } },
            { opinion: { contains: query.keyword } },
          ]
        : undefined,
    };

    const [total, list] = await this.prisma.$transaction([
      this.prisma.approvalLog.count({ where }),
      this.prisma.approvalLog.findMany({
        where,
        include: {
          approver: { select: { id: true, name: true, username: true } },
          createdBy: { select: { id: true, name: true, username: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    return { list, total, page, pageSize };
  }
}

