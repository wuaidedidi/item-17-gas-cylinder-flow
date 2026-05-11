import { Injectable } from '@nestjs/common';
import { ApprovalStatus, ApprovalTargetType, CylinderStatus, Prisma, RecordStatus, WarningSeverity, WarningStatus } from '@prisma/client';
import { PrismaService } from '../common/services/prisma.service';
import { BusinessException } from '../common/exceptions/business-exception';
import { buildPagination } from '../common/utils/pagination';
import { RecordQueryDto } from './dto/record-query.dto';
import { CreateInboundDto } from './dto/create-inbound.dto';
import { CreateOutboundDto } from './dto/create-outbound.dto';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';

@Injectable()
export class RecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async listInbound(query: RecordQueryDto) {
    const { skip, take, page, pageSize } = buildPagination(query.page, query.pageSize);
    const where: Prisma.InboundRecordWhereInput = this.buildRecordWhere(query);
    const [total, list] = await this.prisma.$transaction([
      this.prisma.inboundRecord.count({ where }),
      this.prisma.inboundRecord.findMany({
        where,
        include: { cylinder: true, createdBy: { select: { id: true, name: true, username: true } } },
        orderBy: { inboundAt: 'desc' },
        skip,
        take,
      }),
    ]);
    return { list, total, page, pageSize };
  }

  async listOutbound(query: RecordQueryDto) {
    const { skip, take, page, pageSize } = buildPagination(query.page, query.pageSize);
    const where: Prisma.OutboundRecordWhereInput = this.buildRecordWhere(query);
    const [total, list] = await this.prisma.$transaction([
      this.prisma.outboundRecord.count({ where }),
      this.prisma.outboundRecord.findMany({
        where,
        include: { cylinder: true, createdBy: { select: { id: true, name: true, username: true } } },
        orderBy: { outboundAt: 'desc' },
        skip,
        take,
      }),
    ]);
    return { list, total, page, pageSize };
  }

  async listInspection(query: RecordQueryDto) {
    const { skip, take, page, pageSize } = buildPagination(query.page, query.pageSize);
    const where: Prisma.InspectionRecordWhereInput = this.buildRecordWhere(query);
    const [total, list] = await this.prisma.$transaction([
      this.prisma.inspectionRecord.count({ where }),
      this.prisma.inspectionRecord.findMany({
        where,
        include: { cylinder: true, createdBy: { select: { id: true, name: true, username: true } } },
        orderBy: { inspectedAt: 'desc' },
        skip,
        take,
      }),
    ]);
    return { list, total, page, pageSize };
  }

  async listMaintenance(query: RecordQueryDto) {
    const { skip, take, page, pageSize } = buildPagination(query.page, query.pageSize);
    const where: Prisma.MaintenanceRecordWhereInput = this.buildRecordWhere(query);
    const [total, list] = await this.prisma.$transaction([
      this.prisma.maintenanceRecord.count({ where }),
      this.prisma.maintenanceRecord.findMany({
        where,
        include: { cylinder: true, createdBy: { select: { id: true, name: true, username: true } } },
        orderBy: { maintainedAt: 'desc' },
        skip,
        take,
      }),
    ]);
    return { list, total, page, pageSize };
  }

  async createInbound(dto: CreateInboundDto, operatorId: number) {
    const cylinder = await this.ensureCylinder(dto.cylinderId);
    const recordNo = this.buildNo('INB');
    const status = dto.status || RecordStatus.COMPLETED;

    return this.prisma.$transaction(async (tx) => {
      const record = await tx.inboundRecord.create({
        data: {
          recordNo,
          cylinderId: dto.cylinderId,
          inboundAt: new Date(dto.inboundAt),
          sourceLocation: dto.sourceLocation,
          destinationLocation: dto.destinationLocation,
          handlerName: dto.handlerName,
          status,
          remark: dto.remark,
          createdById: operatorId,
        },
      });
      await tx.cylinder.update({
        where: { id: dto.cylinderId },
        data: {
          status: CylinderStatus.IN_STOCK,
          warehouseLocation: dto.destinationLocation || cylinder.warehouseLocation,
          currentHolder: '仓库待发',
          updatedById: operatorId,
        },
      });
      await this.createApproval(tx, ApprovalTargetType.INBOUND, record.id, '入库记录留痕', ApprovalStatus.APPROVED, operatorId, '入库信息已确认');
      return record;
    });
  }

  async createOutbound(dto: CreateOutboundDto, operatorId: number) {
    await this.ensureCylinder(dto.cylinderId);
    const recordNo = this.buildNo('OUT');
    const status = dto.status || RecordStatus.COMPLETED;

    return this.prisma.$transaction(async (tx) => {
      const record = await tx.outboundRecord.create({
        data: {
          recordNo,
          cylinderId: dto.cylinderId,
          outboundAt: new Date(dto.outboundAt),
          targetLocation: dto.targetLocation,
          handlerName: dto.handlerName,
          purpose: dto.purpose,
          status,
          remark: dto.remark,
          createdById: operatorId,
        },
      });
      await tx.cylinder.update({
        where: { id: dto.cylinderId },
        data: {
          status: CylinderStatus.IN_TRANSIT,
          currentHolder: dto.targetLocation || '外发流转中',
          updatedById: operatorId,
        },
      });
      await this.createApproval(tx, ApprovalTargetType.OUTBOUND, record.id, '出库流转留痕', ApprovalStatus.APPROVED, operatorId, '出库信息已确认');
      return record;
    });
  }

  async createInspection(dto: CreateInspectionDto, operatorId: number) {
    const cylinder = await this.ensureCylinder(dto.cylinderId);
    const recordNo = this.buildNo('INS');
    const status = dto.status || RecordStatus.COMPLETED;

    return this.prisma.$transaction(async (tx) => {
      const record = await tx.inspectionRecord.create({
        data: {
          recordNo,
          cylinderId: dto.cylinderId,
          inspectedAt: new Date(dto.inspectedAt),
          inspectorName: dto.inspectorName,
          result: dto.result,
          isAbnormal: dto.isAbnormal,
          issues: dto.issues,
          nextInspectionAt: dto.nextInspectionAt ? new Date(dto.nextInspectionAt) : undefined,
          status,
          remark: dto.remark,
          createdById: operatorId,
        },
      });

      await tx.cylinder.update({
        where: { id: dto.cylinderId },
        data: {
          status: dto.isAbnormal ? CylinderStatus.UNDER_INSPECTION : cylinder.status,
          lastInspectionAt: new Date(dto.inspectedAt),
          nextInspectionAt: dto.nextInspectionAt ? new Date(dto.nextInspectionAt) : cylinder.nextInspectionAt,
          updatedById: operatorId,
        },
      });

      await this.createApproval(tx, ApprovalTargetType.INSPECTION, record.id, '巡检记录留痕', ApprovalStatus.APPROVED, operatorId, dto.isAbnormal ? '巡检异常已进入预警' : '巡检结果正常');

      if (dto.isAbnormal) {
        const rule = await tx.warningRule.findFirst({
          where: { enabled: true, ruleType: 'inspection_due' },
          orderBy: { id: 'asc' },
        });
        const warning = await tx.warning.create({
          data: {
            warningNo: this.buildNo('WARN'),
            cylinderId: dto.cylinderId,
            ruleId: rule?.id,
            title: '巡检异常需要处理',
            content: dto.issues || dto.result || '巡检记录发现异常，请安全员处理',
            severity: rule?.severity || WarningSeverity.HIGH,
            status: WarningStatus.OPEN,
            source: 'inspection',
            createdById: operatorId,
          },
        });
        await this.createApproval(tx, ApprovalTargetType.WARNING, warning.id, '异常预警生成', ApprovalStatus.PENDING, operatorId, '等待安全员处理');
      }

      return record;
    });
  }

  async createMaintenance(dto: CreateMaintenanceDto, operatorId: number) {
    const cylinder = await this.ensureCylinder(dto.cylinderId);
    const recordNo = this.buildNo('MNT');
    const status = dto.status || RecordStatus.COMPLETED;

    return this.prisma.$transaction(async (tx) => {
      const record = await tx.maintenanceRecord.create({
        data: {
          recordNo,
          cylinderId: dto.cylinderId,
          maintainedAt: new Date(dto.maintainedAt),
          technicianName: dto.technicianName,
          content: dto.content,
          result: dto.result,
          nextMaintenanceAt: dto.nextMaintenanceAt ? new Date(dto.nextMaintenanceAt) : undefined,
          status,
          remark: dto.remark,
          createdById: operatorId,
        },
      });

      await tx.cylinder.update({
        where: { id: dto.cylinderId },
        data: {
          status: status === RecordStatus.COMPLETED ? CylinderStatus.IN_STOCK : CylinderStatus.IN_MAINTENANCE,
          nextMaintenanceAt: dto.nextMaintenanceAt ? new Date(dto.nextMaintenanceAt) : cylinder.nextMaintenanceAt,
          updatedById: operatorId,
        },
      });

      await this.createApproval(tx, ApprovalTargetType.MAINTENANCE, record.id, '维修保养留痕', status === RecordStatus.COMPLETED ? ApprovalStatus.APPROVED : ApprovalStatus.PENDING, operatorId, status === RecordStatus.COMPLETED ? '维修保养已完成' : '维修保养处理中');
      return record;
    });
  }

  private buildRecordWhere(query: RecordQueryDto) {
    return {
      cylinderId: query.cylinderId,
      status: query.status,
      OR: query.keyword
        ? [
            { recordNo: { contains: query.keyword } },
            { cylinder: { code: { contains: query.keyword } } },
            { cylinder: { name: { contains: query.keyword } } },
          ]
        : undefined,
    };
  }

  private async ensureCylinder(id: number) {
    const cylinder = await this.prisma.cylinder.findUnique({ where: { id } });
    if (!cylinder) {
      throw new BusinessException('气瓶档案不存在，请先完成编码建档', 30001);
    }
    return cylinder;
  }

  private buildNo(prefix: string) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-8);
    return `${prefix}-${date}-${suffix}`;
  }

  private async createApproval(
    tx: Prisma.TransactionClient,
    targetType: ApprovalTargetType,
    targetId: number,
    action: string,
    status: ApprovalStatus,
    operatorId: number,
    opinion: string,
  ) {
    return tx.approvalLog.create({
      data: {
        approvalNo: this.buildNo('APR'),
        targetType,
        targetId,
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

