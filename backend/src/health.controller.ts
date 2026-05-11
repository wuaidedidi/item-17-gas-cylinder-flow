import { Controller, Get } from '@nestjs/common';
import { ok } from './common/api-response';

@Controller()
export class HealthController {
  @Get('health')
  health() {
    return ok({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  }
}

