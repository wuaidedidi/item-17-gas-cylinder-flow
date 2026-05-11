import { Injectable } from '@nestjs/common';
import { Prisma, TraceQuerySource } from '@prisma/client';
import { PrismaService } from '../common/services/prisma.service';
import { buildPagination } from '../common/utils/pagination';
import { TraceSearchDto } from './dto/trace-search.dto';
import { TraceLogQueryDto } from './dto/trace-log-query.dto';

@Injectable()
export class TraceService {
  constructor(private readonly prisma: PrismaService) {}

  async search(dto: TraceSearchDto, operator: { id: number; username: string }) {
    const keyword = dto.keyword.trim();
    const cylinder = await this.prisma.cylinder.findFirst({
      where: {
        OR: [
          { code: { equals: keyword } },
          { code: { contains: keyword } },
          { name: { contains: keyword } },
          { serialNo: { contains: keyword } },
        ],
      },
      include: {
        inboundRecords: true,
        outboundRecords: true,
        inspectionRecords: true,
        maintenanceRecords: true,
        warnings: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!cylinder) {
      await this.prisma.traceLog.create({
        data: {
          cylinderCode: keyword,
          queryKeyword: keyword,
          traceType: '责任追踪查询',
          querySource: dto.source || TraceQuerySource.MANUAL,
          resultSummary: '未找到对应气瓶档案',
          operatorName: operator.username,
          createdById: operator.id,
        },
      });
      return {
        found: false,
        keyword,
        message: '未找到对应气瓶，请检查编码是否正确',
        timeline: [],
      };
    }

    const timeline = [
      ...cylinder.inboundRecords.map((item) => ({
        type: '入库',
        time: item.inboundAt,
        title: item.recordNo,
        description: `${item.handlerName} 将气瓶入库至 ${item.destinationLocation || cylinder.warehouseLocation || '未登记库位'}`,
        status: item.status,
      })),
      ...cylinder.outboundRecords.map((item) => ({
        type: '出库',
        time: item.outboundAt,
        title: item.recordNo,
        description: `${item.handlerName} 将气瓶流转至 ${item.targetLocation || '未登记地点'}`,
        status: item.status,
      })),
      ...cylinder.inspectionRecords.map((item) => ({
        type: '巡检',
        time: item.inspectedAt,
        title: item.recordNo,
        description: item.isAbnormal ? `异常：${item.issues || item.result}` : item.result,
        status: item.status,
      })),
      ...cylinder.maintenanceRecords.map((item) => ({
        type: '维修',
        time: item.maintainedAt,
        title: item.recordNo,
        description: item.content,
        status: item.status,
      })),
      ...cylinder.warnings.map((item) => ({
        type: '预警',
        time: item.detectedAt,
        title: item.warningNo,
        description: item.content,
        status: item.status,
      })),
    ].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    await this.prisma.traceLog.create({
      data: {
        cylinderId: cylinder.id,
        cylinderCode: cylinder.code,
        queryKeyword: keyword,
        traceType: '责任追踪查询',
        querySource: dto.source || TraceQuerySource.MANUAL,
        resultSummary: `找到 ${timeline.length} 条生命周期记录`,
        operatorName: operator.username,
        createdById: operator.id,
      },
    });

    return {
      found: true,
      keyword,
      cylinder,
      timeline,
    };
  }

  async logs(query: TraceLogQueryDto) {
    const { skip, take, page, pageSize } = buildPagination(query.page, query.pageSize);
    const where: Prisma.TraceLogWhereInput = {
      OR: query.keyword
        ? [
            { cylinderCode: { contains: query.keyword } },
            { queryKeyword: { contains: query.keyword } },
            { resultSummary: { contains: query.keyword } },
          ]
        : undefined,
    };
    const [total, list] = await this.prisma.$transaction([
      this.prisma.traceLog.count({ where }),
      this.prisma.traceLog.findMany({
        where,
        include: {
          cylinder: true,
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

