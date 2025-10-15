# Fathom MCP Server

A Model Context Protocol (MCP) server that provides AI agents with access to Fathom AI meeting data, including transcripts, summaries, teams, and team members.

## Features

This MCP server exposes 5 tools for interacting with Fathom AI:

- **`fathom_list_meetings`** - List meetings with optional filters (date ranges, invitees, teams, etc.)
- **`fathom_get_summary`** - Get meeting summary by recording ID
- **`fathom_get_transcript`** - Get meeting transcript with speaker information and timestamps
- **`fathom_list_teams`** - List all teams in the organization
- **`fathom_list_team_members`** - List team members for a specific team

## Architecture

- **Framework**: Next.js 15 with App Router
- **MCP Adapter**: [mcp-handler](https://www.npmjs.com/package/mcp-handler) (Vercel's official MCP adapter)
- **Transport**: Supports both Streamable HTTP and Server-Sent Events (SSE)
- **Deployment**: Vercel with automatic HTTPS and global CDN
- **Type Safety**: Full TypeScript support with Zod validation

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd fathom-mcp-server
npm install
```

### 2. Environment Setup

Copy the environment template and add your Fathom API key:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
FATHOM_API_KEY=your_fathom_api_key_here
```

Get your API key from [Fathom Settings](https://app.fathom.video/settings/api).

### 3. Local Development

```bash
npm run dev
```

The MCP server will be available at `http://localhost:3000/api/mcp`

### 4. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/fathom-mcp-server)

Or deploy manually:

```bash
npm install -g vercel
vercel
```

Add your `FATHOM_API_KEY` environment variable in the Vercel dashboard.

## Client Integration

### OpenAI AgentKit

Connect directly to the HTTP endpoint with Bearer token authentication:

```json
{
  "mcpServers": {
    "fathom": {
      "url": "https://fathom-mcp.vercel.app/api/mcp",
      "auth": {
        "type": "bearer",
        "token": "YOUR_FATHOM_API_KEY"
      }
    }
  }
}
```

**Configuration Steps:**
1. Replace `YOUR_FATHOM_API_KEY` with your actual Fathom AI API key
2. The API key is passed as a Bearer token in the Authorization header
3. This keeps the API key client-side controlled and secure

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "fathom": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://fathom-mcp.vercel.app/api/mcp"
      ]
    }
  }
}
```

**Config file locations:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\\Claude\\claude_desktop_config.json`

### Cursor

Add to your `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "fathom": {
      "url": "https://your-app.vercel.app/api/mcp"
    }
  }
}
```

## Tool Usage Examples

### List Recent Meetings

```json
{
  "name": "fathom_list_meetings",
  "arguments": {
    "created_after": "2024-01-01T00:00:00Z",
    "include_summary": true,
    "limit": 10
  }
}
```

### Get Meeting Transcript

```json
{
  "name": "fathom_get_transcript",
  "arguments": {
    "recording_id": 123456789
  }
}
```

### Filter Meetings by Team

```json
{
  "name": "fathom_list_meetings",
  "arguments": {
    "teams": ["Engineering", "Product"],
    "include_action_items": true
  }
}
```

### List Team Members

```json
{
  "name": "fathom_list_team_members",
  "arguments": {
    "team_id": "team_123"
  }
}
```

## API Reference

### fathom_list_meetings

List meetings with optional filters.

**Parameters:**
- `calendar_invitees` (string[]): Email addresses to filter by
- `calendar_invitees_domains` (string[]): Company domains to filter by
- `calendar_invitees_domains_type` (enum): Filter by external domains
- `created_after` (string): ISO 8601 timestamp
- `created_before` (string): ISO 8601 timestamp
- `include_transcript` (boolean): Include transcript data
- `include_summary` (boolean): Include summary data
- `include_action_items` (boolean): Include action items
- `include_crm_matches` (boolean): Include CRM matches
- `limit` (number): Max results (1-100)
- `cursor` (string): Pagination cursor
- `recorded_by` (string[]): Filter by recorder emails
- `teams` (string[]): Filter by team names

### fathom_get_summary

Get meeting summary by recording ID.

**Parameters:**
- `recording_id` (number): The recording ID

### fathom_get_transcript

Get meeting transcript with speaker information.

**Parameters:**
- `recording_id` (number): The recording ID

### fathom_list_teams

List all teams in the organization.

**Parameters:**
- `cursor` (string): Optional pagination cursor

### fathom_list_team_members

List team members for a specific team.

**Parameters:**
- `team_id` (string): The team ID
- `cursor` (string): Optional pagination cursor

## Error Handling

The server includes comprehensive error handling:

- **Missing API Key**: Clear error message if `FATHOM_API_KEY` is not set
- **Fathom API Errors**: Properly formatted error responses with status codes
- **Rate Limiting**: Graceful handling of 429 responses
- **Input Validation**: Zod schemas validate all tool inputs
- **Network Errors**: Timeout and connection error handling

## Security Considerations

- **HTTPS Only**: Vercel provides automatic TLS certificates
- **CORS Headers**: Configured for OpenAI's infrastructure
- **API Key Security**: Stored in environment variables, never committed
- **Input Validation**: All inputs validated with Zod schemas
- **Rate Limiting**: Respects Fathom API rate limits

## Development

### Project Structure

```
├── app/
│   └── api/
│       └── [transport]/
│           └── route.ts          # MCP route handler
├── lib/
│   └── fathom-client.ts          # Fathom API client
├── .env.example                  # Environment template
├── vercel.json                   # Vercel configuration
└── README.md                     # This file
```

### Testing

Test the MCP server locally:

```bash
# Start the development server
npm run dev

# Test with curl
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

### Type Checking

```bash
npm run type-check
```

## Troubleshooting

### Common Issues

1. **"FATHOM_API_KEY environment variable is required"**
   - Ensure you've set the environment variable in `.env.local` (local) or Vercel dashboard (production)

2. **"Fathom API Error (401)"**
   - Check that your API key is valid and has the correct permissions

3. **"Fathom API Error (429)"**
   - You've hit Fathom's rate limit. Wait before making more requests

4. **CORS errors in browser**
   - The server includes proper CORS headers. If issues persist, check your client configuration

### Debug Mode

Enable verbose logging in development:

```bash
NODE_ENV=development npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- **Fathom API Documentation**: [developers.fathom.ai](https://developers.fathom.ai)
- **MCP Specification**: [modelcontextprotocol.io](https://modelcontextprotocol.io)
- **Issues**: Create an issue in this repository
