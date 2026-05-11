import { Injectable } from '@nestjs/common';
import { ApprovalStatus, ApprovalTargetType, Prisma, WarningStatus } from '@prisma/client';
import { PrismaService } from '../common/services/prisma.service';
import { BusinessException } from '../common/exceptions/business-exception';
import { buildPagination } from '../common/utils/pagination';
import { WarningQueryDto } from './dto/warning-query.dto';
import { CreateWarningDto } from './dto/create-warning.dto';
import { HandleWarningDto } from './dto/handle-warning.dto';
import { CreateWarningRuleDto } from './dto/create-warning-rule.dto';
import { UpdateWarningRuleDto } from './dto/update-warning-rule.dto';

@Injectable()
export class WarningsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: WarningQueryDto) {
    const { skip, take, page, pageSize } = buildPagination(query.page, query.pageSize);
    const where: Prisma.WarningWhereInput = {
      status: query.status,
      severity: query.severity,
      OR: query.keyword
        ? [
            { warningNo: { contains: query.keyword } },
            { title: { contains: query.keyword } },
            { content: { contains: query.keyword } },
            { cylinder: { code: { contains: query.keyword } } },
            { cylinder: { name: { contains: query.keyword } } },
          ]
        : undefined,
    };
    const [total, list] = await this.prisma.$transaction([
      this.prisma.warning.count({ where }),
      this.prisma.warning.findMany({
        where,
        include: {
          cylinder: true,
          rule: true,
          handledBy: { select: { id: true, name: true, username: true } },
          createdBy: { select: { id: true, name: true, username: true } },
        },
        orderBy: { detectedAt: 'desc' },
        skip,
        take,
      }),
    ]);

    return { list, total, page, pageSize };
  }

  async create(dto: CreateWarningDto, operatorId: number) {
    if (dto.cylinderId) {
      const cylinder = await this.prisma.cylinder.findUnique({ where: { id: dto.cylinderId } });
      if (!cylinder) {
        throw new BusinessException('气瓶档案不存在，无法创建预警', 40001);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const warning = await tx.warning.create({
        data: {
          warningNo: this.buildNo('WARN'),
          cylinderId: dto.cylinderId,
          title: dto.title,
          content: dto.content,
          severity: dto.severity,
          status: WarningStatus.OPEN,
          source: dto.source || 'manual',
          createdById: operatorId,
        },
      });
      await this.createApproval(tx, warning.id, '人工预警创建', ApprovalStatus.PENDING, operatorId, '等待安全员处理');
      return warning;
    });
  }

  async handle(id: number, dto: HandleWarningDto, operatorId: number) {
    const warning = await this.prisma.warning.findUnique({ where: { id } });
    if (!warning) {
      throw new BusinessException('预警记录不存在', 40002);
    }
    if (warning.status === WarningStatus.CLOSED) {
      throw new BusinessException('该预警已关闭，无需重复处理', 40003);
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.warning.update({
        where: { id },
        data: {
          status: dto.status,
          handledById: operatorId,
          handledAt: dto.status === WarningStatus.CLOSED ? new Date() : undefined,
          resolvedRemark: dto.resolvedRemark,
        },
      });
      await this.createApproval(
        tx,
        id,
        dto.status === WarningStatus.CLOSED ? '预警关闭留痕' : '预警处理中留痕',
        dto.status === WarningStatus.CLOSED ? ApprovalStatus.APPROVED : ApprovalStatus.PENDING,
        operatorId,
        dto.resolvedRemark || '安全员已处理预警',
      );
      return updated;
    });
  }

  async listRules(query: WarningQueryDto) {
    const { skip, take, page, pageSize } = buildPagination(query.page, query.pageSize);
    const where: Prisma.WarningRuleWhereInput = {
      severity: query.severity,
      OR: query.keyword
        ? [
            { ruleName: { contains: query.keyword } },
            { ruleType: { contains: query.keyword } },
            { description: { contains: query.keyword } },
          ]
        : undefined,
    };

    const [total, list] = await this.prisma.$transaction([
      this.prisma.warningRule.count({ where }),
      this.prisma.warningRule.findMany({
        where,
        include: { _count: { select: { warnings: true } } },
        orderBy: { updatedAt: 'desc' },
        skip,
        take,
      }),
    ]);

    return { list, total, page, pageSize };
  }

  async createRule(dto: CreateWarningRuleDto, operatorId: number) {
    return this.prisma.warningRule.create({
      data: {
        ...dto,
        enabled: dto.enabled ?? true,
        createdById: operatorId,
      },
    });
  }

  async updateRule(id: number, dto: UpdateWarningRuleDto) {
    const rule = await this.prisma.warningRule.findUnique({ where: { id } });
    if (!rule) {
      throw new BusinessException('预警规则不存在', 40004);
    }
    return this.prisma.warningRule.update({
      where: { id },
      data: dto,
    });
  }

  async removeRule(id: number) {
    const rule = await this.prisma.warningRule.findUnique({
      where: { id },
      include: { _count: { select: { warnings: true } } },
    });
    if (!rule) {
      throw new BusinessException('预警规则不存在', 40004);
    }
    if (rule._count.warnings > 0) {
      throw new BusinessException(`该规则已生成 ${rule._count.warnings} 条预警，无法删除`, 40005);
    }
    await this.prisma.warningRule.delete({ where: { id } });
    return true;
  }

  private buildNo(prefix: string) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-8);
    return `${prefix}-${date}-${suffix}`;
  }

  private async createApproval(
    tx: Prisma.TransactionClient,
    warningId: number,
    action: string,
    status: ApprovalStatus,
    operatorId: number,
    opinion: string,
  ) {
    return tx.approvalLog.create({
      data: {
        approvalNo: this.buildNo('APR'),
        targetType: ApprovalTargetType.WARNING,
        targetId: warningId,
        action,
        status,
        opinion,
        approverId: status === ApprovalStatus.APPROVED ? operatorId : undefined,
        createdById: operatorId,
        approvedAt: status === ApprovalStatus.APPROVED ? new Date() : undefined,
      },
    });
  }
}

