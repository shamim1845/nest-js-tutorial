import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Username should be a string value.' })
  @IsNotEmpty()
  @MinLength(3, { message: 'Username should be at least 3 characters long.' })
  @MaxLength(24, { message: 'Username should not exceed 24 characters.' })
  username: string;

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
