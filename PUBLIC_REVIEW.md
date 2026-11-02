# Public component review

Reviewed: 2026-11-02. Base: cff4b4d on the existing main branch. No stage, commit, push, remote mutation or inherited private history.

## Selection

Accepted: generic duplicate-safe bounded JSON/capability transport; browser session-expiry and logout fixes; generic CSP helper; strictly read-only exact-target HTTPS primitive; synthetic regression tests; component build configuration and publication documentation. Existing component presentation is retained. Unused graphics/styling dependencies were removed from this component-only package; the locked React/state/test/compiler dependencies remain. No asset license needs to be inferred because no assets are included.

Excluded: complete private application, authorization/grant policies, personal instructions, account credentials, destination identifiers, proprietary workflows, real data and all artwork. Detailed exclusions are in EXCLUSIONS.md. This release does not claim live Notion/Gmail account connectivity, safe approved writes or a functioning agent company.

## Checks

Go tests, race tests and vet; frontend synthetic security tests; TypeScript; component JS/declaration build; exact manifest inventory/hash checks; deterministic filename/content privacy checks; Git whitespace, unchanged HEAD and empty index checks. Test commands are in README.md. No real external account/model requests are made by tests.

A first offline npm install failed because locked tarballs were not all cached. The reduced locked set was then installed from the official npm registry with lifecycle scripts disabled, user/global credential configuration disabled, and no audit/fund requests. No installed dependencies are publication files.

Dependencies have MIT, Apache-2.0, ISC, BSD-3-Clause or MPL-2.0 license metadata. MPL packages are unmodified optional upstream dependencies, not vendored source or binaries; redistribution would require preserving applicable notices/terms. No unknown license metadata remains in the lockfile. DEPENDENCY_LICENSES.json records every locked package, including optional platform packages. Original application source licensing remains an owner decision; no license was invented.

No dedicated gitleaks/trufflehog executable was available. Deterministic checks inspect every manifest file and reject unexpected files, symlinks, binary assets, suspicious credential patterns, personal paths, non-reserved email addresses and private filenames. Human review of every included source/document and dependency metadata supplements this scan. Pattern checks are not a guarantee that all secrets or confidential semantics are absent, and do not audit remote GitHub state or upstream dependency vulnerabilities. No remote fetch/push or online security audit was run.

The private project was read only. A private temporary baseline checks inspected source hashes and its Git index/status. Publication files contain no private paths, baseline records, account IDs or authentication material. Existing clean release history remains unchanged. Review the exact unstaged diff and publication manifest manually before deciding what to stage and commit.

## Exact file changes

Modified (10):

- `.gitignore`
- `EXCLUSIONS.md`
- `PUBLICATION_MANIFEST.json`
- `README.md`
- `frontend/data/ownerBridge.ts`
- `frontend/tests/owner-bridge.test.ts`
- `package-lock.json`
- `package.json`
- `transport/transport.go`
- `transport/transport_test.go`

Added (9):

- `DEPENDENCY_LICENSES.json`
- `PUBLIC_REVIEW.md`
- `frontend/security/headers.ts`
- `frontend/tests/rendering.test.tsx`
- `frontend/tests/security-headers.test.ts`
- `outbound/reader.go`
- `outbound/reader_test.go`
- `scripts/check-release.py`
- `tsconfig.build.json`

Unchanged (3): `frontend/components/OwnerControls.tsx`, `go.mod`, `tsconfig.json`.

Final observed results: Go tests/race/vet PASS (both packages); frontend 12 tests PASS; TypeScript PASS; component build PASS; deterministic 22-file inventory/hash/privacy check PASS; Git whitespace check PASS. No staged changes; HEAD remains cff4b4d. The inspected private-source hashes and private Git index/status remain unchanged.
