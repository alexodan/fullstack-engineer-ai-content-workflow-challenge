import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

export interface GenerateContentRequest {
  model: string;
  language?: string;
  instructions?: string;
  campaignName: string;
  campaignDescription?: string;
}

export interface GeneratedContent {
  text: string;
  metadata: {
    model: string;
    generatedAt: string;
    prompt: string;
    tokensUsed?: number;
  };
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.openai = new OpenAI({
      apiKey,
    });
  }

  async generateContent(
    request: GenerateContentRequest,
  ): Promise<GeneratedContent> {
    const {
      model,
      language = 'en',
      instructions,
      campaignName,
      campaignDescription,
    } = request;

    const prompt = this.buildPrompt(
      campaignName,
      campaignDescription,
      language,
      instructions,
    );

    this.logger.log(
      `Generating content with ${model} for campaign: ${campaignName}`,
    );

    // TODO: add custom instructions (in UI too oc)
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.mapModelName(model),
        messages: [
          {
            role: 'system',
            content:
              'You are a professional marketing content creator. Generate engaging, persuasive marketing content that captures attention and drives action. Keep the content concise, compelling, and appropriate for the target audience.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const generatedText = completion.choices[0]?.message?.content;
      if (!generatedText) {
        throw new Error('No content generated from OpenAI');
      }

      return {
        text: generatedText.trim(),
        metadata: {
          model,
          generatedAt: new Date().toISOString(),
          prompt,
          tokensUsed: completion.usage?.total_tokens,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Failed to generate content: ${errorMessage}`);
      throw new Error(`AI content generation failed: ${errorMessage}`);
    }
  }

  private buildPrompt(
    campaignName: string,
    campaignDescription?: string,
    language = 'en',
    customInstructions?: string,
  ): string {
    let prompt = `Create marketing content for the campaign "${campaignName}"`;

    if (campaignDescription) {
      prompt += ` with the following description: ${campaignDescription}`;
    }

    if (language !== 'en') {
      prompt += `. Write the content in ${this.getLanguageName(language)}`;
    }

    if (customInstructions) {
      prompt += `. Additional requirements: ${customInstructions}`;
    }

    prompt +=
      '. The content should be engaging, persuasive, and suitable for marketing purposes.';

    return prompt;
  }

  private mapModelName(frontendModel: string): string {
    const modelMap: Record<string, string> = {
      'openai-gpt4': 'gpt-4',
      'openai-gpt3.5': 'gpt-3.5-turbo',
      'anthropic-claude': 'gpt-4', // Fallback to GPT-4 since we're only using OpenAI for now
    };

    return modelMap[frontendModel] || 'gpt-3.5-turbo';
  }

  private getLanguageName(code: string): string {
    const languages: Record<string, string> = {
      en: 'English',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese',
      ja: 'Japanese',
      ko: 'Korean',
      zh: 'Chinese',
    };

    return languages[code] || 'English';
  }

  async translateContent(request: {
    text: string;
    sourceLanguage: string;
    targetLanguage: string;
    model: string;
  }): Promise<GeneratedContent> {
    const { text, sourceLanguage, targetLanguage, model } = request;

    const prompt = `Translate the following text from ${this.getLanguageName(
      sourceLanguage,
    )} to ${this.getLanguageName(
      targetLanguage,
    )}. Maintain the tone, style, and marketing effectiveness of the original content:\n\n${text}`;

    this.logger.log(
      `Translating content from ${sourceLanguage} to ${targetLanguage} using ${model}`,
    );

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.mapModelName(model),
        messages: [
          {
            role: 'system',
            content:
              'You are a professional translator specializing in marketing content. Provide accurate translations that maintain the persuasive power and emotional impact of the original text while adapting it culturally for the target audience.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.3,
      });

      const translatedText = completion.choices[0]?.message?.content;
      if (!translatedText) {
        throw new Error('No translation generated from OpenAI');
      }

      return {
        text: translatedText.trim(),
        metadata: {
          model,
          generatedAt: new Date().toISOString(),
          prompt,
          tokensUsed: completion.usage?.total_tokens,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Failed to translate content: ${errorMessage}`);
      throw new Error(`Translation failed: ${errorMessage}`);
    }
  }
}
