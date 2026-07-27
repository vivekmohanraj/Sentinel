# Express + PostgreSQL Execution Boundaries
You operate strictly inside the server-side runtime boundary.

## Environment & Dependency Rules
- **Stack**: Node.js (v20+), Express.js, `pg` (node-postgres), and `dotenv`.
- **Runtime Execution Command**: `npm run dev` (uses nodemon to watch file changes).
- **Production Spawn Script**: `npm start` (executes native `node src/server.js`).
- **Installing Packages**: Run `npm install <package_name>` strictly inside `/backend`.

## Database Interaction Polices
1. Centralize database connections inside a connection pool file (e.g., `src/config/db.js`). Use `const { Pool } = require('pg');`.
2. Do not write raw queries inside your controllers. Enforce the Controller-Service-Model architecture pattern.
3. Validate user request payloads via edge middleware at the route level before striking controllers.

## Mandatory Coding Style
- Write using standard CommonJS modules (`const express = require('express');` and `module.exports = ...`). Do not mix with ES Modules unless explicitly configured in package.json.
- Implement a centralized error-handling middleware (`app.use((err, req, res, next) => { ... })`) at the bottom of the middleware chain.
