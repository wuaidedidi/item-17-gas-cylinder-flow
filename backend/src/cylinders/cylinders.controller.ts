import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ok } from '../common/api-response';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CylindersService } from './cylinders.service';
import { CylinderQueryDto } from './dto/cylinder-query.dto';
import { CreateCylinderDto } from './dto/create-cylinder.dto';
import { UpdateCylinderDto } from './dto/update-cylinder.dto';

@ApiTags('气瓶档案')
@Controller('cylinders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CylindersController {
  constructor(private readonly cylindersService: CylindersService) {}

  @Get()
  async list(@Query() query: CylinderQueryDto) {
    return ok(await this.cylindersService.list(query));
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    return ok(await this.cylindersService.detail(Number(id)));
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER)
  async create(@Body() dto: CreateCylinderDto, @CurrentUser() user: { id: number }) {
    return ok(await this.cylindersService.create(dto, user.id), '气瓶档案已创建');
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER)
  async update(@Param('id') id: string, @Body() dto: UpdateCylinderDto, @CurrentUser() user: { id: number }) {
    return ok(await this.cylindersService.update(Number(id), dto, user.id), '气瓶档案已更新');
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER)
  async remove(@Param('id') id: string) {
    await this.cylindersService.remove(Number(id));
    return ok(true, '气瓶档案已删除');
  }
}

