import type { PropsWithChildren } from 'react';
import { panelClassName } from '@gateway/ui';

interface GlassPanelProps extends PropsWithChildren {
  className?: string;
}

export function GlassPanel({ children, className }: GlassPanelProps) {
  return <section className={panelClassName(className)}>{children}</section>;
}
