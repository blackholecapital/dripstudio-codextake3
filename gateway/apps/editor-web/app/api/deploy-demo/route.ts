import { createStubDeployResponse } from '@gateway/deploy-sdk';

export async function POST() {
  return Response.json(createStubDeployResponse('demo'));
}
