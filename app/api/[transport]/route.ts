import { createMcpHandler, withMcpAuth } from 'mcp-handler';
import { z } from 'zod';
import { FathomClient, FathomApiError } from '@/lib/fathom-client';
import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';

const handler = createMcpHandler(
  (server) => {
    // Tool 1: List meetings with optional filters
    server.tool(
      'fathom_list_meetings',
      'List meetings with optional filters including calendar invitees, date ranges, and content options',
      {
        calendar_invitees: z.array(z.string().email()).optional().describe('Email addresses of calendar invitees to filter by'),
        calendar_invitees_domains: z.array(z.string()).optional().describe('Company domains to filter by'),
        calendar_invitees_domains_type: z.enum(['all', 'only_internal', 'one_or_more_external']).optional().describe('Filter by whether calendar invitee list includes external email domains'),
        created_after: z.string().datetime().optional().describe('Filter to meetings created after this timestamp (ISO 8601)'),
        created_before: z.string().datetime().optional().describe('Filter to meetings created before this timestamp (ISO 8601)'),
        include_transcript: z.boolean().optional().describe('Include the transcript for each meeting'),
        include_summary: z.boolean().optional().describe('Include the summary for each meeting'),
        include_action_items: z.boolean().optional().describe('Include action items for each meeting'),
        include_crm_matches: z.boolean().optional().describe('Include CRM matches for each meeting'),
        limit: z.number().int().min(1).max(100).optional().describe('Maximum number of meetings to return'),
        cursor: z.string().optional().describe('Cursor for pagination'),
        recorded_by: z.array(z.string().email()).optional().describe('Email addresses of users who recorded meetings'),
        teams: z.array(z.string()).optional().describe('Team names to filter by'),
      },
      async (params, extra) => {
        try {
          // Get API key from auth token
          const apiKey = extra.authInfo?.token;
          if (!apiKey) {
            throw new Error('Fathom API key is required');
          }
          const client = new FathomClient(apiKey);
          const result = await client.listMeetings(params);
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
            structuredContent: result as any,
          };
        } catch (error) {
          if (error instanceof FathomApiError) {
            return {
              content: [
                {
                  type: 'text',
                  text: `Fathom API Error (${error.status}): ${error.message}`,
                },
              ],
              isError: true,
            };
          }
          throw error;
        }
      }
    );

    // Tool 2: Get meeting summary by recording ID
    server.tool(
      'fathom_get_summary',
      'Get meeting summary by recording ID',
      {
        recording_id: z.number().int().positive().describe('The recording ID of the meeting'),
      },
      async ({ recording_id }, extra) => {
        try {
          // Get API key from auth token
          const apiKey = extra.authInfo?.token;
          if (!apiKey) {
            throw new Error('Fathom API key is required');
          }
          const client = new FathomClient(apiKey);
          const result = await client.getSummary(recording_id);
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
            structuredContent: result as any,
          };
        } catch (error) {
          if (error instanceof FathomApiError) {
            return {
              content: [
                {
                  type: 'text',
                  text: `Fathom API Error (${error.status}): ${error.message}`,
                },
              ],
              isError: true,
            };
          }
          throw error;
        }
      }
    );

    // Tool 3: Get meeting transcript by recording ID
    server.tool(
      'fathom_get_transcript',
      'Get meeting transcript by recording ID with speaker information and timestamps',
      {
        recording_id: z.number().int().positive().describe('The recording ID of the meeting'),
      },
      async ({ recording_id }, extra) => {
        try {
          // Get API key from auth token
          const apiKey = extra.authInfo?.token;
          if (!apiKey) {
            throw new Error('Fathom API key is required');
          }
          const client = new FathomClient(apiKey);
          const result = await client.getTranscript(recording_id);
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
            structuredContent: result as any,
          };
        } catch (error) {
          if (error instanceof FathomApiError) {
            return {
              content: [
                {
                  type: 'text',
                  text: `Fathom API Error (${error.status}): ${error.message}`,
                },
              ],
              isError: true,
            };
          }
          throw error;
        }
      }
    );

    // Tool 4: List all teams
    server.tool(
      'fathom_list_teams',
      'List all teams in the organization',
      {
        cursor: z.string().optional().describe('Cursor for pagination'),
      },
      async ({ cursor }, extra) => {
        try {
          // Get API key from auth token
          const apiKey = extra.authInfo?.token;
          if (!apiKey) {
            throw new Error('Fathom API key is required');
          }
          const client = new FathomClient(apiKey);
          const result = await client.listTeams(cursor);
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
            structuredContent: result as any,
          };
        } catch (error) {
          if (error instanceof FathomApiError) {
            return {
              content: [
                {
                  type: 'text',
                  text: `Fathom API Error (${error.status}): ${error.message}`,
                },
              ],
              isError: true,
            };
          }
          throw error;
        }
      }
    );

    // Tool 5: List team members for a specific team
    server.tool(
      'fathom_list_team_members',
      'List team members for a specific team',
      {
        team_id: z.string().min(1).describe('The ID of the team'),
        cursor: z.string().optional().describe('Cursor for pagination'),
      },
      async ({ team_id, cursor }, extra) => {
        try {
          // Get API key from auth token
          const apiKey = extra.authInfo?.token;
          if (!apiKey) {
            throw new Error('Fathom API key is required');
          }
          const client = new FathomClient(apiKey);
          const result = await client.listTeamMembers(team_id, cursor);
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
            structuredContent: result as any,
          };
        } catch (error) {
          if (error instanceof FathomApiError) {
            return {
              content: [
                {
                  type: 'text',
                  text: `Fathom API Error (${error.status}): ${error.message}`,
                },
              ],
              isError: true,
            };
          }
          throw error;
        }
      }
    );
  },
  {
    // Server metadata
    capabilities: {
      tools: {
        fathom_list_meetings: {
          description: 'List meetings with optional filters',
        },
        fathom_get_summary: {
          description: 'Get meeting summary by recording ID',
        },
        fathom_get_transcript: {
          description: 'Get meeting transcript by recording ID',
        },
        fathom_list_teams: {
          description: 'List all teams in the organization',
        },
        fathom_list_team_members: {
          description: 'List team members for a specific team',
        },
      },
    },
  },
  {
    // Configuration options
    redisUrl: process.env.REDIS_URL,
    basePath: '/api',
    maxDuration: 60,
    verboseLogs: process.env.NODE_ENV === 'development',
  }
);

// Token verification function
const verifyToken = async (
  req: Request,
  bearerToken?: string
): Promise<AuthInfo | undefined> => {
  if (!bearerToken) return undefined;

  // For Fathom AI, we'll treat the bearer token as the API key
  // In a production environment, you might want to validate this against a database
  // or use a more sophisticated token system
  if (!bearerToken.startsWith('T') || bearerToken.length < 10) {
    return undefined;
  }

  return {
    token: bearerToken,
    scopes: ['fathom:read'],
    clientId: 'fathom-client',
    extra: {
      apiKey: bearerToken,
    },
  };
};

// Wrap handler with authentication
const authHandler = withMcpAuth(handler, verifyToken, {
  required: true,
  requiredScopes: ['fathom:read'],
});

export { authHandler as GET, authHandler as POST, authHandler as DELETE };
