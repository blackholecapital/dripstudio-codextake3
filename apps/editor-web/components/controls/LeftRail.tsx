'use client';

import React from 'react';
import { GlassPanel, SectionHeader } from '@/components/glass/GlassPanel';
import { LifecycleBadge, LifecycleProgress } from '@/components/status/LifecycleBadge';
import { useEditorStore } from '@/state/editorStore';
import type {
  CardRecord,
  GridSize,
  CardLifecycle,
  ContentAssignment,
  EditorSnapshot,
} from '@gateway/core-types';

// ─── Size presets ─────────────────────────────────────────────────────────────

const SIZE_PRESETS: { label: string; size: GridSize }[] = [
  { label: '1×1', size: { colSpan: 1, rowSpan: 1 } },
  { label: '2×1', size: { colSpan: 2, rowSpan: 1 } },
  { label: '2×2', size: { colSpan: 2, rowSpan: 2 } },
  { label: '3×2', size: { colSpan: 3, rowSpan: 2 } },
  { label: '3×3', size: { colSpan: 3, rowSpan: 3 } },
  { label: '4×2', size: { colSpan: 4, rowSpan: 2 } },
  { label: '4×3', size: { colSpan: 4, rowSpan: 3 } },
  { label: '6×4', size: { colSpan: 6, rowSpan: 4 } },
];

export function LeftRail() {
  const {
    project,
    cards,
    activeCardId,
    lockLayout,
    deleteLastCard,
    addCard,
    setActiveCard,
    setInspectorOpen,
    saveSnapshot,
    deployDemo,
    deployProd,
    lastSaved,
  } = useEditorStore();

  const activeCard = cards.find((c) => c.id === activeCardId);

  if (!project) {
    return <ProjectSetup />;
  }

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto pr-1">
      <GlassPanel className="shrink-0 p-3">
        <SectionHeader label="Project" dot="bg-cyan-400" />
        <div className="truncate text-sm font-semibold text-white">{project.name}</div>
        <div className="mt-0.5 font-mono text-xs text-slate-500">{project.clientSlug}</div>
        <div className="mt-2 flex items-center gap-2">
          <span
            className={`lifecycle-badge px-2 py-0.5 text-[9px] ${
              project.phase === 'layout'
                ? 'badge-sizeLocked'
                : project.phase === 'content'
                  ? 'badge-contentAssigned'
                  : 'badge-readyToDeploy'
            }`}
          >
            {project.phase} phase
          </span>
          {lastSaved && (
            <span className="font-mono text-[9px] text-slate-600">
              saved {new Date(lastSaved).toLocaleTimeString()}
            </span>
          )}
        </div>
      </GlassPanel>

      <GlassPanel className="shrink-0 p-3">
        <SectionHeader
          label={`Cards (${cards.length})`}
          dot="bg-slate-400"
          action={
            project.phase === 'layout' ? (
              <button
                className="btn-glass btn-primary"
                style={{ padding: '3px 8px', fontSize: 11 }}
                onClick={() => addCard()}
              >
                + Add Card
              </button>
            ) : null
          }
        />

        {cards.length === 0 && (
          <div className="text-xs italic text-slate-600">No cards yet</div>
        )}

        <div className="flex flex-col gap-1">
          {cards.map((card) => (
            <CardListItem
              key={card.id}
              card={card}
              isActive={card.id === activeCardId}
              onClick={() => setActiveCard(card.id === activeCardId ? null : card.id)}
            />
          ))}
        </div>

        {cards.length > 0 && project.phase === 'layout' && (
          <button
            className="btn-glass btn-danger mt-2 w-full"
            style={{ fontSize: 11, padding: '4px' }}
            onClick={deleteLastCard}
          >
            ↩ Remove Last Card
          </button>
        )}
      </GlassPanel>

      {activeCard && project.phase === 'layout' && <LayoutControls card={activeCard} />}
      {activeCard && project.phase === 'content' && <ContentControls card={activeCard} />}

      {project.phase === 'layout' && cards.some((c) => c.lifecycle === 'positionLocked') && (
        <GlassPanel className="shrink-0 p-3">
          <SectionHeader label="Layout" dot="bg-yellow-400" />
          <p className="mb-2 text-xs text-slate-400">
            All positioned cards will be permanently locked.
          </p>
          <button className="btn-glass btn-primary w-full" onClick={lockLayout}>
            Lock Layout →
          </button>
        </GlassPanel>
      )}

      <GlassPanel className="mt-auto shrink-0 p-3">
        <SectionHeader label="Output" dot="bg-green-400" />
        <div className="flex flex-col gap-2">
          <button className="btn-glass w-full" onClick={saveSnapshot}>
            Save Snapshot
          </button>
          <button className="btn-glass w-full" onClick={() => setInspectorOpen(true)}>
            Inspect JSON
          </button>
          <div className="my-1 h-px bg-white/5" />
          <button className="btn-glass btn-primary w-full" onClick={deployDemo}>
            Deploy Demo
          </button>
          <button className="btn-glass btn-success w-full" onClick={deployProd}>
            Deploy Production
          </button>
        </div>
      </GlassPanel>
    </div>
  );
}

// ─── Card list item ───────────────────────────────────────────────────────────

function CardListItem({
  card,
  isActive,
  onClick,
}: {
  card: CardRecord;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg px-2.5 py-2 text-left transition-all ${
        isActive
          ? 'border border-cyan-500/30 bg-cyan-500/10'
          : 'border border-transparent bg-white/5 hover:border-white/10 hover:bg-white/10'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`truncate text-xs font-medium ${isActive ? 'text-cyan-300' : 'text-slate-300'}`}>
          {card.label}
        </span>
        <LifecycleBadge lifecycle={card.lifecycle} size="sm" />
      </div>
      {card.size && (
        <div className="mt-0.5 font-mono text-[9px] text-slate-600">
          {card.size.colSpan}×{card.size.rowSpan}
          {card.position ? ` @ ${card.position.col},${card.position.row}` : ''}
        </div>
      )}
      {isActive && <LifecycleProgress lifecycle={card.lifecycle} />}
    </button>
  );
}

// ─── Layout phase controls ────────────────────────────────────────────────────

function LayoutControls({ card }: { card: CardRecord }) {
  const { setCardSize, lockCardSize, setCardPosition, lockCardPosition, autoPositionCard, project } =
    useEditorStore();

  const [posCol, setPosCol] = React.useState(card.position?.col ?? 0);
  const [posRow, setPosRow] = React.useState(card.position?.row ?? 0);

  React.useEffect(() => {
    setPosCol(card.position?.col ?? 0);
    setPosRow(card.position?.row ?? 0);
  }, [card.id, card.position?.col, card.position?.row]);

  const canSetSize = ['draft', 'sizeLocked'].includes(card.lifecycle);
  const canSetPos = ['sizeLocked', 'positionLocked'].includes(card.lifecycle);
  const canLockSize = card.lifecycle === 'draft' && card.size !== null;
  const canLockPos = card.lifecycle === 'sizeLocked' && card.position !== null;

  return (
    <GlassPanel className="shrink-0 p-3">
      <SectionHeader label="Layout Controls" dot="bg-orange-400" />

      <div className="mb-3">
        <div className="mb-1.5 text-[10px] uppercase tracking-wider text-slate-500">Card Size</div>
        <div className="grid grid-cols-4 gap-1">
          {SIZE_PRESETS.map((preset) => {
            const isSelected =
              card.size?.colSpan === preset.size.colSpan &&
              card.size?.rowSpan === preset.size.rowSpan;

            return (
              <button
                key={preset.label}
                disabled={!canSetSize}
                onClick={() => setCardSize(card.id, preset.size)}
                className={`rounded border px-1 py-1.5 font-mono text-[10px] transition-all ${
                  isSelected
                    ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-300'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                } disabled:cursor-not-allowed disabled:opacity-30`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {card.size && (
          <div className="mt-1.5 text-center font-mono text-[10px] text-slate-500">
            {card.size.colSpan}col × {card.size.rowSpan}row
          </div>
        )}

        <button
          className="btn-glass btn-primary mt-2 w-full"
          disabled={!canLockSize}
          onClick={() => lockCardSize(card.id)}
        >
          Lock Size →
        </button>
      </div>

      {card.lifecycle !== 'draft' && (
        <div>
          <div className="mb-1.5 text-[10px] uppercase tracking-wider text-slate-500">Position</div>
          <div className="mb-2 flex gap-2">
            <div className="flex-1">
              <div className="mb-1 text-[9px] text-slate-600">Col</div>
              <input
                type="number"
                min={0}
                max={(project?.gridConfig.cols ?? 12) - 1}
                value={posCol}
                disabled={!canSetPos}
                className="glass-input w-full"
                onChange={(e) => {
                  const v = Number.parseInt(e.target.value, 10) || 0;
                  setPosCol(v);
                  setCardPosition(card.id, { col: v, row: posRow });
                }}
              />
            </div>
            <div className="flex-1">
              <div className="mb-1 text-[9px] text-slate-600">Row</div>
              <input
                type="number"
                min={0}
                max={(project?.gridConfig.rows ?? 8) - 1}
                value={posRow}
                disabled={!canSetPos}
                className="glass-input w-full"
                onChange={(e) => {
                  const v = Number.parseInt(e.target.value, 10) || 0;
                  setPosRow(v);
                  setCardPosition(card.id, { col: posCol, row: v });
                }}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className="btn-glass flex-1"
              disabled={!canSetPos}
              onClick={() => autoPositionCard(card.id)}
            >
              Auto Place
            </button>
            <button
              className="btn-glass btn-success flex-1"
              disabled={!canLockPos}
              onClick={() => lockCardPosition(card.id)}
            >
              Lock Position →
            </button>
          </div>

          {canSetPos && (
            <div className="mt-1.5 text-center text-[9px] text-slate-600">
              or click canvas to place
            </div>
          )}
        </div>
      )}
    </GlassPanel>
  );
}

// ─── Content phase controls ───────────────────────────────────────────────────

function ContentControls({ card }: { card: CardRecord }) {
  const { assignContent, lockContent } = useEditorStore();

  const [titleRef, setTitleRef] = React.useState(
    card.content?.fields['title']
      ? ((card.content.fields['title'] as { ref?: string }).ref ?? '')
      : '',
  );
  const [assetKey, setAssetKey] = React.useState(
    card.content?.fields['image']
      ? ((card.content.fields['image'] as { assetKey?: string }).assetKey ?? '')
      : '',
  );
  const [skinKey, setSkinKey] = React.useState(
    card.content?.fields['skin']
      ? ((card.content.fields['skin'] as { skinKey?: string }).skinKey ?? '')
      : '',
  );
  const [wallpaperKey, setWallpaperKey] = React.useState(
    card.content?.fields['wallpaper']
      ? ((card.content.fields['wallpaper'] as { wallpaperKey?: string }).wallpaperKey ?? '')
      : '',
  );

  const canEdit = ['layoutLocked', 'contentAssigned'].includes(card.lifecycle);
  const canLock = card.lifecycle === 'contentAssigned';

  function handleAssign() {
    const fields: Record<string, object> = {};

    if (titleRef.trim()) {
      fields.title = { type: 'text', ref: titleRef.trim() };
    }
    if (assetKey.trim()) {
      fields.image = { type: 'asset', assetKey: assetKey.trim() };
    }
    if (skinKey.trim()) {
      fields.skin = { type: 'skin', skinKey: skinKey.trim() };
    }
    if (wallpaperKey.trim()) {
      fields.wallpaper = { type: 'wallpaper', wallpaperKey: wallpaperKey.trim() };
    }

    if (Object.keys(fields).length === 0) {
      return;
    }

    assignContent(card.id, {
      cardId: card.id,
      fields: fields as ContentAssignment['fields'],
    });
  }

  return (
    <GlassPanel className="shrink-0 p-3">
      <SectionHeader label="Content Assignment" dot="bg-blue-400" />
      <LifecycleBadge lifecycle={card.lifecycle} />

      <div className="mt-3 flex flex-col gap-2">
        <FieldInput
          label="Title Ref"
          placeholder="e.g. welcome-title"
          value={titleRef}
          disabled={!canEdit}
          onChange={setTitleRef}
        />
        <FieldInput
          label="Asset Key"
          placeholder="e.g. hero-banner-v1"
          value={assetKey}
          disabled={!canEdit}
          onChange={setAssetKey}
        />
        <FieldInput
          label="Skin Key"
          placeholder="e.g. dark-glass"
          value={skinKey}
          disabled={!canEdit}
          onChange={setSkinKey}
        />
        <FieldInput
          label="Wallpaper Key"
          placeholder="e.g. city-night"
          value={wallpaperKey}
          disabled={!canEdit}
          onChange={setWallpaperKey}
        />
      </div>

      <div className="mt-3 flex gap-2">
        <button className="btn-glass btn-primary flex-1" disabled={!canEdit} onClick={handleAssign}>
          Assign Content
        </button>
        <button
          className="btn-glass btn-success flex-1"
          disabled={!canLock}
          onClick={() => lockContent(card.id)}
        >
          Lock →
        </button>
      </div>
    </GlassPanel>
  );
}

function FieldInput({
  label,
  placeholder,
  value,
  disabled,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  disabled: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="mb-1 text-[9px] uppercase tracking-wider text-slate-600">{label}</div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        className="glass-input w-full"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// ─── Project setup form ───────────────────────────────────────────────────────

function ProjectSetup() {
  const { initProject, loadSnapshot } = useEditorStore();
  const [name, setName] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [error, setError] = React.useState('');

  function normalizeSlug(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9-]/g, '');
  }

  function handleCreate() {
    setError('');

    const rawName = name.trim();
    const rawSlug = normalizeSlug(slug.trim());

    setName(rawName);
    setSlug(rawSlug);

    if (!rawName || !rawSlug) {
      setError('Both fields are required');
      return;
    }

    if (!/^[a-z0-9-]+$/.test(rawSlug)) {
      setError('Slug: lowercase, numbers, hyphens only');
      return;
    }

    const result = initProject(rawName, rawSlug);
    if (!result.ok) {
      setError(`Create failed: ${result.error}`);
    }
  }

  function handleLoadSaved() {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('gateway:snapshot:'));
    if (keys.length === 0) {
      setError('No saved snapshots found');
      return;
    }

    const raw = localStorage.getItem(keys[keys.length - 1]!);
    if (!raw) {
      setError('No saved snapshots found');
      return;
    }

    try {
      loadSnapshot(JSON.parse(raw) as EditorSnapshot);
      setError('');
    } catch {
      setError('Failed to parse saved snapshot');
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <div className="mb-1 text-[10px] uppercase tracking-widest text-slate-500">Gateway</div>
        <div className="text-base font-semibold text-white">New Project</div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }} className="flex flex-col gap-3" autoComplete="on">
        <div>
          <label
            htmlFor="projectName"
            className="mb-1 block text-[10px] uppercase tracking-wider text-slate-500"
          >
            Project Name
          </label>
          <input
            id="projectName"
            name="projectName"
            type="text"
            placeholder="My Portal"
            value={name}
            autoComplete="organization"
            className="glass-input w-full"
            onChange={(e) => setName(e.target.value)}
            onInput={(e) => setName((e.target as HTMLInputElement).value)}
          />
        </div>

        <div>
          <label
            htmlFor="clientSlug"
            className="mb-1 block text-[10px] uppercase tracking-wider text-slate-500"
          >
            Client Slug
          </label>
          <input
            id="clientSlug"
            name="clientSlug"
            type="text"
            placeholder="acme-corp"
            value={slug}
            autoComplete="off"
            spellCheck={false}
            className="glass-input w-full font-mono"
            onChange={(e) => setSlug(normalizeSlug(e.target.value))}
            onInput={(e) => setSlug(normalizeSlug((e.target as HTMLInputElement).value))}
          />
        </div>

        {error && <div className="text-xs text-red-400">{error}</div>}

        <button type="submit" className="btn-glass btn-primary mt-1 w-full">
          Create Project
        </button>
      </form>

      <div className="my-4 h-px bg-white/5" />

      <button className="btn-glass w-full" onClick={handleLoadSaved}>
        Load Last Snapshot
      </button>

      <div className="mt-3 rounded-lg border border-white/5 bg-white/5 px-3 py-2">
        <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-400">Next step</div>
        <div className="text-[11px] text-slate-500">
          After project creation, a starter card is added automatically. Select it to size and place
          it on the grid.
        </div>
      </div>

      <div className="mt-auto pt-4">
        <div className="text-[9px] leading-relaxed text-slate-700">
          Gateway v1.0 · deterministic · schema-first · JSON-driven
        </div>
      </div>
    </div>
  );
}

// re-export type for content controls
type _ContentAssignmentAlias = ContentAssignment;
