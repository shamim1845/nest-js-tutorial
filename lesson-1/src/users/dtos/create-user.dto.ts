import {
  IsBoolean,
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

  @IsString()
  @IsOptional()
  gender?: string;

  @IsNumber()
  age: number;

  @IsBoolean()
  isMarried: boolean;
}
