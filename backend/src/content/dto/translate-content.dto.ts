import { IsString, IsOptional, IsArray } from 'class-validator';

export class TranslateContentDto {
  @IsString()
  targetLanguage: string;

  @IsString()
  model: string;
}

export class BulkTranslateDto {
  @IsString()
  targetLanguage: string;

  @IsString()
  model: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contentIds?: string[];
}