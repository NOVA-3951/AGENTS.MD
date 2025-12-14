# API Reference

This document provides detailed API information.

## Resources

The MCP server exposes documentation files as resources.

### List Resources

Returns all available documentation files.

### Read Resource

Reads the content of a specific documentation file.

**URI Format:** `docs://<name>`

Where `<name>` is the filename without the `.md` extension.

## Examples

To read the getting-started guide:
```
docs://getting-started
```

To read this API reference:
```
docs://api-reference
```
