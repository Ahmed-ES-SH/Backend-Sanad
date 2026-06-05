import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MailerModule } from '@nestjs-modules/mailer';

// config files
import { throttlerConfig } from './config/throttler.config';
import { databaseConfig } from './config/database.config';
import { MAIL_OPTIONS } from './config/mail.config';
import { MailModule } from './mail/mail.module';
import { PaymentsModule } from './payments/payments.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { ServicesModule } from './services/services.module';
import { ContactModule } from './contact/contact.module';
import { CartModule } from './cart/cart.module';
import { AuthGuard } from './auth/guards/auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { BlogModule } from './blog/blog.module';
import { CategoriesModule } from './categories/categories.module';
import { HomeModule } from './home/home.module';
import { ServiceOrdersModule } from './service-orders/service-orders.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationsModule } from './notifications/notifications.module';

// JWT Options
function ReturnJWTOptions(config: ConfigService) {
  return {
    secret: config.get<string>('JWT_SECRET'),
    signOptions: {
      expiresIn: config.get<number>('JWT_EXPIRES_IN'),
    },
  };
}

const JWT_OPTIONS = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    return ReturnJWTOptions(config);
  },
};

@Module({
  imports: [
    // config files
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV !== 'production'
          ? `.env.${process.env.NODE_ENV}`
          : '.env',
    }),
    TypeOrmModule.forRoot(databaseConfig),
    ThrottlerModule.forRoot(throttlerConfig),
    MailerModule.forRootAsync(MAIL_OPTIONS),
    JwtModule.registerAsync(JWT_OPTIONS),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 100,
      ignoreErrors: false,
    }),

    // modules
    AuthModule,
    UserModule,
    MailModule,
    PaymentsModule,
    DashboardModule,
    PortfolioModule,
    ServicesModule,
    ContactModule,
    CartModule,
    BlogModule,
    CategoriesModule,
    HomeModule,
    ServiceOrdersModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  exports: [JwtModule],
  providers: [
    AppService,
    // guards
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // auth guard for check the blacklist tokens
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
