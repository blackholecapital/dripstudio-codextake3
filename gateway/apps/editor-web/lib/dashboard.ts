import { createInitialState, getShellMetrics, toDeterministicContract } from '@gateway/app-core';
import { getCanvasNodes } from '@gateway/canvas-engine';
import { getDeployTargets } from '@gateway/env-sdk';

const initialState = createInitialState('segment-2-client');

export const shellMetrics = getShellMetrics(initialState);
export const canvasNodes = getCanvasNodes(initialState.cards);
export const deployTargets = getDeployTargets();
export const initialContract = toDeterministicContract(initialState);
