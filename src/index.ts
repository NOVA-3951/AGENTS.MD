#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListResourceTemplatesRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import express, { Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";

const DOCS_DIR = path.join(process.cwd(), "docs");
const PORT = parseInt(process.env.PORT || "3000", 10);

interface DocFile {
  name: string;
  path: string;
  uri: string;
}

function getDocFiles(): DocFile[] {
  if (!fs.existsSync(DOCS_DIR)) {
    return [];
  }

  const files = fs.readdirSync(DOCS_DIR);
  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const name = file.replace(".md", "");
      return {
        name,
        path: path.join(DOCS_DIR, file),
        uri: `docs://${name}`,
      };
    });
}

function readDocFile(name: string): string | null {
  const filePath = path.join(DOCS_DIR, `${name}.md`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return fs.readFileSync(filePath, "utf-8");
}

function createServer(): Server {
  const server = new Server(
    {
      name: "docs-mcp-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        resources: {},
      },
    }
  );

  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    const docFiles = getDocFiles();

    const resources = docFiles.map((doc) => ({
      uri: doc.uri,
      name: doc.name,
      description: `Documentation: ${doc.name}`,
      mimeType: "text/markdown",
    }));

    return { resources };
  });

  server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
    return {
      resourceTemplates: [
        {
          uriTemplate: "docs://{name}",
          name: "Documentation File",
          description: "Access a specific documentation file by name. Available docs: " + 
            getDocFiles().map(d => d.name).join(", "),
          mimeType: "text/markdown",
        },
      ],
    };
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;

    if (!uri.startsWith("docs://")) {
      throw new Error(`Unknown resource URI: ${uri}`);
    }

    const name = uri.replace("docs://", "");
    const content = readDocFile(name);

    if (content === null) {
      throw new Error(`Documentation not found: ${name}`);
    }

    return {
      contents: [
        {
          uri,
          mimeType: "text/markdown",
          text: content,
        },
      ],
    };
  });

  return server;
}

const app = express();
app.use(express.json());

const server = createServer();

const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined,
});

app.all("/mcp", async (req: Request, res: Response) => {
  try {
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", docs: getDocFiles().map(d => d.name) });
});

async function main() {
  await server.connect(transport);
  
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Docs MCP Server running on http://0.0.0.0:${PORT}`);
    console.log(`MCP endpoint: /mcp`);
    console.log(`Available docs: ${getDocFiles().map(d => d.name).join(", ")}`);
  });
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
