import { IsOptional, IsPositive } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @IsPositive()
  limit: number = 3;

  @IsOptional()
  @IsPositive()
  page: number = 1;
}
