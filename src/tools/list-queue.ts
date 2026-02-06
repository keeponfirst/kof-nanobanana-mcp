/**
 * Tool: nanobanana_list_queue
 * List and validate prompt files in the queue directory
 */

import * as path from 'node:path';
import { z } from 'zod';
import { listMarkdownFiles, fileExists } from '../services/file-utils.js';
import { parsePromptFile, getPromptPreview, isPromptFile } from '../services/prompt-parser.js';
import { QueueListResult, QueueListItem, DEFAULT_MODEL } from '../types.js';

export const listQueueInputSchema = z.object({
    queue_dir: z.string()
        .default('nanobanana/queue')
        .describe('Directory to scan for prompt files'),

    validate: z.boolean()
        .default(true)
        .describe('If true, validate each prompt file and report errors'),

    check_conflicts: z.boolean()
        .default(true)
        .describe('If true, check if output files already exist')
});

export type ListQueueInput = z.infer<typeof listQueueInputSchema>;

export async function handleListQueue(params: ListQueueInput): Promise<{
    content: Array<{ type: 'text'; text: string }>;
    structuredContent: QueueListResult;
}> {
    const queueDir = path.isAbsolute(params.queue_dir)
        ? params.queue_dir
        : path.resolve(process.cwd(), params.queue_dir);

    const files = listMarkdownFiles(queueDir);
    const prompts: QueueListItem[] = [];

    let validCount = 0;
    let invalidCount = 0;
    let conflictCount = 0;

    for (const filePath of files) {
        const filename = path.basename(filePath);

        if (!isPromptFile(filename)) {
            continue;
        }

        const parsed = parsePromptFile(filePath);

        // Check if output file exists
        let outputExists = false;
        if (params.check_conflicts && parsed.frontmatter.output_path) {
            const outputPath = path.isAbsolute(parsed.frontmatter.output_path)
                ? parsed.frontmatter.output_path
                : path.resolve(process.cwd(), parsed.frontmatter.output_path);
            outputExists = fileExists(outputPath);
            if (outputExists && !parsed.frontmatter.overwrite) {
                conflictCount++;
            }
        }

        if (parsed.isValid) {
            validCount++;
        } else {
            invalidCount++;
        }

        prompts.push({
            filename,
            title: parsed.title,
            output_path: parsed.frontmatter.output_path || '(not specified)',
            model: parsed.frontmatter.model || DEFAULT_MODEL,
            aspect_ratio: parsed.frontmatter.aspect_ratio,
            overwrite: parsed.frontmatter.overwrite || false,
            preview: getPromptPreview(parsed.prompt),
            is_valid: parsed.isValid,
            validation_errors: parsed.validationErrors.length > 0 ? parsed.validationErrors : undefined,
            output_exists: outputExists
        });
    }

    const result: QueueListResult = {
        count: prompts.length,
        valid_count: validCount,
        invalid_count: invalidCount,
        conflict_count: conflictCount,
        prompts
    };

    // Format text output
    let textContent = `# Nano Banana Queue: ${queueDir}\n\n`;
    textContent += `📊 **Summary**: ${prompts.length} files | ✅ ${validCount} valid | ❌ ${invalidCount} invalid | ⚠️ ${conflictCount} conflicts\n\n`;

    if (prompts.length === 0) {
        textContent += '_No prompt files found in queue._\n';
    } else {
        for (const item of prompts) {
            const status = !item.is_valid ? '❌' : item.output_exists ? '⚠️' : '✅';
            textContent += `## ${status} ${item.filename}\n`;
            textContent += `- **Title**: ${item.title}\n`;
            textContent += `- **Output**: \`${item.output_path}\`\n`;
            textContent += `- **Model**: ${item.model}\n`;
            if (item.aspect_ratio) {
                textContent += `- **Aspect Ratio**: ${item.aspect_ratio}\n`;
            }
            textContent += `- **Overwrite**: ${item.overwrite}\n`;

            if (item.output_exists) {
                textContent += `- ⚠️ **Output file exists**\n`;
            }

            if (item.validation_errors && item.validation_errors.length > 0) {
                textContent += `- 🚫 **Errors**:\n`;
                for (const err of item.validation_errors) {
                    textContent += `  - ${err}\n`;
                }
            }

            textContent += `\n> ${item.preview}\n\n`;
        }
    }

    return {
        content: [{ type: 'text', text: textContent }],
        structuredContent: result
    };
}

export const listQueueToolDefinition = {
    title: 'List Nano Banana Queue',
    description: `List and validate prompt files in the queue directory.

This tool scans the queue directory for markdown prompt files and provides:
- Validation status for each file
- Conflict detection (output file already exists)
- Preview of prompt content

Use this to review what will be generated before running process_queue.

**Example**:
\`\`\`
queue_dir: "nanobanana/queue"
validate: true
check_conflicts: true
\`\`\``,
    inputSchema: listQueueInputSchema,
    annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
    }
};
