import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ContentService } from './content.service';
import {
  CreateContentDto,
  UpdateContentDto,
  ReviewContentDto,
  EditContentDto,
  TranslateContentDto,
  BulkTranslateDto,
} from './dto';
import { ContentState } from '@prisma/client';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  findAll(
    @Query('state') state?: string,
    @Query('campaignId') campaignId?: string,
  ) {
    return this.contentService.findAll({
      state: state as ContentState | undefined,
      campaignId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contentService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateContentDto) {
    return this.contentService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContentDto) {
    return this.contentService.update(id, dto);
  }

  @Patch(':id/review')
  updateReviewState(@Param('id') id: string, @Body() dto: ReviewContentDto) {
    return this.contentService.updateReviewState(id, dto);
  }

  @Post(':id/edit')
  submitEdit(@Param('id') id: string, @Body() dto: EditContentDto) {
    return this.contentService.submitEdit(id, dto);
  }

  @Post(':id/translate')
  async translate(@Param('id') id: string, @Body() dto: TranslateContentDto) {
    return this.contentService.translate(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contentService.remove(id);
  }

  @Get(':id/history')
  getHistory(@Param('id') id: string) {
    return this.contentService.getHistory(id);
  }
}

@Controller('campaigns/:campaignId/content')
export class CampaignContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  findByCampaign(@Param('campaignId') campaignId: string) {
    return this.contentService.findByCampaign(campaignId);
  }

  @Post()
  createForCampaign(
    @Param('campaignId') campaignId: string,
    @Body() dto: Omit<CreateContentDto, 'campaignId'>,
  ) {
    return this.contentService.create({ ...dto, campaignId });
  }

  @Post('bulk-translate')
  async bulkTranslate(
    @Param('campaignId') campaignId: string,
    @Body() dto: BulkTranslateDto,
  ) {
    return this.contentService.bulkTranslate(campaignId, dto);
  }
}
