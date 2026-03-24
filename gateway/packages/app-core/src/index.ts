import {
  SCHEMA_VERSION,
  type AssetRef,
  type CardCoordinates,
  type CardLifecycleStage,
  type EditorCard,
  type EditorContract,
  type StatusMetric
} from '@gateway/core-types';
import { formatMetricValue } from '@gateway/utils';
import { DEFAULT_CARD_BUFFER, validatePlacement, validateSingleActiveCard } from '@gateway/canvas-engine';

const lifecycleOrder: CardLifecycleStage[] = [
  'draft',
  'sizeLocked',
  'positionLocked',
  'layoutLocked',
  'contentAssigned',
  'contentLocked',
  'readyToPreview',
  'saved',
  'readyToDeploy'
];

export interface EditorRuntimeState {
  schemaVersion: typeof SCHEMA_VERSION;
  clientSlug: string;
  cards: EditorCard[];
  activeCardId: string | null;
  buffer: number;
  sequence: number;
}

export interface RuntimeResult {
  state: EditorRuntimeState;
  ok: boolean;
  error?: string;
}

const zeroPlacement = {
  desktop: { x: 20, y: 20, width: 160, height: 100 },
  mobile: { x: 8, y: 8, width: 144, height: 96 }
};

export function createInitialState(clientSlug: string): EditorRuntimeState {
  return {
    schemaVersion: SCHEMA_VERSION,
    clientSlug,
    cards: [],
    activeCardId: null,
    buffer: DEFAULT_CARD_BUFFER,
    sequence: 0
  };
}

function fail(state: EditorRuntimeState, error: string): RuntimeResult {
  return { state, ok: false, error };
}

function success(state: EditorRuntimeState): RuntimeResult {
  return { state, ok: true };
}

function getActiveCard(state: EditorRuntimeState): EditorCard | undefined {
  return state.cards.find((card) => card.id === state.activeCardId);
}

function updateActive(state: EditorRuntimeState, updater: (card: EditorCard) => EditorCard): RuntimeResult {
  if (!state.activeCardId) {
    return fail(state, 'No active card selected.');
  }

  const active = getActiveCard(state);
  if (!active) {
    return fail(state, 'Active card not found.');
  }

  const cards = state.cards.map((card) => (card.id === state.activeCardId ? updater(card) : card));
  return success({ ...state, cards });
}

function requireStage(state: EditorRuntimeState, required: CardLifecycleStage): RuntimeResult | null {
  const active = getActiveCard(state);
  if (!active) {
    return fail(state, 'No active card selected.');
  }

  if (active.stage !== required) {
    return fail(state, `Illegal transition: expected ${required}, got ${active.stage}.`);
  }

  return null;
}

function advanceStage(state: EditorRuntimeState, from: CardLifecycleStage): RuntimeResult {
  const idx = lifecycleOrder.indexOf(from);
  const next = lifecycleOrder[idx + 1];
  if (!next) {
    return fail(state, `No lifecycle stage after ${from}.`);
  }

  return updateActive(state, (card) => ({ ...card, stage: next }));
}

export function createCard(state: EditorRuntimeState): RuntimeResult {
  if (state.activeCardId) {
    return fail(state, 'Only one active card is allowed at a time.');
  }

  const id = `card-${String(state.sequence + 1).padStart(3, '0')}`;
  const card: EditorCard = {
    id,
    clientSlug: state.clientSlug,
    stage: 'draft',
    placement: zeroPlacement,
    assetRefs: [],
    createdOrder: state.sequence
  };

  const next: EditorRuntimeState = {
    ...state,
    cards: [...state.cards, card],
    activeCardId: id,
    sequence: state.sequence + 1
  };

  const activeCheck = validateSingleActiveCard(next.cards, next.activeCardId);
  if (!activeCheck.ok) {
    return fail(state, activeCheck.reason ?? 'Invalid active card state.');
  }

  return success(next);
}

export function lockCardSize(
  state: EditorRuntimeState,
  desktop: Pick<CardCoordinates, 'width' | 'height'>,
  mobile: Pick<CardCoordinates, 'width' | 'height'>
): RuntimeResult {
  const stageCheck = requireStage(state, 'draft');
  if (stageCheck) {
    return stageCheck;
  }

  const resized = updateActive(state, (card) => ({
    ...card,
    placement: {
      desktop: { ...card.placement.desktop, width: desktop.width, height: desktop.height },
      mobile: { ...card.placement.mobile, width: mobile.width, height: mobile.height }
    }
  }));

  if (!resized.ok) {
    return resized;
  }

  return advanceStage(resized.state, 'draft');
}

export function lockCardPosition(
  state: EditorRuntimeState,
  desktop: Pick<CardCoordinates, 'x' | 'y'>,
  mobile: Pick<CardCoordinates, 'x' | 'y'>
): RuntimeResult {
  const stageCheck = requireStage(state, 'sizeLocked');
  if (stageCheck) {
    return stageCheck;
  }

  const moved = updateActive(state, (card) => ({
    ...card,
    placement: {
      desktop: { ...card.placement.desktop, x: desktop.x, y: desktop.y },
      mobile: { ...card.placement.mobile, x: mobile.x, y: mobile.y }
    }
  }));

  if (!moved.ok) {
    return moved;
  }

  const active = getActiveCard(moved.state);
  if (!active) {
    return fail(state, 'Active card not found after move.');
  }

  const lockedCards = moved.state.cards.filter((card) => card.id !== active.id && card.stage !== 'draft');
  const placementCheck = validatePlacement(lockedCards, active, state.buffer);
  if (!placementCheck.ok) {
    return fail(state, placementCheck.reason ?? 'Illegal placement.');
  }

  return advanceStage(moved.state, 'sizeLocked');
}

export function lockCardLayout(state: EditorRuntimeState): RuntimeResult {
  const stageCheck = requireStage(state, 'positionLocked');
  if (stageCheck) {
    return stageCheck;
  }

  return advanceStage(state, 'positionLocked');
}

export function assignCardContent(state: EditorRuntimeState, assetRefs: AssetRef[]): RuntimeResult {
  const stageCheck = requireStage(state, 'layoutLocked');
  if (stageCheck) {
    return stageCheck;
  }

  const assigned = updateActive(state, (card) => ({ ...card, assetRefs }));
  if (!assigned.ok) {
    return assigned;
  }

  return advanceStage(assigned.state, 'layoutLocked');
}

export function lockCardContent(state: EditorRuntimeState): RuntimeResult {
  const stageCheck = requireStage(state, 'contentAssigned');
  if (stageCheck) {
    return stageCheck;
  }

  return advanceStage(state, 'contentAssigned');
}

export function markReadyToPreview(state: EditorRuntimeState): RuntimeResult {
  const stageCheck = requireStage(state, 'contentLocked');
  if (stageCheck) {
    return stageCheck;
  }

  return advanceStage(state, 'contentLocked');
}

export function saveCard(state: EditorRuntimeState): RuntimeResult {
  const stageCheck = requireStage(state, 'readyToPreview');
  if (stageCheck) {
    return stageCheck;
  }

  return advanceStage(state, 'readyToPreview');
}

export function markReadyToDeploy(state: EditorRuntimeState): RuntimeResult {
  const stageCheck = requireStage(state, 'saved');
  if (stageCheck) {
    return stageCheck;
  }

  const advanced = advanceStage(state, 'saved');
  if (!advanced.ok) {
    return advanced;
  }

  return success({ ...advanced.state, activeCardId: null });
}

export function rollbackActiveCard(state: EditorRuntimeState): RuntimeResult {
  if (!state.activeCardId) {
    return fail(state, 'No active card to rollback.');
  }

  return success({
    ...state,
    cards: state.cards.filter((card) => card.id !== state.activeCardId),
    activeCardId: null
  });
}

export function clearPage(state: EditorRuntimeState): RuntimeResult {
  return success({ ...state, cards: [], activeCardId: null, sequence: 0 });
}

export function toDeterministicContract(state: EditorRuntimeState): EditorContract {
  return {
    schemaVersion: SCHEMA_VERSION,
    clientSlug: state.clientSlug,
    cards: [...state.cards]
      .sort((a, b) => a.createdOrder - b.createdOrder)
      .map((card) => ({
        id: card.id,
        stage: card.stage,
        desktop: card.placement.desktop,
        mobile: card.placement.mobile,
        assetRefs: [...card.assetRefs].sort((a, b) => a.assetId.localeCompare(b.assetId))
      }))
  };
}

export function getShellMetrics(state: EditorRuntimeState): StatusMetric[] {
  const active = getActiveCard(state);

  return [
    { label: 'Worker readiness', value: formatMetricValue(100, '%'), tone: 'positive' },
    { label: 'Cards', value: String(state.cards.length), tone: 'neutral' },
    { label: 'Active stage', value: active?.stage ?? 'idle', tone: active ? 'warning' : 'neutral' }
  ];
}


export function createLocalSnapshot(state: EditorRuntimeState): string {
  return JSON.stringify(state);
}

export function loadLocalSnapshot(snapshot: string): RuntimeResult {
  try {
    const parsed = JSON.parse(snapshot) as Partial<EditorRuntimeState>;

    if (!parsed || typeof parsed !== 'object') {
      return fail(createInitialState('segment-4-client'), 'Snapshot payload is not an object.');
    }

    if (!parsed.clientSlug || !Array.isArray(parsed.cards) || typeof parsed.sequence !== 'number') {
      return fail(createInitialState('segment-4-client'), 'Snapshot payload is missing required runtime fields.');
    }

    return success({
      schemaVersion: SCHEMA_VERSION,
      clientSlug: parsed.clientSlug,
      cards: parsed.cards as EditorCard[],
      activeCardId: typeof parsed.activeCardId === 'string' || parsed.activeCardId === null ? parsed.activeCardId : null,
      buffer: typeof parsed.buffer === 'number' ? parsed.buffer : DEFAULT_CARD_BUFFER,
      sequence: parsed.sequence
    });
  } catch {
    return fail(createInitialState('segment-4-client'), 'Snapshot is not valid JSON.');
  }
}
