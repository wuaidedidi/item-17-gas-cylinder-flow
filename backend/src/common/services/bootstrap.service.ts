import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApprovalStatus, ApprovalTargetType, CylinderStatus, Prisma, RecordStatus, TraceQuerySource, UserRole, UserStatus, WarningSeverity, WarningStatus } from '@prisma/client';
import { PrismaService } from './prisma.service';
import { PasswordService } from './password.service';

@Injectable()
export class BootstrapService {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
  ) {}

  async waitForDatabase(maxRetries = 60, delayMs = 2000) {
    for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
      try {
        await this.prisma.$connect();
        this.logger.log('数据库连接已建立');
        return;
      } catch (error) {
        this.logger.warn(`等待数据库可用中，第 ${attempt} 次重试`);
        if (attempt === maxRetries) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  async ensureSystemData() {
    await this.ensureAdminAccount();
    await this.seedReferenceData();
    this.logger.log('基础演示数据已就绪');
  }

  private async ensureAdminAccount() {
    const adminPassword = this.passwordService.hash('123456');
    const admin = await this.prisma.user.findUnique({ where: { username: 'admin' } });

    if (!admin) {
      await this.prisma.user.create({
        data: {
          username: 'admin',
          password: adminPassword,
          name: '系统管理员',
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
        },
      });
      return;
    }

    const needUpdate =
      admin.role !== UserRole.ADMIN ||
      admin.status !== UserStatus.ACTIVE ||
      !this.passwordService.verify('123456', admin.password);

    if (needUpdate) {
      await this.prisma.user.update({
        where: { id: admin.id },
        data: {
          password: adminPassword,
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
          name: admin.name || '系统管理员',
        },
      });
    }
  }

  private async seedReferenceData() {
    const userCount = await this.prisma.user.count();
    if (userCount === 1) {
      const password = this.passwordService.hash('123456');
      const demoUsers = [
        {
          username: 'warehouse',
          name: '仓库管理员',
          role: UserRole.WAREHOUSE_MANAGER,
        },
        {
          username: 'safety',
          name: '安全员',
          role: UserRole.SAFETY_OFFICER,
        },
        {
          username: 'inspector',
          name: '巡检员',
          role: UserRole.INSPECTOR,
        },
        {
          username: 'guest',
          name: '普通用户',
          role: UserRole.GENERAL_USER,
        },
      ];

      for (const item of demoUsers) {
        await this.prisma.user.upsert({
          where: { username: item.username },
          update: {},
          create: {
            username: item.username,
            password,
            name: item.name,
            role: item.role,
            status: UserStatus.ACTIVE,
          },
        });
      }
    }

    const cylinderCount = await this.prisma.cylinder.count();
    if (cylinderCount === 0) {
      const admin = await this.prisma.user.findUnique({ where: { username: 'admin' } });
      const inspector = await this.prisma.user.findUnique({ where: { username: 'inspector' } });
      const safety = await this.prisma.user.findUnique({ where: { username: 'safety' } });
      const warehouse = await this.prisma.user.findUnique({ where: { username: 'warehouse' } });

      const cylinders = await this.prisma.cylinder.createMany({
        data: [
          {
            code: 'CYL-20260509-001',
            name: '乙炔气瓶',
            type: '钢瓶',
            gasType: '乙炔',
            capacity: '40L',
            pressureLevel: '1.6MPa',
            manufacturer: '华东容器制造',
            serialNo: 'SN-A20260509-001',
            warehouseLocation: 'A区-01排-03位',
            currentHolder: '仓库待发',
            status: CylinderStatus.IN_STOCK,
            remark: '演示数据：用于入库与巡检流程演示',
            createdById: admin?.id,
            updatedById: admin?.id,
          },
          {
            code: 'CYL-20260509-002',
            name: '氧气气瓶',
            type: '钢瓶',
            gasType: '氧气',
            capacity: '45L',
            pressureLevel: '15MPa',
            manufacturer: '南方特种设备厂',
            serialNo: 'SN-O20260509-002',
            warehouseLocation: 'B区-04排-09位',
            currentHolder: '车间一线',
            status: CylinderStatus.IN_TRANSIT,
            remark: '演示数据：带有流转轨迹',
            createdById: warehouse?.id,
            updatedById: warehouse?.id,
          },
          {
            code: 'CYL-20260509-003',
            name: '氮气气瓶',
            type: '钢瓶',
            gasType: '氮气',
            capacity: '50L',
            pressureLevel: '15MPa',
            manufacturer: '东部压力容器',
            serialNo: 'SN-N20260509-003',
            warehouseLocation: 'C区-02排-01位',
            currentHolder: '维修待检',
            status: CylinderStatus.IN_MAINTENANCE,
            remark: '演示数据：用于维修流程和预警处理',
            createdById: safety?.id,
            updatedById: safety?.id,
          },
        ],
      });

      const [cyl1, cyl2, cyl3] = await this.prisma.cylinder.findMany({ orderBy: { id: 'asc' } });
      await this.prisma.warningRule.createMany({
        data: [
          {
            ruleName: '巡检超期预警',
            ruleType: 'inspection_due',
            thresholdValue: 30,
            severity: WarningSeverity.HIGH,
            enabled: true,
            description: '超过30天未巡检的气瓶自动进入高风险预警',
            createdById: admin?.id,
          },
          {
            ruleName: '维修超期预警',
            ruleType: 'maintenance_due',
            thresholdValue: 60,
            severity: WarningSeverity.MEDIUM,
            enabled: true,
            description: '超过60天未完成维护的气瓶进入中风险预警',
            createdById: admin?.id,
          },
        ],
      });

      const rule = await this.prisma.warningRule.findFirst({ orderBy: { id: 'asc' } });

      await this.prisma.inboundRecord.create({
        data: {
          recordNo: 'INB-20260509-001',
          cylinderId: cyl1.id,
          inboundAt: new Date('2026-05-01T08:00:00.000Z'),
          sourceLocation: '供应商仓库',
          destinationLocation: 'A区仓储中心',
          handlerName: '张仓库',
          status: RecordStatus.COMPLETED,
          remark: '首次入库记录',
          createdById: admin?.id,
        },
      });

      await this.prisma.outboundRecord.create({
        data: {
          recordNo: 'OUT-20260509-001',
          cylinderId: cyl2.id,
          outboundAt: new Date('2026-05-03T10:30:00.000Z'),
          targetLocation: '车间装配线',
          handlerName: '李仓库',
          purpose: '设备供气',
          status: RecordStatus.COMPLETED,
          remark: '已完成出库流转',
          createdById: warehouse?.id,
        },
      });

      await this.prisma.inspectionRecord.create({
        data: {
          recordNo: 'INS-20260509-001',
          cylinderId: cyl3.id,
          inspectedAt: new Date('2026-05-05T11:30:00.000Z'),
          inspectorName: '王巡检',
          result: '发现阀门轻微磨损',
          isAbnormal: true,
          issues: '阀门外观存在细微划痕，建议复检',
          nextInspectionAt: new Date('2026-06-05T00:00:00.000Z'),
          status: RecordStatus.COMPLETED,
          remark: '已生成预警',
          createdById: inspector?.id,
        },
      });

      await this.prisma.maintenanceRecord.create({
        data: {
          recordNo: 'MNT-20260509-001',
          cylinderId: cyl3.id,
          maintainedAt: new Date('2026-05-06T09:00:00.000Z'),
          technicianName: '赵维修',
          content: '更换阀门密封圈并完成气密测试',
          result: '已修复',
          nextMaintenanceAt: new Date('2026-07-06T00:00:00.000Z'),
          status: RecordStatus.COMPLETED,
          remark: '维修完成，可恢复使用',
          createdById: safety?.id,
        },
      });

      await this.prisma.warning.create({
        data: {
          warningNo: 'WARN-20260509-001',
          cylinderId: cyl3.id,
          ruleId: rule?.id,
          title: '巡检异常需要复核',
          content: '巡检记录发现阀门磨损，需安全员完成复核并留痕',
          severity: WarningSeverity.HIGH,
          status: WarningStatus.PROCESSING,
          source: 'inspection',
          detectedAt: new Date('2026-05-05T11:40:00.000Z'),
          createdById: inspector?.id,
        },
      });

      await this.prisma.traceLog.create({
        data: {
          cylinderId: cyl1.id,
          cylinderCode: cyl1.code,
          queryKeyword: cyl1.code,
          traceType: '首次建档查询',
          querySource: TraceQuerySource.LIST,
          resultSummary: '完成入库建档，当前状态为在库。',
          operatorName: admin?.name,
          createdById: admin?.id,
        },
      });

      await this.prisma.approvalLog.createMany({
        data: [
          {
            approvalNo: 'APR-20260509-001',
            targetType: ApprovalTargetType.INBOUND,
            targetId: 1,
            action: '入库记录留痕',
            status: ApprovalStatus.APPROVED,
            opinion: '已确认入库信息完整',
            approverId: admin?.id,
            createdById: admin?.id,
            approvedAt: new Date('2026-05-01T09:00:00.000Z'),
          },
          {
            approvalNo: 'APR-20260509-002',
            targetType: ApprovalTargetType.WARNING,
            targetId: 1,
            action: '预警处理留痕',
            status: ApprovalStatus.PENDING,
            opinion: '等待安全员复核',
            createdById: inspector?.id,
          },
        ],
      });
    }
  }
}

