/**
 * Tool: nanobanana_generate_image
 * Generate a single image using Gemini's native image generation
 */

import { z } from 'zod';
import { generateImage } from '../services/gemini-client.js';
import { SUPPORTED_MODELS, SUPPORTED_ASPECT_RATIOS, DEFAULT_MODEL } from '../types.js';

export const generateImageInputSchema = z.object({
    prompt: z.string()
        .min(10, 'Prompt must be at least 10 characters')
        .max(5000, 'Prompt must not exceed 5000 characters')
        .describe('Image generation prompt describing the desired image'),

    output_path: z.string()
        .min(1, 'Output path is required')
        .describe("Relative or absolute path to save the generated image (e.g., 'assets/generated/hero.png')"),

    model: z.enum(SUPPORTED_MODELS)
        .default(DEFAULT_MODEL)
        .describe('Gemini model to use. Flash for speed, Pro for quality'),

    aspect_ratio: z.enum(SUPPORTED_ASPECT_RATIOS)
        .optional()
        .describe('Aspect ratio of the generated image'),

    overwrite: z.boolean()
        .default(false)
        .describe('If true, overwrite existing file. If false, skip if file exists')
});

export type GenerateImageInput = z.infer<typeof generateImageInputSchema>;

export async function handleGenerateImage(params: GenerateImageInput) {
    const result = await generateImage({
        prompt: params.prompt,
        outputPath: params.output_path,
        model: params.model,
        aspectRatio: params.aspect_ratio,
        overwrite: params.overwrite
    });

    // Format response
    const output = {
        success: result.success,
        output_path: result.output_path,
        model_used: result.model_used,
        generation_time_ms: result.generation_time_ms,
        skipped: result.skipped,
        ...(result.prompt_tokens ? { prompt_tokens: result.prompt_tokens } : {}),
        ...(result.error ? { error: result.error } : {})
    };

    let textContent: string;
    if (result.skipped) {
        textContent = `⏭️ Skipped: File already exists at ${result.output_path}\nSet overwrite=true to regenerate.`;
    } else if (result.success) {
        textContent = `✅ Image generated successfully!\n\n` +
            `📁 **Output**: ${result.output_path}\n` +
            `🤖 **Model**: ${result.model_used}\n` +
            `⏱️ **Time**: ${result.generation_time_ms}ms` +
            (result.prompt_tokens ? `\n📊 **Tokens**: ${result.prompt_tokens}` : '');
    } else {
        textContent = `❌ Generation failed: ${result.error}`;
    }

    return {
        content: [{ type: 'text' as const, text: textContent }],
        structuredContent: output
    };
}

export const generateImageToolDefinition = {
    title: 'Generate Image with Nano Banana',
    description: `Generate an image using Gemini's native image generation (Nano Banana).

This tool calls the Gemini API to generate an image based on your text prompt and saves it to the specified path.

**Models**:
- gemini-2.5-flash-image: Fast, efficient (~$0.039/image)
- gemini-3-pro-image-preview: Higher quality, supports 4K (~$0.134-0.24/image)

**Supported Aspect Ratios**: 1:1, 16:9, 9:16, 4:3, 3:4

**Example**:
\`\`\`
prompt: "A modern flat illustration of a workflow diagram with three connected nodes, purple and blue gradient colors, minimal style"
output_path: "assets/generated/workflow-hero.png"
model: "gemini-2.5-flash-image"
aspect_ratio: "16:9"
\`\`\``,
    inputSchema: generateImageInputSchema,
    annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
    }
};
