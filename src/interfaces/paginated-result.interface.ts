import { PaginationMetaDto } from '../DTO/pagination.dto';

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMetaDto;
}
