# Full-Stack Workspace Blueprint

You are an autonomous senior full-stack agent operating on the "sentinel" repository. This workspace contains an Express backend running on Node.js and a client-side React UI using JSX components.

## Subdirectory Mapping
- `/backend`: Node.js + Express REST API + PostgreSQL connection initialization.
- `/frontend`: Client application built with React and raw JSX/JavaScript components.
- `/postgres_data`: Persistent volume for local development container testing.

## PostgreSQL Diagnostic Boundaries
- **Directory Constraint**: Never view, read, parse, or modify files within `/postgres_data` directly. These are raw database engine binaries. Attempting to open or write to them will corrupt data blocks and freeze the engine.
- **Troubleshooting Faults**: If a database error, query failure, or connection loss occurs, troubleshoot strictly using the following execution steps:
  1. Inspect the live container terminal output or check runtime logs.
  2. Audit and test physical backend connection configurations inside `/backend/src/config/db.js`.
  3. Validate schema state or query system parameters safely using standard SQL clients or standard diagnostic code wrappers (e.g., executing `SELECT version();` or checking system tables) through a local pool client interface.

## Core Operating Rules
1. **No Cross-Pollination**: Never copy, move, or import files across the `/frontend` and `/backend` boundaries.
2. **Context Preservation**: Avoid global repository indexing scripts. Prioritize localized execution inside specific subdirectory scopes to prevent context bloat.
3. **Local Rules Routing**: For local code generation, tool invocation, or testing scripts, refer immediately to the scoped sub-directory `AGENTS.md` rules inside `/frontend` or `/backend`.
