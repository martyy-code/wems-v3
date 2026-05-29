---
name: ADR Template
description: Template for documenting architectural decisions
type: reference
---

# Architectural Decision Record (ADR) Template

## Format

```markdown
# ADR-XXX: Title

## Status
Proposed | Accepted | Deprecated | Superseded by ADR-YYY

## Date
YYYY-MM-DD

## Context
What is the issue that we're seeing that is motivating this decision?
What are the constraints (technical, business, time)?
What information do we have?

## Decision
What is the decision that we're proposing?
Be specific and actionable.

## Consequences

### Positive
- What becomes easier?
- What problems does this solve?

### Negative
- What becomes harder?
- What new problems might this create?

### Neutral
- What doesn't change?

## Alternatives Considered

### Option 1: [Name]
**Decision:** Why this was not chosen
**Trade-offs:** What would be different

### Option 2: [Name]
**Decision:** Why this was not chosen
**Trade-offs:** What would be different

## Related Decisions
- ADR-001: Related decision
- ADR-002: Related decision

## Notes
Any additional context or caveats.
```

---

## When to Write an ADR

Write an ADR when a decision:

1. **Affects multiple components** - Changes cross package boundaries
2. **Is hard to reverse** - Has lasting implications (e.g., database schema)
3. **Requires trade-off analysis** - Multiple valid options existed
4. **Documents institutional knowledge** - Future developers need to understand why

## When NOT to Write an ADR

- Minor implementation details (use code comments)
- Trivial decisions (obvious best choice)
- Decisions easily reversed (< 1 day of work to change)

---

## ADR Naming Convention

- `ADR-001-` prefix
- Short, descriptive title
- Example: `ADR-001-use-uuids-for-primary-keys.md`

---

## Location

Store ADRs in: `docs/adr/`

---

*Last updated: 2026-05-26*