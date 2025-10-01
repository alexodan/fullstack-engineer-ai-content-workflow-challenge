import { ContentState } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import type { InputJsonValue } from '@prisma/client/runtime/library';

import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ContentService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async findAll(filters: { state?: ContentState; campaignId?: string }) {
    const where: { state?: ContentState; campaignId?: string } = {};
    if (filters.state) {
      where.state = filters.state;
    }
    if (filters.campaignId) {
      where.campaignId = filters.campaignId;
    }

    return this.prisma.contentPiece.findMany({
      where,
      include: {
        campaign: true,
      },
    });
  }

  async findOne(id: string) {
    const content = await this.prisma.contentPiece.findUnique({
      where: { id },
      include: {
        campaign: true,
      },
    });

    if (!content) {
      throw new NotFoundException(`Content piece with ID ${id} not found`);
    }

    return content;
  }

  async findByCampaign(campaignId: string) {
    return this.prisma.contentPiece.findMany({
      where: { campaignId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: {
    campaignId: string;
    type: string;
    language: string;
    text: string;
    state?: ContentState;
  }) {
    return this.prisma.contentPiece.create({
      data: {
        campaignId: dto.campaignId,
        type: dto.type,
        language: dto.language,
        text: dto.text,
        state: dto.state || ContentState.DRAFT,
      },
    });
  }

  async update(
    id: string,
    dto: {
      text?: string;
      state?: ContentState;
      reviewNotes?: string;
    },
  ) {
    await this.findOne(id);

    const updateData: {
      text?: string;
      state?: ContentState;
      reviewNotes?: string;
    } = {};

    if (dto.text !== undefined) {
      updateData.text = dto.text;
    }
    if (dto.state !== undefined) {
      updateData.state = dto.state;
    }
    if (dto.reviewNotes !== undefined) {
      updateData.reviewNotes = dto.reviewNotes;
    }

    return this.prisma.contentPiece.update({
      where: { id },
      data: updateData,
    });
  }

  async updateReviewState(
    id: string,
    dto: {
      state: ContentState;
      reviewNotes?: string;
      reviewedBy?: string;
    },
  ) {
    await this.findOne(id);

    const updateData: {
      state: ContentState;
      reviewedAt: Date;
      reviewNotes?: string;
      reviewedBy?: string;
    } = {
      state: dto.state,
      reviewedAt: new Date(),
    };

    if (dto.reviewNotes) {
      updateData.reviewNotes = dto.reviewNotes;
    }

    if (dto.reviewedBy) {
      updateData.reviewedBy = dto.reviewedBy;
    }

    return this.prisma.contentPiece.update({
      where: { id },
      data: updateData,
    });
  }

  async submitEdit(
    id: string,
    dto: {
      text: string;
      editedBy: string;
      notes?: string;
    },
  ) {
    const content = await this.findOne(id);

    const previousText = content.text;

    const history = {
      previousText,
      newText: dto.text,
      editedBy: dto.editedBy,
      editedAt: new Date(),
      notes: dto.notes,
    };

    const existingHistory = (() => {
      if (!content.history) return [];
      if (
        typeof content.history === 'object' &&
        Array.isArray(content.history)
      ) {
        return content.history as unknown[];
      }
      return [];
    })();

    const updateData: {
      text: string;
      state: ContentState;
      editedBy: string;
      editedAt: Date;
      reviewNotes?: string;
      history: InputJsonValue;
    } = {
      text: dto.text,
      state: ContentState.REVIEWED,
      editedBy: dto.editedBy,
      editedAt: new Date(),
      history: [...existingHistory, history] as InputJsonValue,
    };

    if (dto.notes) {
      updateData.reviewNotes = dto.notes;
    }

    return this.prisma.contentPiece.update({
      where: { id },
      data: updateData,
    });
  }

  async translate(
    id: string,
    dto: {
      targetLanguage: string;
      model: string;
    },
  ) {
    const content = await this.findOne(id);

    if (!content.text) {
      return {
        success: false,
        error: 'Cannot translate content with no text',
      };
    }

    try {
      const translatedContent = await this.aiService.translateContent({
        text: content.text,
        sourceLanguage: content.language,
        targetLanguage: dto.targetLanguage,
        model: dto.model,
      });

      const newContentPiece = await this.prisma.contentPiece.create({
        data: {
          campaignId: content.campaignId,
          type: content.type as string,
          language: dto.targetLanguage,
          text: translatedContent.text,
          state: ContentState.AI_SUGGESTED,
          aiMetadata: {
            ...translatedContent.metadata,
            sourceContentId: id,
            translatedFrom: content.language,
          },
        },
      });

      return {
        success: true,
        contentPiece: newContentPiece,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Translation failed',
      };
    }
  }

  async bulkTranslate(
    campaignId: string,
    dto: {
      targetLanguage: string;
      model: string;
      contentIds?: string[];
    },
  ) {
    const where: {
      campaignId: string;
      id?: { in: string[] };
    } = { campaignId };

    if (dto.contentIds && dto.contentIds.length > 0) {
      where.id = { in: dto.contentIds };
    }

    const contentPieces = await this.prisma.contentPiece.findMany({ where });

    const results = await Promise.allSettled(
      contentPieces.map((content) =>
        this.translate(content.id, {
          targetLanguage: dto.targetLanguage,
          model: dto.model,
        }),
      ),
    );

    const successful = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success,
    );
    const failed = results.filter(
      (r) =>
        r.status === 'rejected' ||
        (r.status === 'fulfilled' && !r.value.success),
    );

    return {
      totalProcessed: results.length,
      successful: successful.length,
      failed: failed.length,
      results: results.map((r, index) => ({
        contentId: contentPieces[index].id,
        ...(r.status === 'fulfilled'
          ? r.value
          : { success: false, error: 'Error' }),
      })),
    };
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.contentPiece.delete({
      where: { id },
    });
  }

  async getHistory(id: string) {
    const content = await this.findOne(id);

    const history = (() => {
      if (!content.history) return [];
      if (
        typeof content.history === 'object' &&
        Array.isArray(content.history)
      ) {
        return content.history as unknown[];
      }
      return [];
    })();

    return {
      contentId: id,
      currentText: content.text,
      currentState: content.state,
      history,
    };
  }
}
