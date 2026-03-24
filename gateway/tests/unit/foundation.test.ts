import test from 'node:test';
import assert from 'node:assert/strict';
import { createStubDeployResponse } from '@gateway/deploy-sdk';
import { getShellMetrics } from '@gateway/app-core';
import { getCanvasNodes } from '@gateway/canvas-engine';

test('creates a demo deploy response', () => {
  const response = createStubDeployResponse('demo', { APP_ENV: 'staging' });
  assert.equal(response.ok, true);
  assert.equal(response.target.id, 'demo');
  assert.equal(response.mode, 'staging');
});

test('exposes workspace shell primitives', () => {
  assert.equal(getShellMetrics().length, 3);
  assert.ok(getCanvasNodes().length > 0);
});
