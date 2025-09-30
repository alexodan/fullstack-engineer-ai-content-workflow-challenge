import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto, GenerateContentDto } from './dto';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  create(@Body() dto: CreateCampaignDto) {
    return this.campaignsService.create(dto);
  }

  @Get()
  findAll() {
    return this.campaignsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  @Post(':id/generate-content')
  generateContent(
    @Param('id') campaignId: string,
    @Body() dto: GenerateContentDto,
  ) {
    return this.campaignsService.generateContent(campaignId, dto);
  }
}
