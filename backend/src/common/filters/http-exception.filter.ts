import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const result = exception.getResponse();
      const message =
        typeof result === 'string'
          ? result
          : Array.isArray((result as any).message)
            ? (result as any).message[0]
            : (result as any).message || '请求失败';
      const code = typeof result === 'object' && result !== null && 'code' in result ? (result as any).code : status;

      response.status(status).json({
        code,
        message,
        data: null,
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: '系统内部错误',
      data: null,
    });
  }
}

