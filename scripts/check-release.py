"""Deterministic local inventory/privacy checks; not a comprehensive secret scanner."""
from pathlib import Path
import hashlib
import json
import re
import sys

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / "PUBLICATION_MANIFEST.json").read_text())
expected = {item["path"] for item in manifest["files"]} | {"PUBLICATION_MANIFEST.json"}
failures = []
actual = set()
skip = {".git", "node_modules", "dist"}
def visit(folder):
    for path in folder.iterdir():
        rel = path.relative_to(root).as_posix()
        if path.is_symlink():
            failures.append((rel, "symlink"))
        elif path.is_dir():
            if path.parent == root and path.name in skip:
                continue
            visit(path)
        else:
            actual.add(rel)
visit(root)
for rel in sorted(actual ^ expected):
    failures.append((rel, "unexpected or missing publication file"))
patterns = {
    "credential": r"\b(?:sk-ant-|ghp_|github_pat_|ntn_|secret_|ya29\.)[A-Za-z0-9_.-]{20,}",
    "private key": r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----",
    "personal absolute path": r"/(?:Users|home)/[^\s\"'<>]+",
    "cloud key": r"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b",
    "bearer literal": r"Bearer\s+[A-Za-z0-9_.-]{24,}",
    "external object identifier": r"(?<![A-Za-z0-9])[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}(?![A-Za-z0-9])",
}
for rel in sorted(actual & expected):
    path = root / rel
    if path.name.lower() in {"agent.md", "agents.md", "skill.md"} or path.name.startswith(".env"):
        failures.append((rel, "private filename"))
    data = path.read_bytes()
    try:
        text = data.decode("utf-8")
    except UnicodeDecodeError:
        failures.append((rel, "binary or invalid UTF-8"))
        continue
    if "\x00" in text:
        failures.append((rel, "binary NUL"))
    for label, pattern in patterns.items():
        if re.search(pattern, text):
            failures.append((rel, label))
    for email in re.findall(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}", text):
        if not email.endswith((".invalid", ".example", "@example.com")):
            failures.append((rel, "non-synthetic email"))
for item in manifest["files"]:
    path = root / item["path"]
    if path.is_file():
        data = path.read_bytes()
        if len(data) != item["bytes"] or hashlib.sha256(data).hexdigest() != item["sha256"]:
            failures.append((item["path"], "manifest hash/size mismatch"))
lock = json.loads((root / "package-lock.json").read_text())
for key, value in lock["packages"].items():
    if key and value.get("license") not in {"MIT", "ISC", "Apache-2.0", "BSD-3-Clause", "MPL-2.0", "0BSD"}:
        failures.append((key, "unreviewed license metadata"))
    if "resolved" in value and not value["resolved"].startswith("https://registry.npmjs.org/"):
        failures.append((key, "unreviewed dependency source"))
if failures:
    for rel, reason in failures:
        print(f"FAIL: {rel}: {reason}")  # Never print matching sensitive values.
    sys.exit(1)
print(f"PASS: {len(expected)} publication files; exact inventory and hashes; deterministic privacy checks; locked license/source metadata")
print("LIMIT: pattern checks and package metadata are not comprehensive secret, confidentiality or vulnerability certification")
