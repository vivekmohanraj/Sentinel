# React JSX Client-Side Boundaries
You operate strictly inside the web browser user interface workspace.

## Build System & Dependency Rules
- **Stack**: React, Vite (or Create React App), and Vanilla JavaScript/JSX.
- **Development Server Command**: `npm run dev` (starts localized Vite/React bundler).
- **Production Compiling Script**: `npm run build` (outputs optimized files to dist/).
- **Installing Packages**: Run `npm install <package_name>` strictly inside `/frontend`.

## Implementation Directives
1. **Component Extensions**: Always use the `.jsx` file extension for any component rendering HTML tags. Use `.js` strictly for stateful hooks or utilities.
2. **API Communication**: Route all client network requests explicitly through an environmental base URL (e.g., `process.env.REACT_APP_API_URL` or `import.meta.env.VITE_API_URL`) targeting the backend port. Do not hardcode local destination addresses inside component wrappers.
3. **State Integrity**: Keep functional components clean. Abstract complex network states using standard hooks (`useEffect`, `useState`) or decoupled contexts.
