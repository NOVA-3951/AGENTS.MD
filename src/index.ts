#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import express, { Request, Response } from "express";
import cors from "cors";
import * as fs from "fs";
import * as path from "path";

const DOCS_DIR = path.join(process.cwd(), "docs");
const PORT = parseInt(process.env.PORT || "8081", 10);

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
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "list_docs",
          description: "List all available documentation files",
          inputSchema: {
            type: "object",
            properties: {},
            required: [],
          },
        },
        {
          name: "read_doc",
          description: "Read a specific documentation file by name",
          inputSchema: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Name of the documentation file (without .md extension)",
              },
            },
            required: ["name"],
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === "list_docs") {
      const docs = getDocFiles();
      return {
        content: [
          {
            type: "text",
            text: `Available documentation:\n${docs.map(d => `- ${d.name}`).join("\n")}`,
          },
        ],
      };
    }

    if (name === "read_doc") {
      const docName = (args as { name: string }).name;
      const content = readDocFile(docName);
      if (content === null) {
        return {
          content: [{ type: "text", text: `Documentation not found: ${docName}` }],
          isError: true,
        };
      }
      return {
        content: [{ type: "text", text: content }],
      };
    }

    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
  });

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

app.use(cors({
  origin: '*',
  exposedHeaders: ['Mcp-Session-Id', 'mcp-protocol-version'],
  allowedHeaders: ['Content-Type', 'mcp-session-id'],
}));

app.all("/mcp", async (req: Request, res: Response) => {
  try {
    const server = createServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on("close", () => {
      transport.close();
      server.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res);
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  }
});

app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", docs: getDocFiles().map(d => d.name) });
});

app.get("/.well-known/mcp-config", (_req: Request, res: Response) => {
  res.json({
    configSchema: {
      type: "object",
      properties: {},
      required: []
    }
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Docs MCP Server running on http://0.0.0.0:${PORT}`);
  console.log(`MCP endpoint: /mcp`);
  console.log(`Available docs: ${getDocFiles().map(d => d.name).join(", ")}`);
});
