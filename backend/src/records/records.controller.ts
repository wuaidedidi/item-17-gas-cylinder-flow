import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ok } from '../common/api-response';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { RecordsService } from './records.service';
import { RecordQueryDto } from './dto/record-query.dto';
import { CreateInboundDto } from './dto/create-inbound.dto';
import { CreateOutboundDto } from './dto/create-outbound.dto';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';

@ApiTags('流转巡检维修')
@Controller('records')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Get('inbound')
  async listInbound(@Query() query: RecordQueryDto) {
    return ok(await this.recordsService.listInbound(query));
  }

  @Post('inbound')
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER)
  async createInbound(@Body() dto: CreateInboundDto, @CurrentUser() user: { id: number }) {
    return ok(await this.recordsService.createInbound(dto, user.id), '入库记录已创建');
  }

  @Get('outbound')
  async listOutbound(@Query() query: RecordQueryDto) {
    return ok(await this.recordsService.listOutbound(query));
  }

  @Post('outbound')
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER)
  async createOutbound(@Body() dto: CreateOutboundDto, @CurrentUser() user: { id: number }) {
    return ok(await this.recordsService.createOutbound(dto, user.id), '出库记录已创建');
  }

  @Get('inspection')
  async listInspection(@Query() query: RecordQueryDto) {
    return ok(await this.recordsService.listInspection(query));
  }

  @Post('inspection')
  @Roles(UserRole.ADMIN, UserRole.SAFETY_OFFICER, UserRole.INSPECTOR)
  async createInspection(@Body() dto: CreateInspectionDto, @CurrentUser() user: { id: number }) {
    return ok(await this.recordsService.createInspection(dto, user.id), '巡检记录已创建');
  }

  @Get('maintenance')
  async listMaintenance(@Query() query: RecordQueryDto) {
    return ok(await this.recordsService.listMaintenance(query));
  }

  @Post('maintenance')
  @Roles(UserRole.ADMIN, UserRole.SAFETY_OFFICER)
  async createMaintenance(@Body() dto: CreateMaintenanceDto, @CurrentUser() user: { id: number }) {
    return ok(await this.recordsService.createMaintenance(dto, user.id), '维修保养记录已创建');
  }
}

