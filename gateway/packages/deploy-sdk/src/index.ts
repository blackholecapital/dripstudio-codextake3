import type { DeployTarget, EditorContract, EnvironmentMode } from '@gateway/core-types';
import { getDeployTargets, type WorkerBindings } from '@gateway/env-sdk';

export interface DeployResponse {
  ok: true;
  target: DeployTarget;
  message: string;
  mode: string;
}

export interface DeployPayload {
  requestId: string;
  initiatedBy: string;
  target: DeployTarget['id'];
  contract: EditorContract;
  metadata: {
    clientSlug: string;
    mode: EnvironmentMode;
    bucket: string;
    previewUrl: string;
    payloadHash: string;
  };
}

export interface DeployResult {
  ok: true;
  requestId: string;
  target: DeployTarget;
  mode: EnvironmentMode;
  liveUrl: string;
  storedPayload: {
    bucket: string;
    key: string;
    hash: string;
  };
}

function normalizeContract(contract: EditorContract): EditorContract {
  return {
    ...contract,
    cards: [...contract.cards]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((card) => ({
        ...card,
        assetRefs: [...card.assetRefs].sort((a, b) => a.assetId.localeCompare(b.assetId))
      }))
  };
}

function deterministicHash(input: string): string {
  let hash = 5381;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33) ^ input.charCodeAt(index);
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
}

function getTargetById(targetId: DeployTarget['id'], env?: WorkerBindings): DeployTarget {
  const target = getDeployTargets(env).find((item) => item.id === targetId);

  if (!target) {
    throw new Error(`Unknown deploy target: ${targetId}`);
  }

  return target;
}

export function createDeployPayload(params: {
  initiatedBy: string;
  contract: EditorContract;
  targetId: DeployTarget['id'];
  env?: WorkerBindings;
}): DeployPayload {
  const target = getTargetById(params.targetId, params.env);
  const mode = params.env?.APP_ENV ?? 'local';
  const contract = normalizeContract(params.contract);
  const payloadSeed = JSON.stringify({
    target: target.id,
    contract
  });
  const payloadHash = deterministicHash(payloadSeed);
  const requestId = `dep_${target.id}_${payloadHash}`;

  return {
    requestId,
    initiatedBy: params.initiatedBy,
    target: target.id,
    contract,
    metadata: {
      clientSlug: contract.clientSlug,
      mode,
      bucket: target.bucket,
      previewUrl: target.previewUrl,
      payloadHash
    }
  };
}

export function dispatchDeployPayload(payload: DeployPayload, env?: WorkerBindings): DeployResult {
  const target = getTargetById(payload.target, env);
  const baseUrl = target.previewUrl.replace(/\/$/, '');

  return {
    ok: true,
    requestId: payload.requestId,
    target,
    mode: payload.metadata.mode,
    liveUrl: `${baseUrl}/deploy/${payload.requestId}`,
    storedPayload: {
      bucket: target.bucket,
      key: `${payload.metadata.clientSlug}/${payload.requestId}.json`,
      hash: payload.metadata.payloadHash
    }
  };
}

export function createStubDeployResponse(targetId: DeployTarget['id'], env?: WorkerBindings): DeployResponse {
  const target = getTargetById(targetId, env);

  return {
    ok: true,
    target,
    message: `Stub deploy prepared for ${target.label}`,
    mode: env?.APP_ENV ?? 'local'
  };
}
