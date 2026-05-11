import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StructuredLogger } from './services/structured-logger.service';
import { PrismaService } from './services/prisma.service';
import { PasswordService } from './services/password.service';
import { BootstrapService } from './services/bootstrap.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    StructuredLogger,
    PrismaService,
    PasswordService,
    BootstrapService,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [
    StructuredLogger,
    PrismaService,
    PasswordService,
    BootstrapService,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class CommonModule {}

