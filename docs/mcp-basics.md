# MCP Basics

MCP means Model Context Protocol.

It is a standard way for an AI client to talk to external tools, data, and workflows.

## Mental Model

MCP is similar to an API for AI clients.

Instead of REST endpoints like:

```text
POST /notes
GET /notes
GET /notes/search
```

an MCP server exposes tools like:

```text
add_note(title, body)
list_notes()
search_notes(query)
```

## Main Parts

- MCP server: exposes tools, resources, and prompts.
- MCP client: connects to the server and calls capabilities.
- Tool: an action the client can ask the server to run.
- Resource: readable context the client can fetch.
- Prompt: reusable prompt template exposed by the server.
- Transport: how the client and server exchange messages.

## In This Project

Our MCP server is the TypeScript app in `src/index.ts`.

Our current MCP client is `src/smoke-test.ts`. It is not AI-powered. It manually calls tools to prove the server works.

Related notes:

- [[server-flow]]
- [[tools]]
- [[resources]]
