# data/internal/

This directory holds `rightsStatus: third_party_restricted` and
`internal_reference_only` material only — R07 past-exam text, analysis notes
derived from it, or anything else that must never reach public UI, production
seed data, or the LP.

Rules:

- Nothing in this directory is imported by `app/`, `components/`, or
  `data/seed/`.
- `lib/rights/canPublishQuestion.ts` is the single gate that decides
  publishability; it always excludes these two statuses regardless of any
  other field.
- `tests/unit/rights.test.ts` asserts this exclusion — do not weaken it to
  make a feature work. If a feature needs restricted data to be visible
  somewhere, that's a rights-policy decision, not a code change: file a
  `decision` issue instead (see `docs/operations/decision-queue.md`).
