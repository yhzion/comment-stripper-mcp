/**
 * File utility functions for the comment-stripper-mcp
 */
import fs from 'fs';
/**
 * Creates a directory if it doesn't exist
 * @param dirPath - Path to the directory to create
 */
export function createLogDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}
/**
 * Checks if a path exists and is accessible
 * @param filePath - Path to check
 * @returns Boolean indicating if the path exists and is accessible
 */
export async function pathExists(filePath) {
    try {
        await fs.promises.access(filePath, fs.constants.F_OK);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Gets file stats with error handling
 * @param filePath - Path to the file
 * @returns File stats or null if file doesn't exist
 */
export async function getFileStats(filePath) {
    try {
        return await fs.promises.stat(filePath);
    }
    catch {
        return null;
    }
}
/**
 * Safely reads a file with error handling
 * @param filePath - Path to the file
 * @param encoding - File encoding (default: utf-8)
 * @returns File contents or null if file doesn't exist or can't be read
 */
export async function safeReadFile(filePath, encoding = 'utf-8') {
    try {
        return await fs.promises.readFile(filePath, { encoding });
    }
    catch {
        return null;
    }
}
/**
 * Safely writes to a file with error handling
 * @param filePath - Path to the file
 * @param data - Data to write
 * @param options - Write options
 * @returns Boolean indicating success
 */
export async function safeWriteFile(filePath, data, options) {
    try {
        await fs.promises.writeFile(filePath, data, options);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Ensures a directory exists, creating it if necessary
 * @param dirPath - Path to the directory
 * @returns Boolean indicating success
 */
export async function ensureDir(dirPath) {
    try {
        await fs.promises.mkdir(dirPath, { recursive: true });
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Gets the size of a file in bytes
 * @param filePath - Path to the file
 * @returns File size in bytes or -1 if file doesn't exist
 */
export async function getFileSize(filePath) {
    const stats = await getFileStats(filePath);
    return stats ? stats.size : -1;
}
