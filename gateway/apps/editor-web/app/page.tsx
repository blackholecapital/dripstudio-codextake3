import { ControlRail } from '@/components/controls/control-rail';
import { InspectorPanel } from '@/components/shell/inspector-panel';
import { WorkspacePanel } from '@/components/shell/workspace-panel';
import { StatusStrip } from '@/components/status/status-strip';
import { shellMetrics } from '@/lib/dashboard';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050816] px-4 py-6 text-white md:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col gap-4">
        <StatusStrip metrics={shellMetrics} />
        <div className="grid flex-1 gap-4 xl:grid-cols-[260px_minmax(0,1fr)_320px]">
          <ControlRail />
          <WorkspacePanel />
          <InspectorPanel />
        </div>
      </div>
    </main>
  );
}
