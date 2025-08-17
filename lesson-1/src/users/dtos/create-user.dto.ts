import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'First name should be a string value.' })
  @IsNotEmpty()
  @MinLength(3, { message: 'First name should be at least 3 characters long.' })
  firstName: string;

  @IsString({ message: 'Last name should be a string value.' })
  @IsNotEmpty()
  @MinLength(3, { message: 'Last name should be at least 3 characters long.' })
  lastName: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password should be at least 8 characters long.' })
  password: string;
}
