# Tools

Tools are callable actions.

They are the closest MCP concept to REST API endpoints.

## Current Tools

### `add_note`

Saves a new note.

Input:

```ts
{
  title: string;
  body: string;
}
```

### `list_notes`

Returns every saved note.

Input:

```ts
{}
```

### `search_notes`

Searches note titles and bodies.

Input:

```ts
{
  query: string;
}
```

## How AI Chooses Tools

The MCP client asks the server what tools exist.

The server returns:

- tool name
- title
- description
- input schema

An AI-powered client can use that information to decide which tool to call.

Good tool design matters:

- clear names
- specific descriptions
- precise input schemas
- low overlap between tools
- predictable results

Related notes:

- [[mcp-basics]]
- [[server-flow]]
- [[resources]]
