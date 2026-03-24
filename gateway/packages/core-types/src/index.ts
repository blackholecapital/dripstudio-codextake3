export const SCHEMA_VERSION = '2.0.0';

export type EnvironmentMode = 'local' | 'staging' | 'production';

export type CardLifecycleStage =
  | 'draft'
  | 'sizeLocked'
  | 'positionLocked'
  | 'layoutLocked'
  | 'contentAssigned'
  | 'contentLocked'
  | 'readyToPreview'
  | 'saved'
  | 'readyToDeploy';

export interface StatusMetric {
  label: string;
  value: string;
  tone?: 'neutral' | 'positive' | 'warning';
}

export interface DeployTarget {
  id: 'demo' | 'gateway';
  label: string;
  previewUrl: string;
  bucket: string;
}

export interface AssetRef {
  assetId: string;
  kind: 'image' | 'video' | 'text';
  uri: string;
}

export interface CardCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CardPlacement {
  desktop: CardCoordinates;
  mobile: CardCoordinates;
}

export interface EditorCard {
  id: string;
  clientSlug: string;
  stage: CardLifecycleStage;
  placement: CardPlacement;
  assetRefs: AssetRef[];
  createdOrder: number;
}

export interface EditorContract {
  schemaVersion: typeof SCHEMA_VERSION;
  clientSlug: string;
  cards: Array<{
    id: string;
    stage: CardLifecycleStage;
    desktop: CardCoordinates;
    mobile: CardCoordinates;
    assetRefs: AssetRef[];
  }>;
}
