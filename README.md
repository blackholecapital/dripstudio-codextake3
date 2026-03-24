# Gateway Segment 1 Foundation

Cloudflare Workers-deployable monorepo foundation for the editor web shell. The repo uses a Next.js App Router app inside a real npm workspace, with OpenNext Cloudflare build output targeting **Workers** rather than Pages.

## Workspace layout

```text
gateway/
├─ apps/editor-web
├─ packages/{app-core,canvas-engine,core-types,deploy-sdk,env-sdk,schemas,ui,utils}
├─ docs/handoffs
└─ tests/unit
```

## Requirements

- Node.js 20+
- npm 10+
- Cloudflare account authenticated for real deploys (`wrangler login`)

## Install

```bash
npm install
```

## Local development

Run the Next.js shell locally:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Worker preview

Build the Worker bundle and preview it with Wrangler:

```bash
npm run preview:worker
```

This uses the staging environment section from `wrangler.toml` and serves the OpenNext Worker locally.

## Build

```bash
npm run build
```

This generates Cloudflare Worker output under `gateway/apps/editor-web/.open-next/`.

## Tests and checks

```bash
npm run test
npm run typecheck
npm run lint
```

## Staging deploy preparation

Dry-run a staging deployment:

```bash
npm run deploy:staging
```

The command builds the Worker bundle and validates Wrangler deploy packaging without publishing.

## Environment placeholders

`wrangler.toml` includes placeholder values for:

- demo bucket + preview bucket
- prod bucket + preview bucket
- demo preview URL
- gateway preview URL
- staging overrides for the same values

Replace those placeholders before a live deployment.

## Stub endpoints

- `POST /api/deploy-demo`
- `POST /api/deploy-gateway`

Both return structured JSON from `@gateway/deploy-sdk`, providing stable interfaces for later backend wiring.
