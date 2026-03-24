import { EditorWorkbench } from '@/components/shell/editor-workbench';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050816] px-4 py-6 text-white md:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col gap-4">
        <EditorWorkbench />
      </div>
    </main>
  );
}
