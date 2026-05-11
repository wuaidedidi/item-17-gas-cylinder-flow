import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ok } from '../common/api-response';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { WarningsService } from './warnings.service';
import { WarningQueryDto } from './dto/warning-query.dto';
import { CreateWarningDto } from './dto/create-warning.dto';
import { HandleWarningDto } from './dto/handle-warning.dto';
import { CreateWarningRuleDto } from './dto/create-warning-rule.dto';
import { UpdateWarningRuleDto } from './dto/update-warning-rule.dto';

@ApiTags('风险预警')
@Controller('warnings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class WarningsController {
  constructor(private readonly warningsService: WarningsService) {}

  @Get()
  async list(@Query() query: WarningQueryDto) {
    return ok(await this.warningsService.list(query));
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SAFETY_OFFICER)
  async create(@Body() dto: CreateWarningDto, @CurrentUser() user: { id: number }) {
    return ok(await this.warningsService.create(dto, user.id), '预警已创建');
  }

  @Patch(':id/handle')
  @Roles(UserRole.ADMIN, UserRole.SAFETY_OFFICER)
  async handle(@Param('id') id: string, @Body() dto: HandleWarningDto, @CurrentUser() user: { id: number }) {
    return ok(await this.warningsService.handle(Number(id), dto, user.id), '预警处理已留痕');
  }

  @Get('rules/list')
  @Roles(UserRole.ADMIN, UserRole.SAFETY_OFFICER)
  async listRules(@Query() query: WarningQueryDto) {
    return ok(await this.warningsService.listRules(query));
  }

  @Post('rules')
  @Roles(UserRole.ADMIN, UserRole.SAFETY_OFFICER)
  async createRule(@Body() dto: CreateWarningRuleDto, @CurrentUser() user: { id: number }) {
    return ok(await this.warningsService.createRule(dto, user.id), '预警规则已创建');
  }

  @Patch('rules/:id')
  @Roles(UserRole.ADMIN, UserRole.SAFETY_OFFICER)
  async updateRule(@Param('id') id: string, @Body() dto: UpdateWarningRuleDto) {
    return ok(await this.warningsService.updateRule(Number(id), dto), '预警规则已更新');
  }

  @Delete('rules/:id')
  @Roles(UserRole.ADMIN, UserRole.SAFETY_OFFICER)
  async removeRule(@Param('id') id: string) {
    await this.warningsService.removeRule(Number(id));
    return ok(true, '预警规则已删除');
  }
}

