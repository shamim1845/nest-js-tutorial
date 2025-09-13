import { IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateTweetDto {
  @IsString({ message: 'Text should be a string value.' })
  @IsNotEmpty()
  text: string;

  @IsString({ message: 'Image should be a string value.' })
  @IsOptional()
  image?: string;

  @IsArray({ message: 'Hashtags should be an array of strings.' })
  @IsOptional()
  @IsString({ each: true, message: 'Each hashtag should be a string.' })
  hashtags?: string[];
}
