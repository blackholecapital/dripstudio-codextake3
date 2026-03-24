import type { EditorCard } from '@gateway/core-types';
import type { EditorRuntimeState } from '@gateway/app-core';
import { GlassPanel } from '@/components/glass/glass-panel';

interface WorkspacePanelProps {
  state: EditorRuntimeState;
  activeCard?: EditorCard;
  error: string | null;
  actions: {
    create: () => void;
    lockSize: () => void;
    lockPosition: () => void;
    lockLayout: () => void;
    assignContent: () => void;
    lockContent: () => void;
    preview: () => void;
    save: () => void;
    deploy: () => void;
    rollback: () => void;
    reset: () => void;
  };
}

export function WorkspacePanel({ state, activeCard, error, actions }: WorkspacePanelProps) {
  return (
    <GlassPanel className="relative min-h-[460px] overflow-hidden p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.18),transparent_30%)]" />
      <div className="relative flex h-full flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Workspace</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Deterministic card lifecycle engine</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">Create one active card, lock it through lifecycle stages, and reject collisions with buffer constraints.</p>
          </div>
          <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">{activeCard ? `Active: ${activeCard.stage}` : 'No active card'}</div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={actions.create} className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-white">Create card</button>
          <button type="button" onClick={actions.lockSize} className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-white">Lock size</button>
          <button type="button" onClick={actions.lockPosition} className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-white">Lock position</button>
          <button type="button" onClick={actions.lockLayout} className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-white">Lock layout</button>
          <button type="button" onClick={actions.assignContent} className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-white">Assign content</button>
          <button type="button" onClick={actions.lockContent} className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-white">Lock content</button>
          <button type="button" onClick={actions.preview} className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-white">Ready preview</button>
          <button type="button" onClick={actions.save} className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-white">Save</button>
          <button type="button" onClick={actions.deploy} className="rounded-xl border border-emerald-300/40 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-200">Ready deploy</button>
          <button type="button" onClick={actions.rollback} className="rounded-xl border border-amber-300/40 bg-amber-300/10 px-3 py-2 text-xs text-amber-100">Rollback active</button>
          <button type="button" onClick={actions.reset} className="rounded-xl border border-rose-300/40 bg-rose-300/10 px-3 py-2 text-xs text-rose-100">Clear page</button>
        </div>

        {error ? <p className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">{error}</p> : null}

        <div className="relative min-h-[260px] rounded-[20px] border border-dashed border-white/10 bg-slate-950/35">
          {state.cards.map((card) => (
            <div
              key={card.id}
              className="absolute rounded-xl border border-white/20 bg-slate-900/70 px-3 py-2 text-xs text-white"
              style={{
                left: `${card.placement.desktop.x}px`,
                top: `${card.placement.desktop.y}px`,
                width: `${card.placement.desktop.width}px`,
                height: `${card.placement.desktop.height}px`
              }}
            >
              <div className="font-semibold">{card.id}</div>
              <div className="text-[11px] text-slate-300">{card.stage}</div>
            </div>
          ))}
        </div>
      </div>
    </GlassPanel>
  );
}
