import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsUUID,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  @ApiProperty({ description: 'Service title', maxLength: 150 })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Short description of the service' })
  shortDescription: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Detailed description of the service' })
  longDescription?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Icon image URL from cloud storage' })
  iconUrl?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Cover image URL from cloud storage' })
  coverImageUrl?: string;

  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Category ID' })
  categoryId?: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Base price of the service' })
  basePrice?: number;
}
