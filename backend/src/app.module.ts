import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { AiModule } from './ai/ai.module';
import { ContentModule } from './content/content.module';

@Module({
  imports: [PrismaModule, CampaignsModule, AiModule, ContentModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
