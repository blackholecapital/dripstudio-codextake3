'use client';

import { create } from 'zustand';
import type {
  Project,
  CardRecord,
  GridSize,
  GridPosition,
  ContentAssignment,
  MobilePosition,
  EditorSnapshot,
  GatewayJsonOutput,
  DeployResult,
} from '@gateway/core-types';
import {
  cmdCreateProject,
  cmdCreateCard,
  cmdSetCardSize,
  cmdLockCardSize,
  cmdSetCardPosition,
  cmdLockCardPosition,
  cmdLockLayout,
  cmdAssignContent,
  cmdLockContent,
  cmdDeleteLastCard,
} from '@gateway/app-core';
import { serializeToGatewayJson } from '@gateway/app-core';
import { autoPosition } from '@gateway/canvas-engine';

// ─── Editor State ─────────────────────────────────────────────────────────────

export interface EditorNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface EditorState {
  // Core data
  project: Project | null;
  cards: CardRecord[];
  activeCardId: string | null;

  // UI state
  notifications: EditorNotification[];
  inspectorOpen: boolean;
  deployPanelOpen: boolean;
  lastSaved: string | null;
  lastDeployResult: DeployResult | null;
  deployMode: 'demo' | 'prod';

  // Derived / cached JSON
  generatedJson: GatewayJsonOutput | null;

  // ─── Actions: Project ─────────────────────────────────────────────────────

  initProject: (name: string, clientSlug: string) => { ok: true } | { ok: false; error: string };
  resetProject: () => void;
  loadSnapshot: (snapshot: EditorSnapshot) => void;

  // ─── Actions: Cards ───────────────────────────────────────────────────────

  addCard: (label?: string) => void;
  setCardSize: (cardId: string, size: GridSize) => void;
  lockCardSize: (cardId: string) => void;
  setCardPosition: (cardId: string, position: GridPosition) => void;
  lockCardPosition: (cardId: string) => void;
  autoPositionCard: (cardId: string) => void;
  lockLayout: () => void;
  assignContent: (cardId: string, assignment: ContentAssignment) => void;
  lockContent: (cardId: string) => void;
  deleteLastCard: () => void;
  setActiveCard: (cardId: string | null) => void;
  setCardMobile: (cardId: string, mobile: MobilePosition) => void;

  // ─── Actions: Persistence ─────────────────────────────────────────────────

  saveSnapshot: () => void;
  generateJson: () => GatewayJsonOutput | null;
  deployDemo: () => Promise<void>;
  deployProd: () => Promise<void>;

  // ─── Actions: UI ──────────────────────────────────────────────────────────

  setInspectorOpen: (open: boolean) => void;
  setDeployPanelOpen: (open: boolean) => void;
  setDeployMode: (mode: 'demo' | 'prod') => void;
  notify: (type: 'success' | 'error' | 'info', message: string) => void;
  dismissNotification: (id: string) => void;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function notifId() {
  return Math.random().toString(36).slice(2, 9);
}

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useEditorStore = create<EditorState>()((set, get) => ({
  project: null,
  cards: [],
  activeCardId: null,
  notifications: [],
  inspectorOpen: false,
  deployPanelOpen: false,
  lastSaved: null,
  lastDeployResult: null,
  deployMode: 'demo',
  generatedJson: null,

  // ─── Project ───────────────────────────────────────────────────────────────

  initProject(name, clientSlug) {
    try {
      const result = cmdCreateProject({ name, clientSlug });
      if (!result.ok) {
        get().notify('error', result.error);
        return { ok: false, error: result.error };
      }

      const firstCard = cmdCreateCard([], 'Hero');
      if (!firstCard.ok) {
        get().notify('error', firstCard.error);
        return { ok: false, error: firstCard.error };
      }

      set({
        project: result.data,
        cards: [firstCard.data],
        activeCardId: firstCard.data.id,
        lastSaved: null,
        generatedJson: null,
        lastDeployResult: null,
      });

      get().notify('success', `Project "${name}" created`);
      get().notify('info', 'Starter card added — continue from the left rail');
      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown project initialization error';
      get().notify('error', `Project creation crashed: ${message}`);
      return { ok: false, error: message };
    }
  },

  resetProject() {
    set({
      project: null,
      cards: [],
      activeCardId: null,
      lastSaved: null,
      generatedJson: null,
      lastDeployResult: null,
    });
  },

  loadSnapshot(snapshot) {
    set({
      project: snapshot.project,
      cards: snapshot.cards,
      activeCardId: snapshot.cards[0]?.id ?? null,
      lastSaved: snapshot.savedAt,
      generatedJson: null,
      lastDeployResult: null,
    });
    get().notify('info', 'Snapshot loaded');
  },

  // ─── Cards ─────────────────────────────────────────────────────────────────

  addCard(label) {
    const { cards, project } = get();
    if (!project) { get().notify('error', 'No project loaded'); return; }

    const result = cmdCreateCard(cards, label);
    if (!result.ok) { get().notify('error', result.error); return; }

    const newCards = [...cards, result.data];
    set({ cards: newCards, activeCardId: result.data.id });
  },

  setCardSize(cardId, size) {
    const { cards, project } = get();
    if (!project) return;
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    const result = cmdSetCardSize(card, size, project.gridConfig);
    if (!result.ok) { get().notify('error', result.error); return; }

    set({ cards: cards.map((c) => (c.id === cardId ? result.data : c)) });
  },

  lockCardSize(cardId) {
    const { cards } = get();
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    const result = cmdLockCardSize(card);
    if (!result.ok) { get().notify('error', result.error); return; }

    set({ cards: cards.map((c) => (c.id === cardId ? result.data : c)) });
    get().notify('success', `Size locked for "${card.label}"`);
  },

  setCardPosition(cardId, position) {
    const { cards, project } = get();
    if (!project) return;
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    const result = cmdSetCardPosition(card, position, cards, project.gridConfig);
    if (!result.ok) { get().notify('error', result.error); return; }

    set({ cards: cards.map((c) => (c.id === cardId ? result.data : c)) });
  },

  lockCardPosition(cardId) {
    const { cards, project } = get();
    if (!project) return;
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    const result = cmdLockCardPosition(card, cards, project.gridConfig);
    if (!result.ok) { get().notify('error', result.error); return; }

    set({ cards: cards.map((c) => (c.id === cardId ? result.data : c)) });
    get().notify('success', `Position locked for "${card.label}"`);
  },

  autoPositionCard(cardId) {
    const { cards, project } = get();
    if (!project) return;
    const card = cards.find((c) => c.id === cardId);
    if (!card || !card.size) {
      get().notify('error', 'Lock size first before auto-positioning');
      return;
    }

    const existing = cards
      .filter((c) => c.id !== cardId && c.position && c.size)
      .map((c) => ({ position: c.position!, size: c.size! }));

    const pos = autoPosition(card.size, existing, project.gridConfig);
    if (!pos) {
      get().notify('error', 'No valid position found — grid may be full');
      return;
    }

    get().setCardPosition(cardId, pos);
    get().notify('info', `Auto-positioned to col ${pos.col}, row ${pos.row}`);
  },

  lockLayout() {
    const { cards } = get();
    const result = cmdLockLayout(cards);
    if (!result.ok) { get().notify('error', result.error); return; }

    const project = get().project;
    if (project) {
      set({
        cards: result.data,
        project: { ...project, phase: 'content', updatedAt: new Date().toISOString() },
        activeCardId: result.data.find((c) => c.lifecycle === 'layoutLocked')?.id ?? null,
      });
    }
    get().notify('success', 'Layout locked — enter content phase');
  },

  assignContent(cardId, assignment) {
    const { cards } = get();
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    const result = cmdAssignContent(card, assignment);
    if (!result.ok) { get().notify('error', result.error); return; }

    set({ cards: cards.map((c) => (c.id === cardId ? result.data : c)) });
    get().notify('success', `Content assigned to "${card.label}"`);
  },

  lockContent(cardId) {
    const { cards } = get();
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    const result = cmdLockContent(card);
    if (!result.ok) { get().notify('error', result.error); return; }

    const updatedCards = cards.map((c) => (c.id === cardId ? result.data : c));
    const allContentLocked = updatedCards
      .filter((c) => c.lifecycle !== 'draft')
      .every((c) =>
        ['contentLocked', 'readyToPreview', 'saved', 'readyToDeploy'].includes(c.lifecycle)
      );

    const project = get().project;
    set({
      cards: updatedCards,
      project: allContentLocked && project
        ? { ...project, phase: 'complete', updatedAt: new Date().toISOString() }
        : project,
    });
    get().notify('success', `Content locked for "${card.label}"`);
  },

  deleteLastCard() {
    const { cards } = get();
    const result = cmdDeleteLastCard(cards);
    if (!result.ok) { get().notify('error', result.error); return; }

    const last = cards[cards.length - 1];
    set({
      cards: result.data,
      activeCardId: result.data.length > 0
        ? result.data[result.data.length - 1]?.id ?? null
        : null,
    });
    if (last) get().notify('info', `Removed "${last.label}"`);
  },

  setActiveCard(cardId) {
    set({ activeCardId: cardId });
  },

  setCardMobile(cardId, mobile) {
    const { cards } = get();
    set({
      cards: cards.map((c) =>
        c.id === cardId ? { ...c, mobile, updatedAt: new Date().toISOString() } : c
      ),
    });
  },

  // ─── Persistence ───────────────────────────────────────────────────────────

  saveSnapshot() {
    const { project, cards } = get();
    if (!project) { get().notify('error', 'No project to save'); return; }

    const snapshot: EditorSnapshot = {
      project,
      cards,
      savedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(
        `gateway:snapshot:${project.clientSlug}`,
        JSON.stringify(snapshot)
      );
      set({ lastSaved: snapshot.savedAt });
      get().notify('success', 'Snapshot saved locally');
    } catch {
      get().notify('error', 'Failed to save snapshot');
    }
  },

  generateJson() {
    const { project, cards } = get();
    if (!project) return null;
    try {
      const json = serializeToGatewayJson(project, cards);
      set({ generatedJson: json });
      return json;
    } catch (err) {
      get().notify('error', `JSON generation failed: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  },

  async deployDemo() {
    const json = get().generateJson();
    if (!json) return;

    try {
      const res = await fetch('/api/deploy-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      });
      const result: DeployResult = await res.json();
      set({ lastDeployResult: result });
      if (result.success) {
        get().notify('success', `Demo deployed: ${result.url}`);
      } else {
        get().notify('error', `Deploy failed: ${result.error}`);
      }
    } catch (err) {
      get().notify('error', `Deploy request failed: ${err instanceof Error ? err.message : 'Network error'}`);
    }
  },

  async deployProd() {
    const json = get().generateJson();
    if (!json) return;

    try {
      const res = await fetch('/api/deploy-gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      });
      const result: DeployResult = await res.json();
      set({ lastDeployResult: result });
      if (result.success) {
        get().notify('success', `Production deployed: ${result.url}`);
      } else {
        get().notify('error', `Deploy failed: ${result.error}`);
      }
    } catch (err) {
      get().notify('error', `Deploy request failed: ${err instanceof Error ? err.message : 'Network error'}`);
    }
  },

  // ─── UI ────────────────────────────────────────────────────────────────────

  setInspectorOpen(open) { set({ inspectorOpen: open }); },
  setDeployPanelOpen(open) { set({ deployPanelOpen: open }); },
  setDeployMode(mode) { set({ deployMode: mode }); },

  notify(type, message) {
    const notification: EditorNotification = { id: notifId(), type, message };
    set((s) => ({ notifications: [...s.notifications.slice(-4), notification] }));
    setTimeout(() => get().dismissNotification(notification.id), 4000);
  },

  dismissNotification(id) {
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }));
  },
}));
