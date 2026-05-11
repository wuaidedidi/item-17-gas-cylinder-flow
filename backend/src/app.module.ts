import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SwaggerModule } from '@nestjs/swagger';
import { CommonModule } from './common/common.module';
import { HealthController } from './health.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CylindersModule } from './cylinders/cylinders.module';
import { RecordsModule } from './records/records.module';
import { WarningsModule } from './warnings/warnings.module';
import { TraceModule } from './trace/trace.module';
import { ApprovalsModule } from './approvals/approvals.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '8h',
        },
      }),
    }),
    CommonModule,
    AuthModule,
    UsersModule,
    DashboardModule,
    CylindersModule,
    RecordsModule,
    WarningsModule,
    TraceModule,
    ApprovalsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

