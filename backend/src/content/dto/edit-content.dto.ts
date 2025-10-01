import { IsString, IsOptional } from 'class-validator';

export class EditContentDto {
  @IsString()
  text: string;

  @IsString()
  editedBy: string;

  @IsOptional()
  @IsString()
  notes?: string;
}