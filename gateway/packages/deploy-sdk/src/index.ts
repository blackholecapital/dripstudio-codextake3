import type { DeployTarget } from '@gateway/core-types';
import { getDeployTargets, type WorkerBindings } from '@gateway/env-sdk';

export interface DeployResponse {
  ok: true;
  target: DeployTarget;
  message: string;
  mode: string;
}

export function createStubDeployResponse(targetId: DeployTarget['id'], env?: WorkerBindings): DeployResponse {
  const target = getDeployTargets(env).find((item) => item.id === targetId);

  if (!target) {
    throw new Error(`Unknown deploy target: ${targetId}`);
  }

  return {
    ok: true,
    target,
    message: `Stub deploy prepared for ${target.label}`,
    mode: env?.APP_ENV ?? 'local'
  };
}
