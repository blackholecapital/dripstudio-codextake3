import type { StatusMetric } from '@gateway/core-types';
import { GlassPanel } from '@/components/glass/glass-panel';

const toneStyles: Record<NonNullable<StatusMetric['tone']>, string> = {
  neutral: 'text-slate-200',
  positive: 'text-emerald-300',
  warning: 'text-amber-300'
};

export function StatusStrip({ metrics }: { metrics: StatusMetric[] }) {
  return (
    <GlassPanel className="grid gap-3 p-4 md:grid-cols-3">
      {metrics.map((metric) => (
        <div key={metric.label} className="rounded-2xl border border-white/8 bg-black/20 p-4">
          <div className="text-xs uppercase tracking-[0.28em] text-slate-400">{metric.label}</div>
          <div className={`mt-3 text-2xl font-semibold ${toneStyles[metric.tone ?? 'neutral']}`}>{metric.value}</div>
        </div>
      ))}
    </GlassPanel>
  );
}
