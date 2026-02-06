/**
 * Gemini API client for image generation
 */

import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { GenerationResult, DEFAULT_MODEL } from './types.js';

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
    if (!client) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error(
                'GEMINI_API_KEY not set. Get one at https://aistudio.google.com/apikey'
            );
        }
        client = new GoogleGenAI({ apiKey });
    }
    return client;
}

export interface GenerateImageOptions {
    prompt: string;
    outputPath: string;
    model?: string;
    aspectRatio?: string;
    overwrite?: boolean;
    baseDir?: string;
}

export async function generateImage(
    options: GenerateImageOptions
): Promise<GenerationResult> {
    const {
        prompt,
        outputPath,
        model = DEFAULT_MODEL,
        aspectRatio,
        overwrite = false,
        baseDir = process.cwd()
    } = options;

    const startTime = Date.now();

    // Resolve output path
    const resolvedPath = path.isAbsolute(outputPath)
        ? outputPath
        : path.resolve(baseDir, outputPath);

    // Check if file exists
    if (fs.existsSync(resolvedPath) && !overwrite) {
        return {
            success: true,
            output_path: resolvedPath,
            model_used: model,
            generation_time_ms: Date.now() - startTime,
            skipped: true
        };
    }

    try {
        const ai = getClient();

        // Build generation config
        const config: Record<string, unknown> = {};
        if (aspectRatio) {
            config.aspectRatio = aspectRatio;
        }

        // Generate image
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: Object.keys(config).length > 0 ? config : undefined
        });

        // Extract image from response
        let imageData: string | null = null;
        let promptTokens: number | undefined;

        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if ('inlineData' in part && part.inlineData) {
                    imageData = part.inlineData.data as string;
                    break;
                }
            }
        }

        // Get token usage if available
        if (response.usageMetadata) {
            promptTokens = response.usageMetadata.promptTokenCount;
        }

        if (!imageData) {
            // Check if there's text explaining why no image was generated
            let errorText = 'No image data in response';
            if (response.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if ('text' in part && part.text) {
                        errorText = part.text;
                        break;
                    }
                }
            }

            return {
                success: false,
                output_path: resolvedPath,
                model_used: model,
                generation_time_ms: Date.now() - startTime,
                skipped: false,
                error: errorText
            };
        }

        // Ensure directory exists
        const dir = path.dirname(resolvedPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Save image
        const buffer = Buffer.from(imageData, 'base64');
        fs.writeFileSync(resolvedPath, buffer);

        return {
            success: true,
            output_path: resolvedPath,
            model_used: model,
            prompt_tokens: promptTokens,
            generation_time_ms: Date.now() - startTime,
            skipped: false
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        return {
            success: false,
            output_path: resolvedPath,
            model_used: model,
            generation_time_ms: Date.now() - startTime,
            skipped: false,
            error: errorMessage
        };
    }
}
