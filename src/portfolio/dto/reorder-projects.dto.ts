import { IsArray, ValidateNested, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ReorderItem {
  @IsUUID()
  @ApiProperty({ description: 'Project ID' })
  id: string;

  @IsInt()
  @Min(0)
  @ApiProperty({ description: 'New display order position' })
  order: number;
}

export class ReorderProjectsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItem)
  @ApiProperty({
    type: [ReorderItem],
    description: 'Array of project IDs with new order positions',
  })
  items: ReorderItem[];
}
