import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ok } from '../common/api-response';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TraceService } from './trace.service';
import { TraceSearchDto } from './dto/trace-search.dto';
import { TraceLogQueryDto } from './dto/trace-log-query.dto';

@ApiTags('责任追踪')
@Controller('trace')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TraceController {
  constructor(private readonly traceService: TraceService) {}

  @Get('search')
  async search(@Query() query: TraceSearchDto, @CurrentUser() user: { id: number; username: string }) {
    return ok(await this.traceService.search(query, user));
  }

  @Get('logs')
  async logs(@Query() query: TraceLogQueryDto) {
    return ok(await this.traceService.logs(query));
  }
}

