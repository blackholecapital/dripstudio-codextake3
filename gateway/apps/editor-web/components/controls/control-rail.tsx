import { GlassPanel } from '@/components/glass/glass-panel';

const controls = [
  { label: 'Overview', accent: 'from-cyan-400 to-blue-500' },
  { label: 'Canvas', accent: 'from-violet-400 to-fuchsia-500' },
  { label: 'Deploy', accent: 'from-emerald-400 to-teal-500' },
  { label: 'Reports', accent: 'from-amber-300 to-orange-500' }
];

export function ControlRail() {
  return (
    <GlassPanel className="flex h-full flex-col justify-between p-4">
      <div className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Gateway</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Control rail</h2>
        </div>
        {controls.map((control) => (
          <button
            key={control.label}
            className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-left transition hover:border-white/20 hover:bg-white/10"
            type="button"
          >
            <span className={`h-9 w-1 rounded-full bg-gradient-to-b ${control.accent}`} />
            <span>
              <span className="block text-sm font-medium text-white">{control.label}</span>
              <span className="block text-xs text-slate-400">Segment 1 shell surface</span>
            </span>
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-slate-300">
        Worker-ready foundation with minimal deploy stubs and package exports.
      </div>
    </GlassPanel>
  );
}
