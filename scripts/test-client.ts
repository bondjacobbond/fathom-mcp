/**
 * Test client for the Fathom MCP Server
 * Run with: npx tsx scripts/test-client.ts
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:3000/api/mcp';
const FATHOM_API_KEY = process.env.FATHOM_API_KEY || 'T375brsQd9WPEV8OPmv0GA.3ClGk7evagTvKiv34W-Vib1LLGPPThpX1U4P2htfLJ0';

async function testMcpServer() {
  console.log(`Testing MCP server at: ${SERVER_URL}`);
  
  const client = new Client({
    name: 'fathom-test-client',
    version: '1.0.0'
  });

  try {
    // Connect to the server with authentication
    const transport = new StreamableHTTPClientTransport(new URL(SERVER_URL));
    await client.connect(transport);
    console.log('✅ Connected to MCP server');

    // List available tools
    console.log('\n📋 Listing available tools...');
    const tools = await client.listTools();
    console.log('Available tools:', tools.tools.map(t => t.name));

    // Test fathom_list_teams
    console.log('\n👥 Testing fathom_list_teams...');
    try {
      const teamsResult = await client.callTool({
        name: 'fathom_list_teams',
        arguments: {}
      });
      console.log('Teams result:', JSON.stringify(teamsResult.structuredContent, null, 2));
    } catch (error) {
      console.log('Teams error (expected if no API key):', error instanceof Error ? error.message : String(error));
    }

    // Test fathom_list_meetings
    console.log('\n📅 Testing fathom_list_meetings...');
    try {
      const meetingsResult = await client.callTool({
        name: 'fathom_list_meetings',
        arguments: {
          limit: 5,
          include_summary: false,
          include_transcript: false
        }
      });
      console.log('Meetings result:', JSON.stringify(meetingsResult.structuredContent, null, 2));
    } catch (error) {
      console.log('Meetings error (expected if no API key):', error instanceof Error ? error.message : String(error));
    }

    // Test fathom_get_summary (this will likely fail without a valid recording ID)
    console.log('\n📝 Testing fathom_get_summary...');
    try {
      const summaryResult = await client.callTool({
        name: 'fathom_get_summary',
        arguments: {
          recording_id: 123456789 // This is likely not a valid ID
        }
      });
      console.log('Summary result:', JSON.stringify(summaryResult.structuredContent, null, 2));
    } catch (error) {
      console.log('Summary error (expected with invalid ID):', error instanceof Error ? error.message : String(error));
    }

    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MCP server');
  }
}

// Run the test
testMcpServer().catch(console.error);
