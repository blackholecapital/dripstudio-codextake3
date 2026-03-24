import type { EditorCard } from '@gateway/core-types';
import type { EditorRuntimeState } from '@gateway/app-core';
import { GlassPanel } from '@/components/glass/glass-panel';

interface WorkspacePanelProps {
  state: EditorRuntimeState;
  activeCard?: EditorCard;
  error: string | null;
  stageLabel: string;
  size: { width: number; height: number; mobileWidth: number; mobileHeight: number };
  position: { x: number; y: number; mobileX: number; mobileY: number };
  content: { assetId: string; uri: string; kind: 'text' | 'image' | 'video' };
  onSizeChange: (field: 'width' | 'height' | 'mobileWidth' | 'mobileHeight', value: number) => void;
  onPositionChange: (field: 'x' | 'y' | 'mobileX' | 'mobileY', value: number) => void;
  onContentChange: (field: 'assetId' | 'uri' | 'kind', value: string) => void;
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

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-300">
      {label}
      <input
        className="rounded-lg border border-white/10 bg-slate-900/50 px-2 py-1 text-white outline-none transition focus:border-cyan-300/60"
        type="number"
        value={value}
        onChange={(event: any) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

export function WorkspacePanel({ state, activeCard, error, stageLabel, size, position, content, onSizeChange, onPositionChange, onContentChange, actions }: WorkspacePanelProps) {
  const canCreate = !activeCard;
  const canLockSize = activeCard?.stage === 'draft';
  const canLockPosition = activeCard?.stage === 'sizeLocked';
  const canLockLayout = activeCard?.stage === 'positionLocked';
  const canAssign = activeCard?.stage === 'layoutLocked';
  const canLockContent = activeCard?.stage === 'contentAssigned';
  const canPreview = activeCard?.stage === 'contentLocked';
  const canSave = activeCard?.stage === 'readyToPreview';
  const canDeploy = activeCard?.stage === 'saved';

  return (
    <GlassPanel className="relative min-h-[460px] overflow-hidden p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.18),transparent_30%)]" />
      <div className="relative flex h-full flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Workspace</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Segment 3 guided editor workflow</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">Passive canvas + intent-driven controls. Card legality and stage rules are enforced in app-core/canvas-engine.</p>
          </div>
          <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">{stageLabel}</div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[1.5fr_1fr]">
          <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Card wizard</p>
            <div className="grid gap-2 md:grid-cols-2">
              <NumberField label="Desktop width" value={size.width} onChange={(v) => onSizeChange('width', v)} />
              <NumberField label="Desktop height" value={size.height} onChange={(v) => onSizeChange('height', v)} />
              <NumberField label="Mobile width" value={size.mobileWidth} onChange={(v) => onSizeChange('mobileWidth', v)} />
              <NumberField label="Mobile height" value={size.mobileHeight} onChange={(v) => onSizeChange('mobileHeight', v)} />
              <NumberField label="Desktop x" value={position.x} onChange={(v) => onPositionChange('x', v)} />
              <NumberField label="Desktop y" value={position.y} onChange={(v) => onPositionChange('y', v)} />
              <NumberField label="Mobile x" value={position.mobileX} onChange={(v) => onPositionChange('mobileX', v)} />
              <NumberField label="Mobile y" value={position.mobileY} onChange={(v) => onPositionChange('mobileY', v)} />
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Content assignment</p>
            <label className="flex flex-col gap-1 text-xs text-slate-300">Asset id<input className="rounded-lg border border-white/10 bg-slate-900/50 px-2 py-1 text-white outline-none focus:border-cyan-300/60" value={content.assetId} onChange={(event: any) => onContentChange('assetId', event.target.value)} /></label>
            <label className="flex flex-col gap-1 text-xs text-slate-300">URI<input className="rounded-lg border border-white/10 bg-slate-900/50 px-2 py-1 text-white outline-none focus:border-cyan-300/60" value={content.uri} onChange={(event: any) => onContentChange('uri', event.target.value)} /></label>
            <label className="flex flex-col gap-1 text-xs text-slate-300">Kind<select className="rounded-lg border border-white/10 bg-slate-900/50 px-2 py-1 text-white outline-none focus:border-cyan-300/60" value={content.kind} onChange={(event: any) => onContentChange('kind', event.target.value)}><option value="text">text</option><option value="image">image</option><option value="video">video</option></select></label>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={!canCreate} onClick={actions.create} className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-white disabled:opacity-40">Create active card</button>
          <button type="button" disabled={!canLockSize} onClick={actions.lockSize} className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-white disabled:opacity-40">Lock size</button>
          <button type="button" disabled={!canLockPosition} onClick={actions.lockPosition} className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-white disabled:opacity-40">Lock position</button>
          <button type="button" disabled={!canLockLayout} onClick={actions.lockLayout} className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-white disabled:opacity-40">Lock layout</button>
          <button type="button" disabled={!canAssign} onClick={actions.assignContent} className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-white disabled:opacity-40">Assign content</button>
          <button type="button" disabled={!canLockContent} onClick={actions.lockContent} className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-white disabled:opacity-40">Lock content</button>
          <button type="button" disabled={!canPreview} onClick={actions.preview} className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-white disabled:opacity-40">Ready preview</button>
          <button type="button" disabled={!canSave} onClick={actions.save} className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-white disabled:opacity-40">Save</button>
          <button type="button" disabled={!canDeploy} onClick={actions.deploy} className="rounded-xl border border-emerald-300/40 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-200 disabled:opacity-40">Ready deploy</button>
          <button type="button" disabled={!activeCard} onClick={actions.rollback} className="rounded-xl border border-amber-300/40 bg-amber-300/10 px-3 py-2 text-xs text-amber-100 disabled:opacity-40">Rollback active</button>
          <button type="button" onClick={actions.reset} className="rounded-xl border border-rose-300/40 bg-rose-300/10 px-3 py-2 text-xs text-rose-100">Clear page</button>
        </div>

        {error ? <p className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">{error}</p> : <p className="text-xs text-slate-400">No active errors. Use the wizard to progress one card at a time.</p>}

        <div className="relative min-h-[260px] rounded-[20px] border border-dashed border-white/10 bg-slate-950/35">
          {state.cards.length === 0 ? <p className="absolute left-4 top-4 text-xs text-slate-400">Canvas is passive. Start by creating the active card.</p> : null}
          {state.cards.map((card) => {
            const isActive = card.id === state.activeCardId;
            return (
              <div
                key={card.id}
                className={`absolute rounded-xl border px-3 py-2 text-xs transition ${isActive ? 'border-cyan-300/70 bg-cyan-400/20 text-cyan-100' : 'border-white/20 bg-slate-900/70 text-white opacity-85'}`}
                style={{
                  left: `${card.placement.desktop.x}px`,
                  top: `${card.placement.desktop.y}px`,
                  width: `${card.placement.desktop.width}px`,
                  height: `${card.placement.desktop.height}px`
                }}
              >
                <div className="font-semibold">{card.id}</div>
                <div className="text-[11px]">{card.stage}</div>
                <div className="text-[10px] text-slate-300">{isActive ? 'Active (editable)' : 'Locked / inert'}</div>
              </div>
            );
          })}
        </div>
      </div>
    </GlassPanel>
  );
}
