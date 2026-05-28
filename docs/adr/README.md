# Architectural Decision Records (ADRs)

## Overview

This directory contains ADRs for WEMS. ADRs document significant architectural decisions that shape the system.

## What is an ADR?

An ADR captures:
- **Context**: Why the decision was needed
- **Decision**: What was decided
- **Consequences**: What changed as a result

## When to Create an ADR

Create an ADR when:
- Decision affects multiple components or packages
- Decision is hard to reverse (database schema, API contracts)
- Multiple options were evaluated with trade-offs
- Institutional knowledge needs to be preserved

## When NOT to Create an ADR

Don't create an ADR for:
- Minor implementation details (use code comments)
- Trivial decisions
- Easily reversible changes

## Existing ADRs

| Number | Title | Status | Date |
|--------|-------|--------|------|
| _none yet_ | | | |

## How to Add an ADR

1. Copy the template from `.claude/agent-memory/senior-architect/adr_template.md`
2. Name it `ADR-XXX-title.md` (next available number)
3. Fill in context, decision, consequences
4. Mark status as `Proposed`
5. After acceptance, mark as `Accepted`

## Related

- [Senior Architect Agent](../../.claude/agents/senior-architect/)
- [RFCs](../plans/rfc/) - Product requirements
- [Implementation Plans](../plans/implementation/) - How decisions are implemented