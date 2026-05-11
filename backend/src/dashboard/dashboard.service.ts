import { Injectable } from '@nestjs/common';
import { CylinderStatus, WarningStatus } from '@prisma/client';
import { PrismaService } from '../common/services/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const now = new Date();
    const days30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      inStock,
      totalCylinders,
      activeWarnings,
      recentInspections,
      maintenanceInProgress,
      traceQueries,
      recentWarnings,
      recentInspectionsList,
    ] = await this.prisma.$transaction([
      this.prisma.cylinder.count({ where: { status: CylinderStatus.IN_STOCK } }),
      this.prisma.cylinder.count(),
      this.prisma.warning.count({ where: { status: { in: [WarningStatus.OPEN, WarningStatus.PROCESSING] } } }),
      this.prisma.inspectionRecord.count({ where: { inspectedAt: { gte: days30 } } }),
      this.prisma.cylinder.count({ where: { status: CylinderStatus.IN_MAINTENANCE } }),
      this.prisma.traceLog.count(),
      this.prisma.warning.findMany({
        where: { status: { in: [WarningStatus.OPEN, WarningStatus.PROCESSING] } },
        include: { cylinder: true },
        orderBy: { detectedAt: 'desc' },
        take: 5,
      }),
      this.prisma.inspectionRecord.findMany({
        include: { cylinder: true },
        orderBy: { inspectedAt: 'desc' },
        take: 5,
      }),
    ]);

    const inspectionRate = totalCylinders === 0 ? 0 : Math.min(100, Math.round((recentInspections / totalCylinders) * 100));

    return {
      metrics: {
        inStock,
        activeWarnings,
        inspectionRate,
        maintenanceInProgress,
        traceQueries,
        totalCylinders,
      },
      recentWarnings,
      recentInspections: recentInspectionsList,
    };
  }

  async trends() {
    const days = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    const trend: Array<{ date: string; inspections: number; warnings: number; maintenance: number }> = [];
    for (const day of days) {
      const next = new Date(day);
      next.setDate(day.getDate() + 1);
      const [inspections, warnings, maintenance] = await this.prisma.$transaction([
        this.prisma.inspectionRecord.count({ where: { inspectedAt: { gte: day, lt: next } } }),
        this.prisma.warning.count({ where: { detectedAt: { gte: day, lt: next } } }),
        this.prisma.maintenanceRecord.count({ where: { maintainedAt: { gte: day, lt: next } } }),
      ]);
      trend.push({
        date: `${day.getMonth() + 1}/${day.getDate()}`,
        inspections,
        warnings,
        maintenance,
      });
    }

    return trend;
  }
}
