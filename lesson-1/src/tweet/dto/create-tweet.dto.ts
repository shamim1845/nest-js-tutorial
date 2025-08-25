import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTweetDto {
  @IsString({ message: 'Text should be a string value.' })
  @IsNotEmpty()
  text: string;

  @IsString({ message: 'Image should be a string value.' })
  @IsOptional()
  image?: string;

  @IsInt()
  @IsNotEmpty()
  userId: number;
}
