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

function completeCard(state = createInitialState('client-a')) {
  state = createCard(state).state;
  state = lockCardSize(state, { width: 200, height: 120 }, { width: 150, height: 100 }).state;
  state = lockCardPosition(state, { x: 20, y: 20 }, { x: 10, y: 10 }).state;
  state = lockCardLayout(state).state;
  state = assignCardContent(state, [{ assetId: 'asset-1', kind: 'text', uri: 'content://1' }]).state;
  state = lockCardContent(state).state;
  state = markReadyToPreview(state).state;
  state = saveCard(state).state;
  state = markReadyToDeploy(state).state;
  return state;
}

test('single active card rule: cannot create second active card before locking current flow', () => {
  const state = createCard(createInitialState('client-1')).state;
  const duplicate = createCard(state);

  assert.equal(duplicate.ok, false);
  assert.match(duplicate.error ?? '', /Only one active card/);
});

test('rollback delete only removes active card and clear page resets all', () => {
  let state = completeCard();
  state = createCard(state).state;

  const rolled = rollbackActiveCard(state);
  assert.equal(rolled.ok, true);
  assert.equal(rolled.state.cards.length, 1);

  const reset = clearPage(rolled.state);
  assert.equal(reset.state.cards.length, 0);
  assert.equal(reset.state.activeCardId, null);
});

test('locked previous cards are inert and cannot be edited once no active card exists', () => {
  const state = completeCard();
  const illegalEdit = lockCardSize(state, { width: 230, height: 140 }, { width: 160, height: 110 });

  assert.equal(illegalEdit.ok, false);
  assert.match(illegalEdit.error ?? '', /No active card selected/);
});

test('layout lock gating content phase', () => {
  let state = createInitialState('client-2');
  state = createCard(state).state;
  state = lockCardSize(state, { width: 220, height: 120 }, { width: 160, height: 100 }).state;
  state = lockCardPosition(state, { x: 20, y: 20 }, { x: 10, y: 10 }).state;

  const blocked = assignCardContent(state, [{ assetId: 'asset-2', kind: 'text', uri: 'content://2' }]);
  assert.equal(blocked.ok, false);
  assert.match(blocked.error ?? '', /expected layoutLocked/);
});

test('json inspector contract reflects deterministic state order and validates schema', () => {
  let state = completeCard(createInitialState('client-3'));
  state = createCard(state).state;
  state = lockCardSize(state, { width: 180, height: 100 }, { width: 130, height: 90 }).state;
  state = lockCardPosition(state, { x: 260, y: 20 }, { x: 12, y: 130 }).state;
  state = lockCardLayout(state).state;
  state = assignCardContent(state, [
    { assetId: 'z-asset', kind: 'text', uri: 'content://z' },
    { assetId: 'a-asset', kind: 'text', uri: 'content://a' }
  ]).state;

  const contract = toDeterministicContract(state);
  assert.equal(contract.cards[0]?.id, 'card-001');
  assert.equal(contract.cards[1]?.id, 'card-002');
  assert.deepEqual(contract.cards[1]?.assetRefs.map((item) => item.assetId), ['a-asset', 'z-asset']);
  assert.equal(editorContractSchema.safeParse(contract).success, true);
});

test('rejects overlap and touching/buffer violations', () => {
  let state = completeCard(createInitialState('client-4'));
  state = createCard(state).state;
  state = lockCardSize(state, { width: 200, height: 120 }, { width: 150, height: 100 }).state;

  const illegalPlacement = lockCardPosition(state, { x: 220, y: 20 }, { x: 10, y: 10 });
  assert.equal(illegalPlacement.ok, false);
  assert.match(illegalPlacement.error ?? '', /overlaps or touches/);
});
