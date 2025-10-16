import { IntersectionType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';

class GetTweetBaseDto {
  @ApiProperty({
    description: 'Start date',
    required: false,
    type: Date,
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDate()
  startdate?: Date;

  @ApiProperty({
    description: 'End date',
    required: false,
    type: Date,
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDate()
  enddate?: Date;
}

export class GetTweetQueryDto extends IntersectionType(
  GetTweetBaseDto,
  PaginationQueryDto,
) { }
