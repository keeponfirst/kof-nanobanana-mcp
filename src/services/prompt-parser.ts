/**
 * Prompt file parser with YAML frontmatter support
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import matter from 'gray-matter';
import {
    ParsedPrompt,
    PromptFrontmatter,
    SUPPORTED_MODELS,
    SUPPORTED_ASPECT_RATIOS,
    DEFAULT_MODEL,
    DEFAULT_ASPECT_RATIO
} from './types.js';

/**
 * Parse a prompt markdown file with optional YAML frontmatter
 */
export function parsePromptFile(filePath: string): ParsedPrompt {
    const filename = path.basename(filePath);
    const validationErrors: string[] = [];

    let content: string;
    try {
        content = fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
        return {
            frontmatter: { output_path: '' },
            prompt: '',
            title: filename,
            filename,
            isValid: false,
            validationErrors: [`Failed to read file: ${error instanceof Error ? error.message : String(error)}`]
        };
    }

    // Try to parse YAML frontmatter
    const parsed = matter(content);
    const data = parsed.data as Partial<PromptFrontmatter>;
    const body = parsed.content.trim();

    // Extract title from first heading or filename
    const titleMatch = body.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : filename.replace(/\.md$/, '');

    // Build frontmatter with defaults
    let frontmatter: PromptFrontmatter;

    if (data.output_path) {
        // New format: YAML frontmatter
        frontmatter = {
            output_path: data.output_path,
            model: data.model || DEFAULT_MODEL,
            aspect_ratio: data.aspect_ratio || DEFAULT_ASPECT_RATIO,
            overwrite: data.overwrite ?? false
        };
    } else {
        // Legacy format: parse from markdown sections
        frontmatter = parseLegacyFormat(body);
    }

    // Validate frontmatter
    if (!frontmatter.output_path) {
        validationErrors.push('Missing required field: output_path');
    }

    if (frontmatter.model && !SUPPORTED_MODELS.includes(frontmatter.model as any)) {
        validationErrors.push(`Invalid model: ${frontmatter.model}. Supported: ${SUPPORTED_MODELS.join(', ')}`);
    }

    if (frontmatter.aspect_ratio && !SUPPORTED_ASPECT_RATIOS.includes(frontmatter.aspect_ratio as any)) {
        validationErrors.push(`Invalid aspect_ratio: ${frontmatter.aspect_ratio}. Supported: ${SUPPORTED_ASPECT_RATIOS.join(', ')}`);
    }

    // Validate prompt content
    if (!body || body.length < 10) {
        validationErrors.push('Prompt content is too short (minimum 10 characters)');
    }

    return {
        frontmatter,
        prompt: body,
        title,
        filename,
        isValid: validationErrors.length === 0,
        validationErrors
    };
}

/**
 * Parse legacy format (without YAML frontmatter)
 * Extracts output_path from ## Output section
 */
function parseLegacyFormat(content: string): PromptFrontmatter {
    let outputPath = '';

    // Try to find output path from ## Output section
    const outputSection = content.match(/##\s*Output[\s\S]*?(?=##|$)/i);
    if (outputSection) {
        // Look for path in various formats
        const pathPatterns = [
            /\*\*Path\*\*:\s*`([^`]+)`/i,
            /Path:\s*`([^`]+)`/i,
            /\*\*路徑\*\*:\s*`([^`]+)`/i,
            /路徑:\s*`([^`]+)`/i,
            /-\s*`([^`]+\.(?:png|jpg|jpeg|webp))`/i
        ];

        for (const pattern of pathPatterns) {
            const match = outputSection[0].match(pattern);
            if (match) {
                outputPath = match[1];
                break;
            }
        }
    }

    return {
        output_path: outputPath,
        model: DEFAULT_MODEL,
        aspect_ratio: DEFAULT_ASPECT_RATIO,
        overwrite: false
    };
}

/**
 * Check if a file is a valid prompt markdown file
 */
export function isPromptFile(filename: string): boolean {
    return filename.endsWith('.md') && !filename.startsWith('.');
}

/**
 * Get preview of prompt content (first N characters)
 */
export function getPromptPreview(prompt: string, maxLength = 200): string {
    // Remove the title line if present
    const withoutTitle = prompt.replace(/^#\s+.+\n+/, '');
    const trimmed = withoutTitle.trim();

    if (trimmed.length <= maxLength) {
        return trimmed;
    }

    return trimmed.substring(0, maxLength).trim() + '...';
}
