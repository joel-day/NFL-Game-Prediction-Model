# Local Preview Guide for Chalkjuice Static Build

## The Problem with VS Code Live Server

VS Code's Live Server extension doesn't properly handle:
- Single Page Application (SPA) routing
- Trailing slashes in URLs
- Static asset paths from Next.js builds

## Proper Way to Preview Your Static Build

## Prerequisites
- Node.js 18.17.0 or higher


## Build for Production

1. **Install dependencies:**
\`\`\`bash
npm install
\`\`\`

This creates the `node_modules/` folder

2. **Build the static site:**
\`\`\`bash
npm install
\`\`\`

This creates the `out/` folder with all static files.

3. **Preview Locally**
\`\`\`bash
npm run preview
\`\`\`

This serves the `out/` folder on `http://localhost:3000` with proper SPA handling.


## Why These Work Better Than Live Server

1. **SPA Support**: They properly serve `index.html` for all routes
2. **Trailing Slash Handling**: Correctly handle Next.js trailing slash convention
3. **Asset Paths**: Serve static assets with correct MIME types
4. **CORS Headers**: Properly configured for local development

## Testing Your S3 Deployment

Before deploying to S3, use `npm run preview` to verify:
- All pages load correctly
- Images and logos appear
- WebSocket connections work
- Team colors display properly
- Historical data modal functions


## Environment Variables

The app connects to these endpoints (hardcoded in the WebSocket hook):
- WebSocket API: `wss://5gvz4a31ni.execute-api.us-east-2.amazonaws.com/production`

If you need to change endpoints, update `hooks/use-websocket.ts` before building.