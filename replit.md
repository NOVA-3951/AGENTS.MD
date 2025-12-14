# Docs MCP Server

## Overview

An MCP (Model Context Protocol) server deployable on Smithery that dynamically exposes documentation files from `/docs/*.md` as resources for AI agents. Uses Streamable HTTP transport for hosted deployments.

## Project Structure

```
├── src/
│   └── index.ts      # Main MCP server (Streamable HTTP transport)
├── docs/             # Documentation files (add .md files here)
│   ├── getting-started.md
│   ├── api-reference.md
│   └── examples.md
├── dist/             # Compiled JavaScript output
├── smithery.yaml     # Smithery deployment configuration (HTTP type)
├── Dockerfile        # Container configuration for Smithery
├── package.json      # Node.js dependencies
└── tsconfig.json     # TypeScript configuration
```

## How It Works

1. Server runs an Express HTTP server with Streamable HTTP transport
2. Scans `/docs` directory for `.md` files on startup
3. Each file is exposed as a resource with URI `docs://<filename>`
4. AI agents connect via `/mcp` endpoint and can list/read all documentation

## Endpoints

- `POST /mcp` - Streamable HTTP MCP endpoint
- `GET /health` - Health check endpoint

## Development

```bash
npm install     # Install dependencies
npm run build   # Compile TypeScript
npm run dev     # Run in development mode
npm start       # Run compiled version
```

## Deployment

Configured for Smithery deployment via `smithery.yaml` with HTTP transport on port 8081.

## Adding Documentation

Add `.md` files to the `/docs` directory. They will automatically be exposed as resources named after the filename (without extension).
