import { defineCloudflareConfig } from '@opennextjs/cloudflare';

export default defineCloudflareConfig({
  // Keep the Segment 1 foundation minimal and deterministic for CI/staging packaging.
});
