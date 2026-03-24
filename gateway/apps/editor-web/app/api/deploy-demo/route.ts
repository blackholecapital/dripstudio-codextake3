import { createDeployPayload, dispatchDeployPayload } from '@gateway/deploy-sdk';
import { deployPayloadSchema } from '@gateway/schemas';
import type { WorkerBindings } from '@gateway/env-sdk';

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = deployPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ ok: false, error: 'Invalid deploy payload.' }, { status: 400 });
  }

  const env = (process.env as unknown as WorkerBindings) ?? {};
  const payload = createDeployPayload({
    initiatedBy: parsed.data.initiatedBy,
    contract: parsed.data.contract,
    targetId: 'demo',
    env
  });

  const result = dispatchDeployPayload(payload, env);
  return Response.json(result);
}
