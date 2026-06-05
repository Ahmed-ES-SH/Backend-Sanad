// common/utils/pagination.util.ts
import { ObjectLiteral, Repository } from 'typeorm';
import { PaginatedResult } from '../interfaces/paginated-result.interface';

export async function paginate<T extends ObjectLiteral>(
  repo: Repository<T>,
  page = 1,
  limit = 10,
  options: any = {},
): Promise<PaginatedResult<T>> {
  const [data, total] = await repo.findAndCount({
    skip: (page - 1) * limit,
    take: limit,
    ...options,
  });

  return {
    data,
    meta: {
      page,
      limit,
      total,
      lastPage: Math.ceil(total / limit),
      perPage: limit,
    },
  };
}
