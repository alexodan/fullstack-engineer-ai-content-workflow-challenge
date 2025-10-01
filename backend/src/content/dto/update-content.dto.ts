import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ContentState } from '@prisma/client';

export class UpdateContentDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsEnum(ContentState)
  state?: ContentState;

  @IsOptional()
  @IsString()
  reviewNotes?: string;
}