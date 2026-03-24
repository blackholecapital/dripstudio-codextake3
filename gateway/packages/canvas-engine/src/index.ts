import type { CardCoordinates, EditorCard } from '@gateway/core-types';

export interface CanvasRuleResult {
  ok: boolean;
  reason?: string;
}

export const DEFAULT_CARD_BUFFER = 16;

function overlapsWithBuffer(a: CardCoordinates, b: CardCoordinates, buffer: number): boolean {
  const aRight = a.x + a.width;
  const bRight = b.x + b.width;
  const aBottom = a.y + a.height;
  const bBottom = b.y + b.height;

  return !(aRight + buffer < b.x || bRight + buffer < a.x || aBottom + buffer < b.y || bBottom + buffer < a.y);
}

export function validateSingleActiveCard(cards: EditorCard[], activeCardId: string | null): CanvasRuleResult {
  if (!activeCardId) {
    return { ok: true };
  }

  const matches = cards.filter((card) => card.id === activeCardId);
  if (matches.length !== 1) {
    return { ok: false, reason: 'Active card must reference exactly one card.' };
  }

  return { ok: true };
}

export function validatePlacement(
  cards: EditorCard[],
  candidateCard: EditorCard,
  buffer = DEFAULT_CARD_BUFFER
): CanvasRuleResult {
  for (const existingCard of cards) {
    if (existingCard.id === candidateCard.id) {
      continue;
    }

    if (overlapsWithBuffer(existingCard.placement.desktop, candidateCard.placement.desktop, buffer)) {
      return { ok: false, reason: `Desktop placement overlaps or touches ${existingCard.id}.` };
    }

    if (overlapsWithBuffer(existingCard.placement.mobile, candidateCard.placement.mobile, buffer)) {
      return { ok: false, reason: `Mobile placement overlaps or touches ${existingCard.id}.` };
    }
  }

  return { ok: true };
}

export function getCanvasNodes(cards: EditorCard[] = []): Array<{ id: string; title: string; x: number; y: number; width: number; height: number }> {
  if (cards.length === 0) {
    return [
      { id: 'hint-1', title: 'Create a card', x: 8, y: 10, width: 180, height: 84 },
      { id: 'hint-2', title: 'Lock size → position', x: 230, y: 36, width: 220, height: 84 }
    ];
  }

  return cards.map((card) => ({
    id: card.id,
    title: card.id,
    x: card.placement.desktop.x,
    y: card.placement.desktop.y,
    width: card.placement.desktop.width,
    height: card.placement.desktop.height
  }));
}
