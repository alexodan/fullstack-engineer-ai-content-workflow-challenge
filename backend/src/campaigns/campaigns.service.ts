import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { ContentState } from '@prisma/client';

@Injectable()
export class CampaignsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  create(dto: {
    name: string;
    description?: string;
    defaultInstructions?: string;
  }) {
    return this.prisma.campaign.create({ data: dto });
  }

  findAll() {
    return this.prisma.campaign.findMany({
      include: { contents: true },
    });
  }

  findOne(id: string) {
    return this.prisma.campaign.findUnique({
      where: { id },
      include: { contents: true },
    });
  }

  async generateContent(
    campaignId: string,
    dto: { model: string; language?: string; instructions?: string },
  ) {
    // First, get the campaign to use its details in the prompt
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
    }

    try {
      // Use provided instructions, fall back to campaign defaults
      const finalInstructions =
        dto.instructions ||
        (campaign.defaultInstructions as string | null) ||
        '';

      const generatedContent = await this.aiService.generateContent({
        model: dto.model,
        language: dto.language || 'en',
        instructions: finalInstructions,
        campaignName: campaign.name,
        campaignDescription: campaign.description || '',
      });

      const contentPiece = await this.prisma.contentPiece.create({
        data: {
          campaignId,
          language: dto.language || 'en',
          text: generatedContent.text,
          state: ContentState.AI_SUGGESTED,
          aiMetadata: generatedContent.metadata,
        },
      });

      return {
        success: true,
        contentPiece,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}
