import { getShellMetrics } from '@gateway/app-core';
import { getCanvasNodes } from '@gateway/canvas-engine';
import { getDeployTargets } from '@gateway/env-sdk';

export const shellMetrics = getShellMetrics();
export const canvasNodes = getCanvasNodes();
export const deployTargets = getDeployTargets();
