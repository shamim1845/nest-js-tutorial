import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'First name should be a string value.' })
  @IsNotEmpty()
  @MinLength(3, { message: 'First name should be at least 3 characters long.' })
  @MaxLength(100, { message: 'First name should not exceed 100 characters.' })
  firstName: string;

  @IsString({ message: 'Last name should be a string value.' })
  @IsNotEmpty()
  @MinLength(3, { message: 'Last name should be at least 3 characters long.' })
  @MaxLength(100, { message: 'Last name should not exceed 100 characters.' })
  lastName: string;

  @IsString()
  @IsOptional()
  @MaxLength(10, { message: 'Gender should not exceed 10 characters.' })
  gender?: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100, { message: 'Email should not exceed 100 characters.' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password should be at least 8 characters long.' })
  @MaxLength(100, { message: 'Password should not exceed 100 characters.' })
  password: string;
}
