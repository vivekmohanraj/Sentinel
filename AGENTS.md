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

### Mandatory Handoff Output Block
At the absolute end of every completed code modification task, give a standalone text in your response matching this layout exactly:

```text
### PROPOSED CONVENTIONAL COMMIT MESSAGE ###
<type>[optional scope]: <description>

[optional body]
```

### Commit Component Definitions
- **`<type>`**: Must be exactly one of the following lowercase tags:
  - `feat`: Added a new endpoint, router, component, or file structure.
  - `fix`: Fixed a live execution error, syntax crash, or query bug.
  - `docs`: Documentation, README, or markdown file modification.
  - `style`: Layout, spacing, structural semicolons, or linter modifications.
  - `refactor`: Structural optimization that preserves core runtime logic.
  - `test`: Addition or adaptation of localized unit test configurations.
  - `chore`: Modifying project setups, lockfiles, or metadata configurations.
- **`[optional scope]`**: Must be inside matching parentheses, explicitly mapped to `(frontend)`, `(backend)`, or `(root)`.
- **`<description>`**: A short, direct, imperative statement describing what changed.

### Concrete Handoff Examples
- **Example A (Backend endpoint add):**
  ```text
  ### PROPOSED CONVENTIONAL COMMIT MESSAGE ###
  feat(backend): add pool transaction middleware to registration routing
  ```
- **Example B (Frontend state fix):**
  ```text
  ### PROPOSED CONVENTIONAL COMMIT MESSAGE ###
  fix(frontend): resolve memory leak crash inside real-time analytics engine
  ```
- **Example C (Breaking change flag):**
  ```text
  ### PROPOSED CONVENTIONAL COMMIT MESSAGE ###
  feat(backend)!: rewrite db driver execution parameters to leverage transactions