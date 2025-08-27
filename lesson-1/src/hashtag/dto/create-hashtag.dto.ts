import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateHashtagDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  name: string;
}
