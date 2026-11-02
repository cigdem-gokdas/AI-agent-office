# Local Owner Controls

Reusable source components for a separately secured local application. This release contains bounded Go JSON/capability helpers, a read-only outbound transport, React owner-session/routing/decision controls and a CSP header helper. It is not a complete agent runtime, OAuth client, email processor, Notion integration or standalone headquarters application.

## Security changes

The Go request decoder now rejects duplicate keys at every nesting level, escaped duplicates, case-fold aliases (including Unicode aliases), incorrect top-level DTO field spelling, malformed UTF-8, trailing JSON, excessive nesting and oversized bodies. It rejects cancelled requests and invalid destinations. DTO validation and required-field checks remain the host's responsibility; nested typed DTO field spelling is not recursively enforced. Use explicit JSON tags and validate business fields before doing work.

The browser client limits operation names, clears operational records on HTTP 401 and reports uncertain server logout instead of fabricating revocation. Session capability stays in memory. Server errors must already be redacted. Client controls are never authorization. The backend must implement peer/Host/Origin/CSRF checks, authentication, scope enforcement, durable state and item-specific approvals. Approval must remain separate from application.

The outbound reader takes exact HTTPS targets configured by a trusted host for the official Notion/Gmail API origins. It exposes GET only, rejects redirects and query-bearing target URLs, bounds response size/time and request rate, and redacts errors. It acquires no credentials, reads no environment or local credential files, and never retries. There is no constructor side effect or network activity on import. An OAuth credential host, API-specific discovery, query/write operations, schema mappings, provenance, durable idempotency and readback workflow are not included. Do not use this primitive as a complete authorization or duplicate-prevention engine. Third-party responses remain untrusted data.

The CSP helper has a strict same-origin production default and an explicit development-only local websocket exception. The nonce must be generated cryptographically by the host and inserted into intended script tags. Inline styles are allowed for existing component compatibility; this is not a universal XSS proof. Apply the returned headers in a separately reviewed server; importing the helper does not activate protection.

## Checks

Use Go 1.25+, Node 22.12+, npm and Python 3. No Go modules beyond the standard library are required.

```sh
go test ./...
go test -race ./...
go vet ./...
npm ci --ignore-scripts
npm test
npm run typecheck
npm run build
python3 scripts/check-release.py
```

Frontend dependencies are isolated and pinned by the lockfile. The build emits component JavaScript and declarations into ignored `dist/`; it does not build or serve a full application. Tests use synthetic data and injected transports; they make no real account calls. No deployment, scheduling, model request, credential setup or CI workflow is activated.

## Integration contract

The components expect a compatible private backend at `/api/owner/` with session, state, inbox, route, decision and logout operations; the client also allows an authenticated snapshot read for a host that implements it. No public backend server is supplied. Bring your own reviewed authorization and persistence. No default credentials, private prompts, configuration, operational records or simulated completed work are distributed.

## Review and licenses

See `PUBLICATION_MANIFEST.json` for the exact reviewed file inventory and hashes, `PUBLIC_REVIEW.md` for verification scope, `EXCLUSIONS.md` for intentionally omitted material and `DEPENDENCY_LICENSES.json` for locked package metadata. The manifest deliberately excludes its own hash and inventories all other publishable files.

No images, models, textures, screenshots, logos, personal artwork or third-party code binaries are distributed. Dependencies remain unmodified external packages with their own licenses; installed modules and build outputs are ignored. No application-source LICENSE has been selected in this component release. The owner should choose appropriate source licensing before further publication; dependency metadata does not grant a license to application code.
