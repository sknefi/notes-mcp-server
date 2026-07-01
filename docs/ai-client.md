# AI MCP Client

The AI client connects two systems:

- OpenRouter for model reasoning and tool choice.
- Our MCP server for actual tool execution.

## Flow

```mermaid
sequenceDiagram
    participant User
    participant Client as AI MCP Client
    participant LLM as OpenRouter Model
    participant MCP as Notes MCP Server
    participant Store as notes.json

    User->>Client: Natural-language request
    Client->>MCP: listTools()
    MCP-->>Client: Tool schemas
    Client->>LLM: User message + tool schemas
    LLM-->>Client: Suggested tool_call
    Client->>MCP: callTool(name, arguments)
    MCP->>Store: Read or write notes
    Store-->>MCP: Notes data
    MCP-->>Client: Tool result
    Client->>LLM: Tool result
    LLM-->>Client: Final answer
    Client-->>User: Response
```

## Key Idea

The model does not execute MCP tools directly.

The model chooses a tool call. The client executes that call against the MCP server.

Related notes:

- [[mcp-basics]]
- [[server-flow]]
- [[tools]]
