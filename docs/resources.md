# Resources

Resources are readable context exposed by an MCP server.

They are different from tools.

## Tools vs Resources

Tools do actions:

```text
add_note(title, body)
search_notes(query)
```

Resources expose data:

```text
notes://all
notes://note/{id}
```

## Possible Resources For This Project

We have not implemented resources yet.

Good next examples:

- `notes://all`: returns all notes.
- `notes://latest`: returns the latest saved note.
- `notes://note/{id}`: returns one note by id.

## Why Add Resources

Resources help show this MCP distinction:

- Use tools when something should happen.
- Use resources when the client needs context to read.

Related notes:

- [[mcp-basics]]
- [[tools]]
