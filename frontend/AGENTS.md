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

## Structural UI Design System Rules
1. **Golden Ratio Typography Scaling**: Use a modular scale (1.618 or 1.25 multiplier) for font hierarchies. Keep primary numbers massively prominent while scaling down headers and body descriptions. Set description text opacity to 70% (`text-[#c3c9b2]/70` or `opacity-70`) to reduce cognitive load and establish clear visual anchor hierarchy.
2. **Atmospheric Elevation**: Maintain high dimensional contrast by darkening the root background layer by ~5% (`bg-[#0a0d0b]`) and keeping inner card backgrounds elevated (`bg-[#181d1a]` or `bg-[#1c211e]`). Apply soft, multi-layered CSS ambient box shadows to physically separate floating cards from the canvas.
3. **Spatial Breathing Room**: Maintain consistent `24px` internal padding (`p-6`) on all grid cards and telemetry containers. Shift text nodes and data points inward away from container borders.
4. **Curvilinear Cohesion**: Enforce a unified `12px` border radius (`rounded-xl` / `rounded-[12px]`) across all main dashboard cards, containers, buttons, and navigation selection badges (replacing pill shapes to maintain geometric harmony).
5. **Grid Protection**: Maintain equal-width multi-column horizontal grid structures for telemetry metric rows without altering container width ratios, preserving responsive layout integrity.
