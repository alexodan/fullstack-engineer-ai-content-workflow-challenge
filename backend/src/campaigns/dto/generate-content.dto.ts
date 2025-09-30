import { IsString, IsOptional } from 'class-validator';

export class GenerateContentDto {
  @IsString()
  model: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  instructions?: string;
}