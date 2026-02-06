/**
 * Tool: nanobanana_process_queue
 * Process all prompt files in the queue directory
 */

import * as path from 'node:path';
import { z } from 'zod';
import { listMarkdownFiles, fileExists, moveFile, generateUniquePath, getCompletedFilename } from '../services/file-utils.js';
import { parsePromptFile, isPromptFile } from '../services/prompt-parser.js';
import { generateImage } from '../services/gemini-client.js';
import { QueueProcessResult, SUPPORTED_MODELS, DEFAULT_MODEL } from '../types.js';

export const processQueueInputSchema = z.object({
    queue_dir: z.string()
        .default('nanobanana/queue')
        .describe('Directory containing prompt markdown files'),

    output_dir: z.string()
        .default('assets/generated')
        .describe('Default directory to save generated images (used if prompt has relative path)'),

    completed_dir: z.string()
        .default('nanobanana/completed')
        .describe('Directory to move processed prompts to'),

    model: z.enum(SUPPORTED_MODELS)
        .default(DEFAULT_MODEL)
        .describe('Gemini model to use for all generations (overrides prompt settings)'),

    validate_only: z.boolean()
        .default(false)
        .describe('If true, only validate prompt files without generating images'),

    dry_run: z.boolean()
        .default(false)
        .describe('If true, show what would be generated without actually calling API'),

    overwrite: z.enum(['skip', 'overwrite', 'rename'])
        .default('skip')
        .describe('Strategy when output file exists: skip, overwrite, or rename with suffix')
});

export type ProcessQueueInput = z.infer<typeof processQueueInputSchema>;

export async function handleProcessQueue(params: ProcessQueueInput): Promise<{
    content: Array<{ type: 'text'; text: string }>;
    structuredContent: QueueProcessResult;
}> {
    const baseDir = process.cwd();
    const queueDir = path.isAbsolute(params.queue_dir)
        ? params.queue_dir
        : path.resolve(baseDir, params.queue_dir);
    const completedDir = path.isAbsolute(params.completed_dir)
        ? params.completed_dir
        : path.resolve(baseDir, params.completed_dir);

    const files = listMarkdownFiles(queueDir);

    // Determine mode
    const mode = params.validate_only ? 'validate' : params.dry_run ? 'dry_run' : 'execute';

    const results: QueueProcessResult['results'] = [];
    let successful = 0;
    let failed = 0;
    let skipped = 0;

    for (const filePath of files) {
        const filename = path.basename(filePath);

        if (!isPromptFile(filename)) {
            continue;
        }

        const parsed = parsePromptFile(filePath);

        // Determine output path
        let outputPath = parsed.frontmatter.output_path;
        if (!path.isAbsolute(outputPath)) {
            outputPath = path.resolve(baseDir, outputPath);
        }

        // Handle validation only mode
        if (mode === 'validate') {
            results.push({
                prompt_file: filename,
                output_path: outputPath,
                status: parsed.isValid ? 'would_generate' : 'failed',
                validation_errors: parsed.validationErrors.length > 0 ? parsed.validationErrors : undefined
            });

            if (parsed.isValid) {
                successful++;
            } else {
                failed++;
            }
            continue;
        }

        // Check for validation errors
        if (!parsed.isValid) {
            results.push({
                prompt_file: filename,
                output_path: outputPath,
                status: 'failed',
                validation_errors: parsed.validationErrors,
                error: 'Validation failed'
            });
            failed++;
            continue;
        }

        // Check if output file exists
        const outputExists = fileExists(outputPath);
        if (outputExists) {
            if (params.overwrite === 'skip') {
                results.push({
                    prompt_file: filename,
                    output_path: outputPath,
                    status: 'skipped',
                    error: 'Output file exists (overwrite=skip)'
                });
                skipped++;
                continue;
            } else if (params.overwrite === 'rename') {
                outputPath = generateUniquePath(outputPath);
            }
            // If 'overwrite', we continue with the same path
        }

        // Handle dry run mode
        if (mode === 'dry_run') {
            results.push({
                prompt_file: filename,
                output_path: outputPath,
                status: 'would_generate'
            });
            successful++;
            continue;
        }

        // Execute generation
        const result = await generateImage({
            prompt: parsed.prompt,
            outputPath,
            model: params.model || parsed.frontmatter.model || DEFAULT_MODEL,
            aspectRatio: parsed.frontmatter.aspect_ratio,
            overwrite: params.overwrite === 'overwrite',
            baseDir
        });

        if (result.success && !result.skipped) {
            // Move prompt file to completed directory
            try {
                const completedFilename = getCompletedFilename(filename);
                const completedPath = path.join(completedDir, completedFilename);
                moveFile(filePath, completedPath);
            } catch {
                // Continue even if move fails
            }

            results.push({
                prompt_file: filename,
                output_path: result.output_path,
                status: 'success'
            });
            successful++;
        } else if (result.skipped) {
            results.push({
                prompt_file: filename,
                output_path: result.output_path,
                status: 'skipped',
                error: 'File already exists'
            });
            skipped++;
        } else {
            results.push({
                prompt_file: filename,
                output_path: result.output_path,
                status: 'failed',
                error: result.error
            });
            failed++;
        }
    }

    const output: QueueProcessResult = {
        mode,
        processed: results.length,
        successful,
        failed,
        skipped,
        results
    };

    // Format text output
    let textContent = `# Nano Banana Queue Processing\n\n`;
    textContent += `**Mode**: ${mode.toUpperCase()}\n`;
    textContent += `**Queue**: ${queueDir}\n\n`;
    textContent += `## Summary\n`;
    textContent += `- 📦 Processed: ${results.length}\n`;
    textContent += `- ✅ Successful: ${successful}\n`;
    textContent += `- ❌ Failed: ${failed}\n`;
    textContent += `- ⏭️ Skipped: ${skipped}\n\n`;

    if (results.length > 0) {
        textContent += `## Results\n\n`;
        for (const r of results) {
            const icon = r.status === 'success' ? '✅' :
                r.status === 'skipped' ? '⏭️' :
                    r.status === 'would_generate' ? '🔮' : '❌';

            textContent += `### ${icon} ${r.prompt_file}\n`;
            textContent += `- **Status**: ${r.status}\n`;
            textContent += `- **Output**: \`${r.output_path}\`\n`;

            if (r.error) {
                textContent += `- **Error**: ${r.error}\n`;
            }
            if (r.validation_errors && r.validation_errors.length > 0) {
                textContent += `- **Validation Errors**:\n`;
                for (const err of r.validation_errors) {
                    textContent += `  - ${err}\n`;
                }
            }
            textContent += '\n';
        }
    }

    return {
        content: [{ type: 'text', text: textContent }],
        structuredContent: output
    };
}

export const processQueueToolDefinition = {
    title: 'Process Nano Banana Queue',
    description: `Process all prompt files in the queue directory and generate images.

**Modes**:
- \`validate_only=true\`: Only validate prompts, no API calls
- \`dry_run=true\`: Show what would be generated, no API calls
- Both false: Actually generate images

**Overwrite Strategies**:
- \`skip\`: Skip if output file exists (default)
- \`overwrite\`: Replace existing files
- \`rename\`: Generate with suffix (e.g., hero_1.png)

After successful generation, prompt files are moved to completed_dir with timestamp.

**Example**:
\`\`\`
queue_dir: "nanobanana/queue"
dry_run: true
overwrite: "skip"
\`\`\``,
    inputSchema: processQueueInputSchema,
    annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true
    }
};
