import { GlassPanel } from '@/components/glass/glass-panel';
import { canvasNodes, deployTargets } from '@/lib/dashboard';

export function WorkspacePanel() {
  return (
    <GlassPanel className="relative min-h-[460px] overflow-hidden p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.18),transparent_30%)]" />
      <div className="relative flex h-full flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Workspace</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Cloudflare Worker command deck</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              Deployable shell foundation for the editor surface, tuned for Workers-compatible Next.js delivery.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
            App Router + Worker output
          </div>
        </div>

        <div className="grid flex-1 gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="relative rounded-[24px] border border-white/10 bg-slate-950/35 p-5">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.1),rgba(51,65,85,0.22))]" />
            <div className="relative h-full min-h-[260px] rounded-[20px] border border-dashed border-white/10">
              {canvasNodes.map((node) => (
                <div
                  key={node.id}
                  className="absolute w-40 rounded-2xl border border-white/12 bg-slate-900/60 px-4 py-3 shadow-lg backdrop-blur-xl"
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                  <div className="text-xs uppercase tracking-[0.28em] text-slate-400">Node</div>
                  <div className="mt-2 text-sm font-medium text-white">{node.title}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {deployTargets.map((target) => (
              <div key={target.id} className="rounded-[24px] border border-white/10 bg-black/25 p-5">
                <div className="text-xs uppercase tracking-[0.3em] text-slate-400">{target.label}</div>
                <div className="mt-3 text-sm text-slate-200">Preview: {target.previewUrl}</div>
                <div className="mt-2 text-xs text-slate-400">Bucket: {target.bucket}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
