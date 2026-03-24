import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gateway Editor Web',
  description: 'Cloudflare Worker deployable shell foundation for Segment 1.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
