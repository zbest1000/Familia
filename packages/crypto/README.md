# @familia/crypto

Crypto helpers — chosen, vetted algorithms with one well-known interface.

- Passwords: argon2id with conservative parameters.
- Hashing for tamper-evidence: SHA-256.
- Tokens: 32-byte URL-safe random.

Field-level encryption (for Highly Sensitive entries — DNA, mental health, HRT) is implemented in the API layer using AWS KMS-wrapped data keys. That sits in `apps/api/src/security/` because it requires the KMS client; this package stays small and runtime-agnostic.

## Resilience contract

- Pure helpers. No external deps beyond Node's `crypto` and `argon2`.
- Argon2 is CPU-bound; the API runs password verification on a worker thread pool to avoid blocking the event loop.
