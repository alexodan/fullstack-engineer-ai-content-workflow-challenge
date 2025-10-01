import { Module } from '@nestjs/common';
import { ContentController, CampaignContentController } from './content.controller';
import { ContentService } from './content.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [PrismaModule, AiModule],
  controllers: [ContentController, CampaignContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}