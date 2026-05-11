import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class StructuredLogger implements LoggerService {
  log(message: any, context?: string) {
    this.write('info', message, context, process.stdout);
  }

  error(message: any, trace?: string, context?: string) {
    this.write('error', message, context, process.stderr, trace);
  }

  warn(message: any, context?: string) {
    this.write('warn', message, context, process.stdout);
  }

  debug?(message: any, context?: string) {
    this.write('debug', message, context, process.stdout);
  }

  verbose?(message: any, context?: string) {
    this.write('verbose', message, context, process.stdout);
  }

  private write(level: string, message: any, context: string | undefined, stream: NodeJS.WriteStream, trace?: string) {
    const record = {
      timestamp: new Date().toISOString(),
      level,
      context: context || 'Application',
      message: typeof message === 'string' ? message : JSON.stringify(message),
      trace,
    };
    stream.write(`${JSON.stringify(record)}\n`);
  }
}

