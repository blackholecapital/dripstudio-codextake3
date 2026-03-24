import { SCHEMA_VERSION, type EditorContract } from '@gateway/core-types';

const { z } = require('next/dist/compiled/zod') as { z: any };

export const assetRefSchema = z.object({
  assetId: z.string().min(1),
  kind: z.enum(['image', 'video', 'text']),
  uri: z.string().min(1)
});

export const coordinatesSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
  width: z.number().positive(),
  height: z.number().positive()
});

export const cardPlacementSchema = z.object({
  desktop: coordinatesSchema,
  mobile: coordinatesSchema
});

export const cardSchema = z.object({
  id: z.string().min(1),
  clientSlug: z.string().min(1),
  stage: z.enum([
    'draft',
    'sizeLocked',
    'positionLocked',
    'layoutLocked',
    'contentAssigned',
    'contentLocked',
    'readyToPreview',
    'saved',
    'readyToDeploy'
  ]),
  placement: cardPlacementSchema,
  assetRefs: z.array(assetRefSchema),
  createdOrder: z.number().int().nonnegative()
});

export const editorContractSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  clientSlug: z.string().min(1),
  cards: z.array(
    z.object({
      id: z.string().min(1),
      stage: z.enum([
        'draft',
        'sizeLocked',
        'positionLocked',
        'layoutLocked',
        'contentAssigned',
        'contentLocked',
        'readyToPreview',
        'saved',
        'readyToDeploy'
      ]),
      desktop: coordinatesSchema,
      mobile: coordinatesSchema,
      assetRefs: z.array(assetRefSchema)
    })
  )
});

export const editorRuntimeSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  clientSlug: z.string().min(1),
  cards: z.array(cardSchema),
  activeCardId: z.string().nullable(),
  buffer: z.number().int().nonnegative(),
  sequence: z.number().int().nonnegative()
});

export const deployPayloadSchema = z.object({
  initiatedBy: z.string().min(1),
  contract: editorContractSchema,
  target: z.enum(['demo', 'gateway'])
});

export interface DeployRequestSchema {
  initiatedBy: string;
  contract: EditorContract;
  target: 'demo' | 'gateway';
}

export const deployRequestExample: DeployRequestSchema = {
  initiatedBy: 'segment-2-core',
  target: 'demo',
  contract: {
    schemaVersion: SCHEMA_VERSION,
    clientSlug: 'demo-client',
    cards: []
  }
};
