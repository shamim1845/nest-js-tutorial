import {
  IsDate,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProfileDto {
  @IsString({ message: 'First name should be a string value.' })
  @IsOptional()
  @MinLength(3, { message: 'First name should be at least 3 characters long.' })
  @MaxLength(100, { message: 'First name should not exceed 100 characters.' })
  firstName?: string;

  @IsString({ message: 'Last name should be a string value.' })
  @IsOptional()
  @MinLength(3, { message: 'Last name should be at least 3 characters long.' })
  @MaxLength(100, { message: 'Last name should not exceed 100 characters.' })
  lastName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10, { message: 'Gender should not exceed 10 characters.' })
  gender?: string;

  //
  @IsDate()
  @IsOptional()
  dateOfBirth?: Date;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  profileImage?: string;
}
