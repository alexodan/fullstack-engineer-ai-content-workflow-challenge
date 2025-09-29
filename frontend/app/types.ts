export type Campaign = {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  contents: ContentPiece[];
};

export type ContentPiece = {
  id: string;
  campaignId: string;
  campaign: Campaign;
  language: string;
  text?: string;
  state: ContentState; // @default(DRAFT)
  aiMetadata?: Record<string, any>; // JSONB
  createdAt: Date;
  updatedAt: Date;
  reviews: ReviewAction[];
};

export type ReviewAction = {
  id: string; //       @id @default(uuid())
  contentId: string;
  contentPiece: ContentPiece; // @relation(fields: [contentId], references: [id])
  reviewer: string; // maybe i wont use this, leaving it for now
  action: ReviewState;
  comment?: string;
  createdAt: Date; //     @default(now())
};

export enum ContentState {
  DRAFT = "DRAFT",
  AI_SUGGESTED = "AI_SUGGESTED",
  REVIEWED = "REVIEWED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum ReviewState {
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  EDITED = "EDITED",
}
