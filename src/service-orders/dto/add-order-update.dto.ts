import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddOrderUpdateDto {
  @ApiProperty({ description: 'Timeline message content' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;
}
