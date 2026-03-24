import { deployRequestExample } from '@gateway/schemas';
import { GlassPanel } from '@/components/glass/glass-panel';

export function InspectorPanel() {
  return (
    <GlassPanel className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-fuchsia-200/70">Inspector</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Deploy stub payload</h2>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">Mutable later</div>
      </div>
      <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-xs text-slate-300">
        {JSON.stringify(deployRequestExample, null, 2)}
      </pre>
    </GlassPanel>
  );
}
