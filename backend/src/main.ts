import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { existsSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';
import { BootstrapService } from './common/services/bootstrap.service';
import { StructuredLogger } from './common/services/structured-logger.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(StructuredLogger);
  app.useLogger(logger);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('工业气瓶流转与安全巡检追踪系统')
    .setDescription('面向工业气瓶、压力容器和特种设备的流转追踪、安全巡检与维护台账平台')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const publicPath = join(__dirname, '..', 'public');
  if (existsSync(publicPath)) {
    app.useStaticAssets(publicPath, { index: false });
    app.getHttpAdapter().getInstance().get(/^\/(?!api|docs).*/, (_request, response) => {
      response.sendFile(join(publicPath, 'index.html'));
    });
  }

  await app.init();

  const bootstrapService = app.get(BootstrapService);
  await bootstrapService.waitForDatabase();
  await bootstrapService.ensureSystemData();

  const port = Number(process.env.PORT || 8000);
  await app.listen(port);
  logger.log(`后端服务已启动，监听端口 ${port}`, 'Bootstrap');
}

bootstrap().catch((error) => {
  process.stderr.write(`${JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'error',
    context: 'Bootstrap',
    message: error instanceof Error ? error.message : String(error),
  })}\n`);
  process.exit(1);
});
