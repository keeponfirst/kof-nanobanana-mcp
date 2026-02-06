/**
 * Type definitions for KOF Nano Banana MCP Server
 */

export interface PromptFrontmatter {
    output_path: string;
    model?: 'gemini-2.5-flash-image' | 'gemini-3-pro-image-preview';
    aspect_ratio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
    overwrite?: boolean;
}

export interface ParsedPrompt {
    frontmatter: PromptFrontmatter;
    prompt: string;
    title: string;
    filename: string;
    isValid: boolean;
    validationErrors: string[];
}

export interface GenerationResult {
    success: boolean;
    output_path: string;
    model_used: string;
    prompt_tokens?: number;
    generation_time_ms: number;
    skipped: boolean;
    error?: string;
}

export interface QueueProcessResult {
    mode: 'validate' | 'dry_run' | 'execute';
    processed: number;
    successful: number;
    failed: number;
    skipped: number;
    results: Array<{
        prompt_file: string;
        output_path: string;
        status: 'success' | 'failed' | 'skipped' | 'would_generate';
        validation_errors?: string[];
        error?: string;
    }>;
    [key: string]: unknown;
}

export interface QueueListItem {
    filename: string;
    title: string;
    output_path: string;
    model: string;
    aspect_ratio?: string;
    overwrite: boolean;
    preview: string;
    is_valid: boolean;
    validation_errors?: string[];
    output_exists: boolean;
}

export interface QueueListResult {
    count: number;
    valid_count: number;
    invalid_count: number;
    conflict_count: number;
    prompts: QueueListItem[];
    [key: string]: unknown;
}

export const SUPPORTED_MODELS = [
    'gemini-2.5-flash-image',
    'gemini-3-pro-image-preview'
] as const;

export const SUPPORTED_ASPECT_RATIOS = [
    '1:1',
    '16:9',
    '9:16',
    '4:3',
    '3:4'
] as const;

export const DEFAULT_MODEL = 'gemini-2.5-flash-image';
export const DEFAULT_ASPECT_RATIO = '1:1';
