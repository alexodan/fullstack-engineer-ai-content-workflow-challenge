import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ContentState } from '@prisma/client';

export class ReviewContentDto {
  @IsEnum(ContentState)
  state: ContentState;

  @IsOptional()
  @IsString()
  reviewNotes?: string;

  @IsOptional()
  @IsString()
  reviewedBy?: string;
}