'use client';

import { useMemo, useState } from 'react';
import type { EditorCard } from '@gateway/core-types';
import {
  assignCardContent,
  clearPage,
  createCard,
  createInitialState,
  getShellMetrics,
  lockCardContent,
  lockCardLayout,
  lockCardPosition,
  lockCardSize,
  markReadyToDeploy,
  markReadyToPreview,
  rollbackActiveCard,
  saveCard,
  toDeterministicContract,
  type EditorRuntimeState
} from '@gateway/app-core';
import { editorContractSchema } from '@gateway/schemas';
import { StatusStrip } from '@/components/status/status-strip';
import { ControlRail } from '@/components/controls/control-rail';
import { WorkspacePanel } from '@/components/shell/workspace-panel';
import { InspectorPanel } from '@/components/shell/inspector-panel';

function updateState(state: EditorRuntimeState, setState: (next: EditorRuntimeState) => void, setError: (msg: string | null) => void, next: { ok: boolean; state: EditorRuntimeState; error?: string }) {
  setState(next.state);
  setError(next.ok ? null : next.error ?? 'Action failed');
}

export function EditorWorkbench() {
  const [state, setState] = useState<EditorRuntimeState>(() => createInitialState('segment-3-client'));
  const [error, setError] = useState<string | null>(null);
  const [size, setSize] = useState({ width: 184, height: 108, mobileWidth: 144, mobileHeight: 96 });
  const [position, setPosition] = useState({ x: 30, y: 30, mobileX: 12, mobileY: 12 });
  const [content, setContent] = useState<{ assetId: string; uri: string; kind: 'text' | 'image' | 'video' }>({ assetId: 'asset-1', uri: 'content://1', kind: 'text' });

  const contract = useMemo(() => toDeterministicContract(state), [state]);
  const contractValidation = useMemo(() => editorContractSchema.safeParse(contract), [contract]);

  const activeCard = state.cards.find((card: EditorCard) => card.id === state.activeCardId);
  const stageLabel = activeCard ? `${activeCard.id} • ${activeCard.stage}` : 'No active card (create next card)';

  const actions = {
    create: () => updateState(state, setState, setError, createCard(state)),
    lockSize: () => updateState(state, setState, setError, lockCardSize(state, { width: size.width, height: size.height }, { width: size.mobileWidth, height: size.mobileHeight })),
    lockPosition: () =>
      updateState(
        state,
        setState,
        setError,
        lockCardPosition(state, { x: position.x, y: position.y }, { x: position.mobileX, y: position.mobileY })
      ),
    lockLayout: () => updateState(state, setState, setError, lockCardLayout(state)),
    assignContent: () => updateState(state, setState, setError, assignCardContent(state, [{ assetId: content.assetId, kind: content.kind, uri: content.uri }])),
    lockContent: () => updateState(state, setState, setError, lockCardContent(state)),
    preview: () => updateState(state, setState, setError, markReadyToPreview(state)),
    save: () => updateState(state, setState, setError, saveCard(state)),
    deploy: () => updateState(state, setState, setError, markReadyToDeploy(state)),
    rollback: () => updateState(state, setState, setError, rollbackActiveCard(state)),
    reset: () => updateState(state, setState, setError, clearPage(state))
  };

  return (
    <>
      <StatusStrip metrics={getShellMetrics(state)} />
      <div className="grid flex-1 gap-4 xl:grid-cols-[260px_minmax(0,1fr)_340px]">
        <ControlRail activeStage={activeCard?.stage ?? 'idle'} cardCount={state.cards.length} />
        <WorkspacePanel
          state={state}
          activeCard={activeCard}
          error={error}
          stageLabel={stageLabel}
          size={size}
          position={position}
          content={content}
          onSizeChange={(field, value) => setSize((prev: typeof size) => ({ ...prev, [field]: value }))}
          onPositionChange={(field, value) => setPosition((prev: typeof position) => ({ ...prev, [field]: value }))}
          onContentChange={(field, value) => setContent((prev: typeof content) => ({ ...prev, [field]: value as never }))}
          actions={actions}
        />
        <InspectorPanel contract={contract} isContractValid={contractValidation.success} activeStage={activeCard?.stage ?? 'idle'} />
      </div>
    </>
  );
}
