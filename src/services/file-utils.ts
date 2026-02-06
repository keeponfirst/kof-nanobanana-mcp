/**
 * File system utilities
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * List all markdown files in a directory
 */
export function listMarkdownFiles(dir: string): string[] {
    if (!fs.existsSync(dir)) {
        return [];
    }

    const files = fs.readdirSync(dir);
    return files
        .filter(f => f.endsWith('.md') && !f.startsWith('.') && f !== '.gitkeep')
        .map(f => path.join(dir, f))
        .sort();
}

/**
 * Check if a file exists
 */
export function fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
}

/**
 * Move a file to a new location
 */
export function moveFile(src: string, dest: string): void {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.renameSync(src, dest);
}

/**
 * Generate a unique filename by adding a suffix
 */
export function generateUniquePath(originalPath: string): string {
    if (!fs.existsSync(originalPath)) {
        return originalPath;
    }

    const ext = path.extname(originalPath);
    const base = originalPath.slice(0, -ext.length);
    let counter = 1;

    while (fs.existsSync(`${base}_${counter}${ext}`)) {
        counter++;
    }

    return `${base}_${counter}${ext}`;
}

/**
 * Add timestamp suffix to completed prompt filename
 */
export function getCompletedFilename(originalFilename: string): string {
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const base = originalFilename.replace(/\.md$/, '');
    return `${timestamp}_${base}.md`;
}
