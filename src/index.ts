#!/usr/bin/env node
/**
 * KOF Nano Banana MCP Server
 * 
 * MCP server for Gemini native image generation (Nano Banana).
 * Part of the KeepOnFirst Agentic Workflow.
 * 
 * Tools:
 * - nanobanana_generate_image: Generate a single image
 * - nanobanana_list_queue: List and validate queue
 * - nanobanana_process_queue: Batch process queue
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import {
    generateImageInputSchema,
    generateImageToolDefinition,
    handleGenerateImage,
    type GenerateImageInput
} from './tools/generate-image.js';

import {
    listQueueInputSchema,
    listQueueToolDefinition,
    handleListQueue,
    type ListQueueInput
} from './tools/list-queue.js';

import {
    processQueueInputSchema,
    processQueueToolDefinition,
    handleProcessQueue,
    type ProcessQueueInput
} from './tools/process-queue.js';

// Create MCP server instance
const server = new McpServer({
    name: 'kof-nanobanana-mcp',
    version: '1.0.0'
});

// Register tools
server.registerTool(
    'nanobanana_generate_image',
    generateImageToolDefinition,
    async (params: GenerateImageInput) => handleGenerateImage(params)
);

server.registerTool(
    'nanobanana_list_queue',
    listQueueToolDefinition,
    async (params: ListQueueInput) => handleListQueue(params)
);

server.registerTool(
    'nanobanana_process_queue',
    processQueueToolDefinition,
    async (params: ProcessQueueInput) => handleProcessQueue(params)
);

// Main function
async function main() {
    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
        console.error('⚠️  WARNING: GEMINI_API_KEY not set.');
        console.error('   Get one at: https://aistudio.google.com/apikey');
        console.error('   Set it in your MCP config or environment.');
        console.error('');
        console.error('   Tools will return errors until API key is configured.');
        console.error('');
    }

    // Connect to stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error('🍌 KOF Nano Banana MCP Server started');
    console.error('   Available tools:');
    console.error('   - nanobanana_generate_image');
    console.error('   - nanobanana_list_queue');
    console.error('   - nanobanana_process_queue');
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
