import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './schema/service.schema';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { ServicesPublicController } from './services.public.controller';
import { CategoriesModule } from '../categories/categories.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Service]), CategoriesModule, AuthModule],
  controllers: [ServicesController, ServicesPublicController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
