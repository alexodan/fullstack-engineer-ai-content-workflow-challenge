import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ContentState } from '@prisma/client';

export class CreateContentDto {
  @IsString()
  campaignId: string;

  @IsString()
  type: string;

  @IsString()
  language: string;

  @IsString()
  text: string;

  @IsOptional()
  @IsEnum(ContentState)
  state?: ContentState;
}