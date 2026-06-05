import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  MaxLength,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @ApiProperty({ description: 'Project title', maxLength: 200 })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Short description of the project' })
  shortDescription: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Detailed project description' })
  longDescription?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Cover image URL from cloud storage' })
  coverImageUrl?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiPropertyOptional({ description: 'Gallery image URLs', type: [String] })
  images?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Technologies used in the project',
    type: [String],
  })
  techStack?: string[];

  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Category ID' })
  categoryId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Live project URL' })
  liveUrl?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Source code repository URL' })
  repoUrl?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Is project published' })
  isPublished?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Is project featured' })
  isFeatured?: boolean;
}
