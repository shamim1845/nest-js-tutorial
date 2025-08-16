import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNumber()
  @IsOptional()
  id?: number;

  @IsString({ message: 'Name should be a string value.' })
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsNumber()
  age: number;

  @IsString()
  @IsOptional()
  gender: string;

  @IsBoolean()
  isMarried: boolean;

  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
