import {
  IsArray,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  IsNumber,
  ArrayMinSize,
  ArrayMaxSize,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../enums/notification-type.enum';

export class SendNotificationDto {
  @ApiProperty({
    description: 'Array of user IDs to send the notification to',
    example: [5, 12, 33],
    minItems: 1,
    maxItems: 100,
    type: [Number],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsNumber({}, { each: true, message: 'Each value in ids must be a number' })
  readonly ids: number[];

  @ApiProperty({
    description: 'Notification type',
    enum: NotificationType,
    example: NotificationType.SYSTEM,
  })
  @IsNotEmpty()
  @IsEnum(NotificationType)
  readonly type: NotificationType;

  @ApiProperty({
    description: 'Notification title',
    example: 'Scheduled Maintenance',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  readonly title: string;

  @ApiProperty({
    description: 'Notification message body',
    example: 'The system will be down for maintenance on May 10 at 2 AM.',
  })
  @IsNotEmpty()
  @IsString()
  readonly message: string;

  @ApiProperty({
    description: 'Optional metadata payload',
    required: false,
    example: { maintenanceWindow: '2026-05-10T02:00:00Z' },
  })
  @IsOptional()
  @IsObject()
  readonly data?: Record<string, unknown>;
}
