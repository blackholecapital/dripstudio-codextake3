import { createInitialState, getShellMetrics, toDeterministicContract } from '@gateway/app-core';
import { getCanvasNodes } from '@gateway/canvas-engine';
import { getClientSlug, getDeployTargets } from '@gateway/env-sdk';

const initialState = createInitialState(getClientSlug({ CLIENT_SLUG: process.env.NEXT_PUBLIC_CLIENT_SLUG }));

export const shellMetrics = getShellMetrics(initialState);
export const canvasNodes = getCanvasNodes(initialState.cards);
export const deployTargets = getDeployTargets({
  APP_ENV: (process.env.APP_ENV as 'local' | 'staging' | 'production' | undefined) ?? 'local',
  CLIENT_SLUG: process.env.NEXT_PUBLIC_CLIENT_SLUG,
  DEMO_PREVIEW_URL: process.env.DEMO_PREVIEW_URL,
  GATEWAY_PREVIEW_URL: process.env.GATEWAY_PREVIEW_URL,
  DEMO_BUCKET: process.env.DEMO_BUCKET,
  PROD_BUCKET: process.env.PROD_BUCKET
});
export const initialContract = toDeterministicContract(initialState);
