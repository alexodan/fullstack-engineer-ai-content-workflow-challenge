import type { Campaign, ContentPiece } from "../types";
import { apiClient } from "./api-client";

export async function fetchCampaigns(): Promise<Campaign[]> {
  return apiClient<Campaign[]>("/campaigns");
}

export async function fetchCampaignById(id: string): Promise<Campaign> {
  return apiClient<Campaign>(`/campaigns/${id}`);
}

// Mock AI generation - replace with real API call later
export async function generateAIContent(campaignId: string, model: string): Promise<ContentPiece> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const mockContent: ContentPiece = {
    id: `generated-${Date.now()}`,
    campaignId,
    campaign: {} as Campaign, // Will be populated by backend
    language: "en",
    text: `This is AI-generated content created with ${model}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
    state: "AI_SUGGESTED" as any, // ContentState.AI_SUGGESTED
    aiMetadata: {
      model,
      generatedAt: new Date().toISOString(),
      prompt: "Generate marketing content for campaign"
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    reviews: []
  };

  // Mock API call - in real app this would be a POST request
  console.log('Generated AI content:', mockContent);
  return mockContent;
}
