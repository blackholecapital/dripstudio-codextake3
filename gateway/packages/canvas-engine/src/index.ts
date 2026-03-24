export interface CanvasNode {
  id: string;
  title: string;
  x: number;
  y: number;
}

export function getCanvasNodes(): CanvasNode[] {
  return [
    { id: 'intake', title: 'Intake Queue', x: 12, y: 18 },
    { id: 'routing', title: 'Worker Routing', x: 46, y: 38 },
    { id: 'deploy', title: 'Deploy Handshake', x: 74, y: 22 }
  ];
}
