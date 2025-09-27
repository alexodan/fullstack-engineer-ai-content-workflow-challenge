import { PrismaClient, ContentState, ReviewState } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const campaignsCount = await prisma.campaign.count();
  if (campaignsCount > 0) {
    return;
  }

  const campaign1 = await prisma.campaign.create({
    data: {
      id: randomUUID(),
      name: 'Summer Launch',
      description: 'Campaign for summer product launch',
      contents: {
        create: [
          {
            id: randomUUID(),
            language: 'en',
            text: 'Introducing our new summer collection!',
            state: ContentState.APPROVED,
            aiMetadata: {
              keywords: ['summer', 'collection', 'fashion'],
              tone: 'excited',
              sentiment: 'positive',
            },
            reviews: {
              create: [
                {
                  id: randomUUID(),
                  reviewer: 'alice@example.com',
                  action: ReviewState.APPROVED,
                  comment: 'Looks good!',
                },
              ],
            },
          },
          {
            id: randomUUID(),
            language: 'es',
            text: '¡Presentamos nuestra nueva colección de verano!',
            state: ContentState.REVIEWED,
            aiMetadata: {
              keywords: ['verano', 'colección', 'moda'],
              tone: 'emocionado',
              sentiment: 'positivo',
            },
            reviews: {
              create: [
                {
                  id: randomUUID(),
                  reviewer: 'bob@example.com',
                  action: ReviewState.EDITED,
                  comment: 'Adjusted translation slightly.',
                },
              ],
            },
          },
        ],
      },
    },
    include: { contents: true },
  });

  const campaign2 = await prisma.campaign.create({
    data: {
      id: randomUUID(),
      name: 'Back to School',
      description: 'Promoting products for students',
      contents: {
        create: [
          {
            id: randomUUID(),
            language: 'en',
            text: 'Gear up for back-to-school with our new backpacks.',
            state: ContentState.AI_SUGGESTED,
            aiMetadata: {
              keywords: ['school', 'backpacks'],
              tone: 'friendly',
              sentiment: 'neutral',
            },
          },
          {
            id: randomUUID(),
            language: 'fr',
            text: 'Préparez la rentrée avec nos nouveaux sacs à dos.',
            state: ContentState.DRAFT,
          },
        ],
      },
    },
    include: { contents: true },
  });

  const campaign3 = await prisma.campaign.create({
    data: {
      id: randomUUID(),
      name: 'Winter Collection',
      description: 'Highlighting our latest winter fashion line',
      contents: {
        create: [
          {
            id: randomUUID(),
            language: 'en',
            text: 'Stay warm and stylish with our winter jackets.',
            state: ContentState.REVIEWED,
            aiMetadata: {
              keywords: ['winter', 'jackets', 'style'],
              tone: 'cozy',
              sentiment: 'positive',
            },
            reviews: {
              create: [
                {
                  id: randomUUID(),
                  reviewer: 'claire@example.com',
                  action: ReviewState.EDITED,
                  comment: 'Updated tone to feel warmer.',
                },
              ],
            },
          },
          {
            id: randomUUID(),
            language: 'de',
            text: 'Bleiben Sie warm und stilvoll mit unseren Winterjacken.',
            state: ContentState.DRAFT,
          },
        ],
      },
    },
  });

  // Campaign 4: Spring Fashion Week
  const campaign4 = await prisma.campaign.create({
    data: {
      id: randomUUID(),
      name: 'Spring Fashion Week',
      description: 'Promotional campaign for spring runway looks',
      contents: {
        create: [
          {
            id: randomUUID(),
            language: 'en',
            text: 'Fresh styles are blooming this Spring Fashion Week!',
            state: ContentState.AI_SUGGESTED,
            aiMetadata: {
              keywords: ['spring', 'fashion week', 'style'],
              tone: 'trendy',
              sentiment: 'positive',
            },
          },
          {
            id: randomUUID(),
            language: 'it',
            text: 'Nuovi stili sbocciano questa settimana della moda primaverile!',
            state: ContentState.DRAFT,
          },
        ],
      },
    },
  });

  console.log('Seeded campaigns:', {
    campaign1: campaign1.name,
    campaign2: campaign2.name,
    campaign3: campaign3.name,
    campaign4: campaign4.name,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect().catch((e) => {
      console.error('Failed to disconnect Prisma:', e);
    });
  });
