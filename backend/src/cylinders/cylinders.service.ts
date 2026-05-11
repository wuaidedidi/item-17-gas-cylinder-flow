import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/services/prisma.service';
import { BusinessException } from '../common/exceptions/business-exception';
import { buildPagination } from '../common/utils/pagination';
import { CylinderQueryDto } from './dto/cylinder-query.dto';
import { CreateCylinderDto } from './dto/create-cylinder.dto';
import { UpdateCylinderDto } from './dto/update-cylinder.dto';

@Injectable()
export class CylindersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: CylinderQueryDto) {
    const { skip, take, page, pageSize } = buildPagination(query.page, query.pageSize);
    const where: Prisma.CylinderWhereInput = {
      status: query.status,
      OR: query.keyword
        ? [
            { code: { contains: query.keyword } },
            { name: { contains: query.keyword } },
            { gasType: { contains: query.keyword } },
            { warehouseLocation: { contains: query.keyword } },
            { currentHolder: { contains: query.keyword } },
          ]
        : undefined,
    };

    const [total, list] = await this.prisma.$transaction([
      this.prisma.cylinder.count({ where }),
      this.prisma.cylinder.findMany({
        where,
        include: {
          _count: {
            select: {
              inboundRecords: true,
              outboundRecords: true,
              inspectionRecords: true,
              maintenanceRecords: true,
              warnings: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take,
      }),
    ]);

    return { list, total, page, pageSize };
  }

  async detail(id: number) {
    const item = await this.prisma.cylinder.findUnique({
      where: { id },
      include: {
        inboundRecords: { orderBy: { inboundAt: 'desc' }, take: 5 },
        outboundRecords: { orderBy: { outboundAt: 'desc' }, take: 5 },
        inspectionRecords: { orderBy: { inspectedAt: 'desc' }, take: 5 },
        maintenanceRecords: { orderBy: { maintainedAt: 'desc' }, take: 5 },
        warnings: { orderBy: { detectedAt: 'desc' }, take: 5 },
      },
    });
    if (!item) {
      throw new BusinessException('气瓶档案不存在', 20001);
    }
    return item;
  }

  async create(dto: CreateCylinderDto, operatorId: number) {
    const exists = await this.prisma.cylinder.findUnique({ where: { code: dto.code } });
    if (exists) {
      throw new BusinessException('气瓶编码已存在', 20002);
    }

    return this.prisma.cylinder.create({
      data: {
        ...this.mapDtoToData(dto),
        createdById: operatorId,
        updatedById: operatorId,
      },
    });
  }

  async update(id: number, dto: UpdateCylinderDto, operatorId: number) {
    const current = await this.prisma.cylinder.findUnique({ where: { id } });
    if (!current) {
      throw new BusinessException('气瓶档案不存在', 20001);
    }
    if (dto.code && dto.code !== current.code) {
      const exists = await this.prisma.cylinder.findUnique({ where: { code: dto.code } });
      if (exists) {
        throw new BusinessException('气瓶编码已存在', 20002);
      }
    }

    return this.prisma.cylinder.update({
      where: { id },
      data: {
        ...this.mapDtoToData(dto),
        updatedById: operatorId,
      },
    });
  }

  async remove(id: number) {
    const current = await this.prisma.cylinder.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            inboundRecords: true,
            outboundRecords: true,
            inspectionRecords: true,
            maintenanceRecords: true,
            warnings: true,
          },
        },
      },
    });
    if (!current) {
      throw new BusinessException('气瓶档案不存在', 20001);
    }

    const count =
      current._count.inboundRecords +
      current._count.outboundRecords +
      current._count.inspectionRecords +
      current._count.maintenanceRecords +
      current._count.warnings;

    if (count > 0) {
      throw new BusinessException('该气瓶已有流转、巡检、维修或预警记录，无法删除', 20003);
    }

    await this.prisma.cylinder.delete({ where: { id } });
    return true;
  }

  private mapDtoToData(dto: CreateCylinderDto | UpdateCylinderDto): Prisma.CylinderUncheckedCreateInput {
    return {
      code: dto.code as string,
      name: dto.name as string,
      type: dto.type,
      gasType: dto.gasType,
      capacity: dto.capacity,
      pressureLevel: dto.pressureLevel,
      manufacturer: dto.manufacturer,
      serialNo: dto.serialNo,
      warehouseLocation: dto.warehouseLocation,
      currentHolder: dto.currentHolder,
      status: dto.status,
      lastInspectionAt: dto.lastInspectionAt ? new Date(dto.lastInspectionAt) : undefined,
      nextInspectionAt: dto.nextInspectionAt ? new Date(dto.nextInspectionAt) : undefined,
      nextMaintenanceAt: dto.nextMaintenanceAt ? new Date(dto.nextMaintenanceAt) : undefined,
      remark: dto.remark,
    };
  }
}

