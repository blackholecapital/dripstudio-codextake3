import type { EditorContract } from '@gateway/core-types';
import { GlassPanel } from '@/components/glass/glass-panel';

interface InspectorPanelProps {
  contract: EditorContract;
  isContractValid: boolean;
  activeStage: string;
}

export function InspectorPanel({ contract, isContractValid, activeStage }: InspectorPanelProps) {
  return (
    <GlassPanel className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-fuchsia-200/70">Inspector</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Deterministic JSON contract</h2>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">Stage: {activeStage}</div>
      </div>
      <div className="mt-3 text-xs text-slate-300">Schema valid: {isContractValid ? 'yes' : 'no'}</div>
      <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-xs text-slate-300">
        {JSON.stringify(contract, null, 2)}
      </pre>
    </GlassPanel>
  );
}
