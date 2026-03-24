import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assignCardContent,
  createCard,
  createInitialState,
  createLocalSnapshot,
  loadLocalSnapshot,
  lockCardContent,
  lockCardLayout,
  lockCardPosition,
  lockCardSize,
  markReadyToPreview,
  saveCard,
  toDeterministicContract
} from '@gateway/app-core';
import { createDeployPayload, dispatchDeployPayload } from '@gateway/deploy-sdk';

function createSavedState() {
  let state = createInitialState('client-deploy');
  state = createCard(state).state;
  state = lockCardSize(state, { width: 200, height: 120 }, { width: 150, height: 100 }).state;
  state = lockCardPosition(state, { x: 20, y: 20 }, { x: 10, y: 10 }).state;
  state = lockCardLayout(state).state;
  state = assignCardContent(state, [{ assetId: 'asset-1', kind: 'text', uri: 'content://1' }]).state;
  state = lockCardContent(state).state;
  state = markReadyToPreview(state).state;
  state = saveCard(state).state;

  return state;
}

test('save/load snapshot roundtrip preserves runtime state', () => {
  const state = createSavedState();
  const snapshot = createLocalSnapshot(state);
  const restored = loadLocalSnapshot(snapshot);

  assert.equal(restored.ok, true);
  assert.equal(restored.state.clientSlug, state.clientSlug);
  assert.equal(restored.state.cards.length, state.cards.length);
  assert.equal(restored.state.cards[0]?.stage, 'saved');
});

test('load snapshot rejects invalid json payload', () => {
  const restored = loadLocalSnapshot('not-json');

  assert.equal(restored.ok, false);
  assert.match(restored.error ?? '', /not valid JSON/i);
});

test('deploy payload generation is deterministic and separated for demo/prod', () => {
  const contract = toDeterministicContract(createSavedState());
  const env = {
    APP_ENV: 'staging' as const,
    DEMO_PREVIEW_URL: 'https://demo.staging.gateway.example.com',
    GATEWAY_PREVIEW_URL: 'https://gateway.staging.gateway.example.com',
    DEMO_BUCKET: 'demo-stage-bucket',
    PROD_BUCKET: 'prod-stage-bucket'
  };

  const demoPayload = createDeployPayload({ initiatedBy: 'client-deploy', contract, targetId: 'demo', env });
  const prodPayload = createDeployPayload({ initiatedBy: 'client-deploy', contract, targetId: 'gateway', env });

  assert.notEqual(demoPayload.requestId, prodPayload.requestId);
  assert.equal(demoPayload.metadata.bucket, 'demo-stage-bucket');
  assert.equal(prodPayload.metadata.bucket, 'prod-stage-bucket');

  const demoResult = dispatchDeployPayload(demoPayload, env);
  const prodResult = dispatchDeployPayload(prodPayload, env);

  assert.match(demoResult.liveUrl, /demo\.staging/);
  assert.match(prodResult.liveUrl, /gateway\.staging/);
  assert.equal(demoResult.storedPayload.key.startsWith('client-deploy/dep_demo_'), true);
  assert.equal(prodResult.storedPayload.key.startsWith('client-deploy/dep_gateway_'), true);
});
