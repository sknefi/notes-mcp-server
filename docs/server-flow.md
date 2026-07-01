# Server Flow

This project uses stdio transport.

That means the MCP client starts the server process and talks to it through standard input and output.

## Flow

```text
MCP client
  starts server process
  asks server for available tools
  calls one tool with arguments

MCP server
  validates arguments
  runs TypeScript handler
  reads or writes data/notes.json
  returns result
```

## Diagram

```mermaid
sequenceDiagram
    participant User
    participant Client as MCP Client
    participant AI as OpenRouter Model
    participant Server as MCP Server
    participant Tool as Tool Handler
    participant Store as notes.json

    User->>Client: Ask something
    Client->>Server: listTools()
    Server-->>Client: Tool names, descriptions, schemas
    Client->>AI: User message + tool schemas
    AI-->>Client: Suggested tool call
    Client->>Server: callTool(name, arguments)
    Server->>Tool: Run matching handler
    Tool->>Store: Read or write notes
    Store-->>Tool: Notes data
    Tool-->>Server: Tool result
    Server-->>Client: MCP response
    Client->>AI: Tool result
    AI-->>Client: Final answer
    Client-->>User: Final answer
```

## Current Files

- `src/server/index.ts`: creates the MCP server and connects stdio transport.
- `src/server/tools.ts`: registers the note tools.
- `src/server/notes.ts`: reads, writes, and formats notes.
- `src/client/smoke-test.ts`: test client that calls the server.
- `src/client/ai.ts`: AI-powered client using OpenRouter.
- `src/client/openrouter.ts`: OpenRouter request and tool mapping code.
- `src/client/tool-runner.ts`: LLM tool-call loop.
- `src/shared/env.ts`: tiny `.env` loader.

## Startup

`src/server/index.ts` creates the server:

```ts
const server = new McpServer({
  name: "notes-mcp-server",
  version: "1.0.0",
});
```

Then it registers tools:

```ts
registerNoteTools(server);
```

Then it connects to stdio:

```ts
await server.connect(new StdioServerTransport());
```

Related notes:

- [[mcp-basics]]
- [[tools]]
