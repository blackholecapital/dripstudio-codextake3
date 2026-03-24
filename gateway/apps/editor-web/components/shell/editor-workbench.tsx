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
  const [state, setState] = useState<EditorRuntimeState>(() => createInitialState('segment-2-client'));
  const [error, setError] = useState<string | null>(null);

  const contract = useMemo(() => toDeterministicContract(state), [state]);
  const contractValidation = useMemo(() => editorContractSchema.safeParse(contract), [contract]);

  const activeCard = state.cards.find((card: EditorCard) => card.id === state.activeCardId);

  const actions = {
    create: () => updateState(state, setState, setError, createCard(state)),
    lockSize: () => updateState(state, setState, setError, lockCardSize(state, { width: 184, height: 108 }, { width: 144, height: 96 })),
    lockPosition: () => {
      const slot = state.cards.length * 220;
      updateState(state, setState, setError, lockCardPosition(state, { x: 30 + slot, y: 30 }, { x: 12, y: 12 + state.cards.length * 112 }));
    },
    lockLayout: () => updateState(state, setState, setError, lockCardLayout(state)),
    assignContent: () =>
      updateState(
        state,
        setState,
        setError,
        assignCardContent(state, [{ assetId: `asset-${state.sequence}`, kind: 'text', uri: `content://${state.sequence}` }])
      ),
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
      <div className="grid flex-1 gap-4 xl:grid-cols-[260px_minmax(0,1fr)_320px]">
        <ControlRail />
        <WorkspacePanel state={state} activeCard={activeCard} error={error} actions={actions} />
        <InspectorPanel contract={contract} isContractValid={contractValidation.success} activeStage={activeCard?.stage ?? 'idle'} />
      </div>
    </>
  );
}
