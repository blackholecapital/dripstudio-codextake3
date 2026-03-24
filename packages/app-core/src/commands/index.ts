import { createId } from '../utils/createId';
import type {
  CardRecord,
  CardLifecycle,
  GridSize,
  GridPosition,
  GridConfig,
  Project,
  ContentAssignment,
  MobilePosition,
  CommandResult,
} from '@gateway/core-types';
import { transitionLifecycle } from '../state-machine/lifecycle';
import {
  validateCardSize,
  validateCardPosition,
  enforceLayoutLockReadiness,
  enforceContentPhase,
} from '../policies/cardPolicies';
import { checkOverlapAndBuffer } from '@gateway/canvas-engine';

// ─── Card Commands ────────────────────────────────────────────────────────────

export function cmdCreateCard(
  existingCards: CardRecord[],
  label?: string,
): CommandResult<CardRecord> {
  // Only allow creating a new card if no existing card is in draft/sizeLocked
  const activeDraft = existingCards.find((c) =>
    ['draft', 'sizeLocked'].includes(c.lifecycle)
  );
  if (activeDraft) {
    return {
      ok: false,
      error: `Cannot add a new card while "${activeDraft.label}" is still being configured`,
    };
  }

  const now = new Date().toISOString();
  const card: CardRecord = {
    id: createId(),
    lifecycle: 'draft',
    label: label ?? `Card ${existingCards.length + 1}`,
    size: null,
    position: null,
    mobile: null,
    content: null,
    createdAt: now,
    updatedAt: now,
  };

  return { ok: true, data: card };
}

export function cmdSetCardSize(
  card: CardRecord,
  size: GridSize,
  config: GridConfig,
): CommandResult<CardRecord> {
  if (card.lifecycle !== 'draft' && card.lifecycle !== 'sizeLocked') {
    return {
      ok: false,
      error: `Cannot set size on card in state "${card.lifecycle}"`,
    };
  }

  const validation = validateCardSize(size, config);
  if (!validation.ok) return validation as CommandResult<CardRecord>;

  return {
    ok: true,
    data: {
      ...card,
      size,
      lifecycle: 'draft', // stay draft until explicitly locked
      updatedAt: new Date().toISOString(),
    },
  };
}

export function cmdLockCardSize(card: CardRecord): CommandResult<CardRecord> {
  if (!card.size) {
    return { ok: false, error: 'Cannot lock size: no size has been set' };
  }

  const transition = transitionLifecycle(card.lifecycle, 'sizeLocked');
  if (!transition.ok) return transition as CommandResult<CardRecord>;

  return {
    ok: true,
    data: { ...card, lifecycle: 'sizeLocked', updatedAt: new Date().toISOString() },
  };
}

export function cmdSetCardPosition(
  card: CardRecord,
  position: GridPosition,
  existingCards: CardRecord[],
  config: GridConfig,
): CommandResult<CardRecord> {
  if (card.lifecycle !== 'sizeLocked' && card.lifecycle !== 'positionLocked') {
    return {
      ok: false,
      error: `Cannot set position on card in state "${card.lifecycle}" — lock size first`,
    };
  }
  if (!card.size) {
    return { ok: false, error: 'Card has no size set' };
  }

  const boundsCheck = validateCardPosition(position, card.size, config);
  if (!boundsCheck.ok) return boundsCheck as CommandResult<CardRecord>;

  // Check against all OTHER locked cards
  const otherCards = existingCards.filter(
    (c) => c.id !== card.id && c.position && c.size
  );

  const collisionCheck = checkOverlapAndBuffer(
    { position, size: card.size },
    otherCards.map((c) => ({ position: c.position!, size: c.size! })),
    config.buffer,
  );

  if (!collisionCheck.ok) return collisionCheck as CommandResult<CardRecord>;

  return {
    ok: true,
    data: {
      ...card,
      position,
      updatedAt: new Date().toISOString(),
    },
  };
}

export function cmdLockCardPosition(
  card: CardRecord,
  existingCards: CardRecord[],
  config: GridConfig,
): CommandResult<CardRecord> {
  if (!card.position) {
    return { ok: false, error: 'Cannot lock position: no position has been set' };
  }
  if (!card.size) {
    return { ok: false, error: 'Cannot lock position: no size has been set' };
  }

  // Re-validate position (defense in depth)
  const otherCards = existingCards.filter(
    (c) => c.id !== card.id && c.position && c.size
  );
  const collisionCheck = checkOverlapAndBuffer(
    { position: card.position, size: card.size },
    otherCards.map((c) => ({ position: c.position!, size: c.size! })),
    config.buffer,
  );
  if (!collisionCheck.ok) return collisionCheck as CommandResult<CardRecord>;

  const transition = transitionLifecycle(card.lifecycle, 'positionLocked');
  if (!transition.ok) return transition as CommandResult<CardRecord>;

  return {
    ok: true,
    data: {
      ...card,
      lifecycle: 'positionLocked',
      updatedAt: new Date().toISOString(),
    },
  };
}

export function cmdLockLayout(
  cards: CardRecord[],
): CommandResult<CardRecord[]> {
  const readiness = enforceLayoutLockReadiness(cards);
  if (!readiness.ok) return readiness as CommandResult<CardRecord[]>;

  const now = new Date().toISOString();
  const updated = cards.map((card) => {
    if (card.lifecycle === 'positionLocked') {
      return { ...card, lifecycle: 'layoutLocked' as CardLifecycle, updatedAt: now };
    }
    return card;
  });

  return { ok: true, data: updated };
}

export function cmdAssignContent(
  card: CardRecord,
  assignment: ContentAssignment,
): CommandResult<CardRecord> {
  const phaseCheck = enforceContentPhase(card);
  if (!phaseCheck.ok) return phaseCheck as CommandResult<CardRecord>;

  return {
    ok: true,
    data: {
      ...card,
      content: assignment,
      lifecycle: 'contentAssigned',
      updatedAt: new Date().toISOString(),
    },
  };
}

export function cmdLockContent(card: CardRecord): CommandResult<CardRecord> {
  if (card.lifecycle !== 'contentAssigned') {
    return {
      ok: false,
      error: `Cannot lock content: card must be in contentAssigned state (current: ${card.lifecycle})`,
    };
  }

  const transition = transitionLifecycle(card.lifecycle, 'contentLocked');
  if (!transition.ok) return transition as CommandResult<CardRecord>;

  return {
    ok: true,
    data: { ...card, lifecycle: 'contentLocked', updatedAt: new Date().toISOString() },
  };
}

export function cmdMarkReadyToPreview(card: CardRecord): CommandResult<CardRecord> {
  const transition = transitionLifecycle(card.lifecycle, 'readyToPreview');
  if (!transition.ok) return transition as CommandResult<CardRecord>;

  return {
    ok: true,
    data: { ...card, lifecycle: 'readyToPreview', updatedAt: new Date().toISOString() },
  };
}

export function cmdSave(card: CardRecord): CommandResult<CardRecord> {
  const transition = transitionLifecycle(card.lifecycle, 'saved');
  if (!transition.ok) return transition as CommandResult<CardRecord>;

  return {
    ok: true,
    data: { ...card, lifecycle: 'saved', updatedAt: new Date().toISOString() },
  };
}

export function cmdSetMobilePosition(
  card: CardRecord,
  mobile: MobilePosition,
): CommandResult<CardRecord> {
  return {
    ok: true,
    data: { ...card, mobile, updatedAt: new Date().toISOString() },
  };
}

// ─── Project Commands ─────────────────────────────────────────────────────────

export function cmdCreateProject(params: {
  name: string;
  clientSlug: string;
}): CommandResult<Project> {
  if (!params.name.trim()) {
    return { ok: false, error: 'Project name is required' };
  }
  if (!params.clientSlug.trim()) {
    return { ok: false, error: 'Client slug is required' };
  }
  if (!/^[a-z0-9-]+$/.test(params.clientSlug)) {
    return {
      ok: false,
      error: 'Client slug must be lowercase alphanumeric with hyphens only',
    };
  }

  const now = new Date().toISOString();
  const project: Project = {
    id: createId(),
    name: params.name.trim(),
    clientSlug: params.clientSlug.trim(),
    phase: 'layout',
    gridConfig: { cols: 12, rows: 8, buffer: 1 },
    deployConfig: {
      demo: {
        bucket: 'gateway-demo',
        path: `demo/${params.clientSlug}`,
        ttl: 172800, // 48 hours
      },
      prod: {
        bucket: 'gateway-prod',
        path: `prod/${params.clientSlug}`,
      },
    },
    createdAt: now,
    updatedAt: now,
  };

  return { ok: true, data: project };
}

export function cmdDeleteLastCard(cards: CardRecord[]): CommandResult<CardRecord[]> {
  if (cards.length === 0) {
    return { ok: false, error: 'No cards to delete' };
  }

  const last = cards[cards.length - 1];
  if (last && isLayoutLocked(last.lifecycle)) {
    return {
      ok: false,
      error: `Cannot delete card "${last.label}" — layout is locked`,
    };
  }

  return { ok: true, data: cards.slice(0, -1) };
}

function isLayoutLocked(lifecycle: CardLifecycle): boolean {
  return ['layoutLocked', 'contentAssigned', 'contentLocked', 'readyToPreview', 'saved', 'readyToDeploy'].includes(lifecycle);
}
