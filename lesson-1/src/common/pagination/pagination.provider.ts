import { Inject, Injectable } from '@nestjs/common';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import {
  FindManyOptions,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { Paginated } from './paginated.interface';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';

@Injectable()
export class PaginationProvider {
  constructor(
    @Inject(REQUEST)
    private readonly request: Request,
  ) { }
  async paginateQuery<T extends ObjectLiteral>({
    paginationQueryDto,
    repository,
    where,
    relations,
  }: {
    paginationQueryDto: PaginationQueryDto;
    repository: Repository<T>;
    where?: FindOptionsWhere<T>;
    relations?: string[];
  }): Promise<Paginated<T>> {
    // Prepare Query Options
    const findOptions: FindManyOptions<T> = {
      ...(paginationQueryDto.page &&
        paginationQueryDto.limit && {
        skip: (paginationQueryDto.page - 1) * paginationQueryDto.limit,
        take: paginationQueryDto.limit,
      }),
    };

    if (where) {
      findOptions.where = where;
    }

    if (relations) {
      findOptions.relations = relations;
    }

    // Query to DB
    const result = await repository.find(findOptions);
    const totalItems = await repository.count(where);

    // Calculate pagination options
    const totalPages = Math.ceil(totalItems / paginationQueryDto.limit);

    const firstPage = 1;
    const lastPage = totalPages;
    const currentPage = paginationQueryDto.page;
    const nextPage = currentPage >= totalPages ? totalPages : currentPage + 1;
    const previousPage = currentPage <= 1 ? 1 : currentPage - 1;

    // Prepare URL
    const baseUrl =
      this.request.protocol + '://' + this.request.headers.host + '/';
    const newUrl = new URL(this.request.url, baseUrl);

    // Utility Functions
    function updateUrlBySearchParams(
      url: string,
      updates: Record<string, string | number | null | undefined> = {},
    ): string {
      const newUrl = new URL(url);
      const params = newUrl.searchParams;

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === undefined) {
          params.delete(key); // remove param
        } else {
          params.set(key, String(value)); // ✅ ensure string
        }
      }

      return newUrl.toString();
    }

    const response: Paginated<T> = {
      data: result,
      metadata: {
        meta: {
          itemsPerPage: paginationQueryDto.limit,
          currentPage: paginationQueryDto.page,
          totalItems: totalItems,
          totalPages: totalPages,
        },
        links: {
          first: updateUrlBySearchParams(newUrl.href, { page: firstPage }),
          last: updateUrlBySearchParams(newUrl.href, { page: lastPage }),
          current: updateUrlBySearchParams(newUrl.href, { page: currentPage }),
          next: updateUrlBySearchParams(newUrl.href, { page: nextPage }),
          previous: updateUrlBySearchParams(newUrl.href, {
            page: previousPage,
          }),
        },
      },
    };

    return response;
  }
}
