# Docs MCP Server

An MCP (Model Context Protocol) server that dynamically exposes documentation files as resources. Deploy on Smithery to provide AI agents with access to your documentation.

## Features

- Dynamically reads all `.md` files from the `/docs` directory
- Exposes each file as a named resource (`docs://<name>`)
- Supports resource templates for discoverability
- Ready for Smithery deployment

## How It Works

1. Place your markdown documentation files in the `/docs` directory
2. The server automatically discovers and exposes them as resources
3. AI agents can list and read all available documentation

## Adding Documentation

Simply add `.md` files to the `/docs` directory:

```
docs/
  getting-started.md   → docs://getting-started
  api-reference.md     → docs://api-reference
  examples.md          → docs://examples
```

## Local Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run
npm start

# Or run in development mode
npm run dev
```

## Smithery Deployment

This server is configured for Smithery deployment. The `smithery.yaml` file contains the necessary configuration.

## Resources

The server exposes:

- **List Resources**: Returns all documentation files with their URIs
- **Resource Templates**: Provides `docs://{name}` template for discovery
- **Read Resource**: Returns the markdown content of a specific document

## AI Agent Usage

When connected, AI agents should:

1. List all available resources to discover documentation
2. Read relevant documents based on user queries
3. Cross-reference between documents using the `docs://` URI scheme
