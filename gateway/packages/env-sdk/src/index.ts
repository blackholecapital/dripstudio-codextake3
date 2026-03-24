import type { DeployTarget, EnvironmentMode } from '@gateway/core-types';

export interface WorkerBindings {
  APP_ENV?: EnvironmentMode;
  DEMO_PREVIEW_URL?: string;
  GATEWAY_PREVIEW_URL?: string;
  DEMO_BUCKET?: string;
  PROD_BUCKET?: string;
}

export function getDeployTargets(env: WorkerBindings = {}): DeployTarget[] {
  return [
    {
      id: 'demo',
      label: 'Demo Worker',
      previewUrl: env.DEMO_PREVIEW_URL ?? 'https://demo-preview.example.com',
      bucket: env.DEMO_BUCKET ?? 'demo-bucket-placeholder'
    },
    {
      id: 'gateway',
      label: 'Gateway Worker',
      previewUrl: env.GATEWAY_PREVIEW_URL ?? 'https://gateway-preview.example.com',
      bucket: env.PROD_BUCKET ?? 'prod-bucket-placeholder'
    }
  ];
}
