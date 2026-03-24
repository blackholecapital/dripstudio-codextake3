import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assignCardContent,
  clearPage,
  createCard,
  createInitialState,
  lockCardContent,
  lockCardLayout,
  lockCardPosition,
  lockCardSize,
  markReadyToDeploy,
  markReadyToPreview,
  rollbackActiveCard,
  saveCard,
  toDeterministicContract
} from '@gateway/app-core';
import { editorContractSchema } from '@gateway/schemas';

test('supports legal lifecycle transitions to readyToDeploy', () => {
  let state = createInitialState('client-a');
  state = createCard(state).state;
  state = lockCardSize(state, { width: 200, height: 120 }, { width: 150, height: 100 }).state;
  state = lockCardPosition(state, { x: 20, y: 20 }, { x: 10, y: 10 }).state;
  state = lockCardLayout(state).state;
  state = assignCardContent(state, [{ assetId: 'asset-1', kind: 'text', uri: 'content://1' }]).state;
  state = lockCardContent(state).state;
  state = markReadyToPreview(state).state;
  state = saveCard(state).state;
  state = markReadyToDeploy(state).state;

  const contract = toDeterministicContract(state);
  assert.equal(contract.cards.length, 1);
  assert.equal(contract.cards[0]?.stage, 'readyToDeploy');
  assert.equal(editorContractSchema.safeParse(contract).success, true);
});

test('rejects illegal transition order', () => {
  const state = createCard(createInitialState('client-b')).state;
  const illegal = lockCardPosition(state, { x: 25, y: 20 }, { x: 10, y: 10 });
  assert.equal(illegal.ok, false);
  assert.match(illegal.error ?? '', /Illegal transition/);
});

test('rejects overlap or touching with buffer and allows rollback/reset', () => {
  let state = createInitialState('client-c');
  state = createCard(state).state;
  state = lockCardSize(state, { width: 200, height: 120 }, { width: 150, height: 100 }).state;
  state = lockCardPosition(state, { x: 20, y: 20 }, { x: 10, y: 10 }).state;
  state = lockCardLayout(state).state;
  state = assignCardContent(state, [{ assetId: 'asset-1', kind: 'text', uri: 'content://1' }]).state;
  state = lockCardContent(state).state;
  state = markReadyToPreview(state).state;
  state = saveCard(state).state;
  state = markReadyToDeploy(state).state;

  state = createCard(state).state;
  state = lockCardSize(state, { width: 200, height: 120 }, { width: 150, height: 100 }).state;

  const illegalPlacement = lockCardPosition(state, { x: 220, y: 20 }, { x: 10, y: 10 });
  assert.equal(illegalPlacement.ok, false);
  assert.match(illegalPlacement.error ?? '', /overlaps or touches/);

  state = rollbackActiveCard(state).state;
  assert.equal(state.cards.length, 1);

  state = clearPage(state).state;
  assert.equal(state.cards.length, 0);
  assert.equal(state.activeCardId, null);
});
