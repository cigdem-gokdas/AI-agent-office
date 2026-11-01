# Local Owner Controls

A small reusable source component release: Go bounded JSON/capability helpers and React owner-session, inbox-routing and item-specific decision controls. This is not a full agent application or a standalone headquarters demo.

## Integration

The React components require a compatible private backend at `/api/owner/` implementing session, state, inbox, route, decision and logout. Backend authentication, peer/Host/Origin/CSRF enforcement, authorization and persistence are mandatory and are deliberately not replaced by these client components. The JSON/capability helpers alone are not a complete security boundary. No models or external account integration are included.

Private runtime adapters, policy, prompts, agents, skills, operational configuration and state are intentionally absent. The original immersive application and its artwork are not distributed here. No default credentials, external action or simulated execution is supplied. Run controls only with your own separately reviewed owner-authorized backend.

## Checks

Use Go 1.25+ and Node 22.12+. `go test ./...` checks the generic transport package. After installing the locked frontend development dependencies, `npm test` and `npm run typecheck` validate the client components. There is no standalone frontend application/build entry point in this source-component release. Dependency versions preserve the tested source environment; nothing is vendored.

## Assets and licenses

No images, models, textures, screenshots, logos, sound, personal artwork or third-party asset binaries are included. Package dependencies remain external and retain their upstream licenses. No affiliation with a social platform is asserted.
