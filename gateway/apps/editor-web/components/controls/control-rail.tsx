import { GlassPanel } from '@/components/glass/glass-panel';

interface ControlRailProps {
  activeStage: string;
  cardCount: number;
}

const flow = [
  'draft',
  'sizeLocked',
  'positionLocked',
  'layoutLocked',
  'contentAssigned',
  'contentLocked',
  'readyToPreview',
  'saved',
  'readyToDeploy'
] as const;

export function ControlRail({ activeStage, cardCount }: ControlRailProps) {
  return (
    <GlassPanel className="flex h-full flex-col justify-between p-4">
      <div className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Gateway</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Guided flow</h2>
        </div>
        <div className="space-y-2">
          {flow.map((step, index) => {
            const isActive = activeStage === step;
            return (
              <div
                key={step}
                className={`rounded-xl border px-3 py-2 text-xs transition ${
                  isActive ? 'border-cyan-300/60 bg-cyan-400/10 text-cyan-100' : 'border-white/10 bg-slate-950/35 text-slate-300'
                }`}
              >
                <div className="font-medium">{index + 1}. {step}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-slate-300">
        Cards on page: <span className="font-semibold text-white">{cardCount}</span>
      </div>
    </GlassPanel>
  );
}
