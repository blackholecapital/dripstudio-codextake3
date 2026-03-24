import clsx from 'clsx';

export function panelClassName(extra?: string): string {
  return clsx(
    'rounded-[28px] border border-white/12 bg-white/8 shadow-[0_20px_80px_rgba(15,23,42,0.45)] backdrop-blur-2xl',
    extra
  );
}
