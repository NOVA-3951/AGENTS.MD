# Docs MCP Server

## Overview

An MCP (Model Context Protocol) server deployable on Smithery that dynamically exposes documentation files from `/docs/*.md` as resources for AI agents.

## Project Structure

```
├── src/
│   └── index.ts      # Main MCP server implementation
├── docs/             # Documentation files (add .md files here)
│   ├── getting-started.md
│   ├── api-reference.md
│   └── examples.md
├── dist/             # Compiled JavaScript output
├── smithery.yaml     # Smithery deployment configuration
├── Dockerfile        # Container configuration for Smithery
├── package.json      # Node.js dependencies
└── tsconfig.json     # TypeScript configuration
```

## How It Works

1. Server scans `/docs` directory for `.md` files on startup
2. Each file is exposed as a resource with URI `docs://<filename>`
3. AI agents can list all resources and read specific documents

## Development

```bash
npm install     # Install dependencies
npm run build   # Compile TypeScript
npm run dev     # Run in development mode
npm start       # Run compiled version
```

## Deployment

Configured for Smithery deployment via `smithery.yaml`.

## Adding Documentation

Add `.md` files to the `/docs` directory. They will automatically be exposed as resources named after the filename (without extension).
