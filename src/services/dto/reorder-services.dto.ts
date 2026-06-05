import { IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ReorderItem {
  @IsUUID()
  @ApiProperty({ description: 'Service ID' })
  id: string;

  @IsInt()
  @Min(0)
  @ApiProperty({ description: 'New display order position' })
  order: number;
}

export class ReorderServicesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItem)
  @ApiProperty({
    type: [ReorderItem],
    description: 'Array of service IDs with new order positions',
  })
  items: ReorderItem[];
}
