# Segment 3 Update — Worker 1

## What changed
- Added guided workflow controls for creating and progressing a single active card through lifecycle stages.
- Added state-gated wizard controls for size, placement, content assignment, and sequential progression.
- Kept legality enforcement in `@gateway/app-core` / `@gateway/canvas-engine`; UI dispatches intents only.
- Refined passive canvas differentiation for active vs locked cards and improved live deterministic JSON inspector visibility.
- Expanded tests for single-active-card rule, rollback-only delete semantics, lock gating, locked-card inert behavior, and deterministic JSON expectations.

## Known gaps
- Content assignment UX is single-asset focused in this thin slice (multi-asset UI is deferred).
- Canvas placement is numeric input-driven (no drag interactions by design for passive wireframe scope).

## Segment 4 exact next steps
1. Wire demo/prod deploy intents to real backend routes and bucket flows.
2. Replace stub deploy API responses with real job orchestration and status polling.
3. Add mobile shell refinement pass (spacing, typography, inspector collapse behavior).
4. Add e2e coverage for deploy workflow and project load/save hydration behavior.
