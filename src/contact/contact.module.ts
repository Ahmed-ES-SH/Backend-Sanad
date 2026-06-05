import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactMessage } from './schema/contact-message.schema';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { ContactPublicController } from './contact.public.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([ContactMessage]), AuthModule],
  controllers: [ContactController, ContactPublicController],
  providers: [ContactService],
})
export class ContactModule {}
