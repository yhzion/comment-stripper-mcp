/**
 * Utility functions for processing files and directories
 */
import fs from 'fs/promises';
import path from 'path';
import { stripCommentsByFileType } from './commentStripper.js';
import { logger } from './logger.js';
import { FileSystemError, ProcessingError, UnsupportedFileTypeError } from './errorHandler.js';
import { processLargeFile, shouldUseStreaming } from './streamProcessor.js';
import { config } from './config.js';
/**
 * Supported file extensions for comment stripping
 */
export const SUPPORTED_EXTENSIONS = [
    // JavaScript/TypeScript
    'js', 'ts', 'jsx', 'tsx',
    // Web templates
    'vue', 'html', 'htm',
    // CSS
    'css', 'scss', 'less',
    // Python
    'py',
    // C-style languages
    'java', 'c', 'cpp', 'cs',
    // Ruby
    'rb',
    // PHP
    'php'
];
/**
 * Default progress tracker implementation that does nothing
 */
const defaultProgressTracker = {
    total: 0,
    processed: 0,
    updateProgress: () => { }
};
/**
 * Processes a single file to strip comments
 *
 * @param filePath - Path to the file to process
 * @returns Object containing original and stripped code
 */
export async function processFile(filePath) {
    try {
        logger.debug(`Processing file: ${filePath}`);
        // Check if file exists
        try {
            await fs.access(filePath, fs.constants.R_OK);
        }
        catch (error) {
            logger.error(`File not accessible: ${filePath}`, { error });
            throw new FileSystemError(`File not accessible: ${filePath}`);
        }
        // Check if file type is supported
        const extension = path.extname(filePath).slice(1).toLowerCase();
        if (!SUPPORTED_EXTENSIONS.includes(extension)) {
            logger.warn(`Unsupported file type: ${extension}`, { filePath });
            throw new UnsupportedFileTypeError(extension, { filePath });
        }
        // Check if we should use streaming for large files
        if (await shouldUseStreaming(filePath)) {
            logger.info(`Using stream processing for large file: ${filePath}`);
            return await processLargeFile(filePath);
        }
        // Process normally for smaller files
        const original = await fs.readFile(filePath, 'utf-8');
        const stripped = stripCommentsByFileType(filePath, original);
        logger.debug(`Successfully processed file: ${filePath}`);
        return { original, stripped };
    }
    catch (error) {
        if (error instanceof FileSystemError || error instanceof UnsupportedFileTypeError) {
            throw error; // Re-throw known errors
        }
        logger.error(`Error processing file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
        throw new ProcessingError(`Error processing file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Checks if a file should be processed based on its extension
 *
 * @param filePath - Path to the file
 * @param fileTypes - Array of file extensions to process
 * @returns Boolean indicating whether the file should be processed
 */
export function shouldProcessFile(filePath, fileTypes = SUPPORTED_EXTENSIONS) {
    const extension = path.extname(filePath).slice(1).toLowerCase();
    return fileTypes.includes(extension);
}
/**
 * Counts the number of files to be processed in a directory
 *
 * @param directoryPath - Path to the directory
 * @param recursive - Whether to count files in subdirectories
 * @param fileTypes - Array of file extensions to count
 * @returns Number of files to be processed
 */
async function countFiles(directoryPath, recursive = true, fileTypes = SUPPORTED_EXTENSIONS) {
    let count = 0;
    try {
        const entries = await fs.readdir(directoryPath, { withFileTypes: true });
        for (const entry of entries) {
            const entryPath = path.join(directoryPath, entry.name);
            if (entry.isDirectory() && recursive) {
                // Recursively count files in subdirectories
                count += await countFiles(entryPath, recursive, fileTypes);
            }
            else if (entry.isFile() && shouldProcessFile(entryPath, fileTypes)) {
                // Count this file
                count++;
            }
        }
        return count;
    }
    catch (error) {
        logger.error(`Error counting files in ${directoryPath}: ${error instanceof Error ? error.message : String(error)}`);
        throw new FileSystemError(`Error counting files in ${directoryPath}: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Recursively processes all files in a directory
 *
 * @param directoryPath - Path to the directory to process
 * @param recursive - Whether to process subdirectories recursively
 * @param fileTypes - Array of file extensions to process
 * @param progressTracker - Optional progress tracker for large directories
 * @returns Object containing results for each processed file
 */
export async function processDirectory(directoryPath, recursive = true, fileTypes = SUPPORTED_EXTENSIONS, progressTracker = defaultProgressTracker) {
    const results = {};
    try {
        logger.info(`Processing directory: ${directoryPath}`, { recursive, fileTypes });
        // Check if directory exists
        try {
            await fs.access(directoryPath, fs.constants.R_OK);
        }
        catch (error) {
            logger.error(`Directory not accessible: ${directoryPath}`, { error });
            throw new FileSystemError(`Directory not accessible: ${directoryPath}`);
        }
        // Count total files for progress tracking if not already set
        if (progressTracker.total === 0) {
            logger.debug(`Counting files in directory: ${directoryPath}`);
            progressTracker.total = await countFiles(directoryPath, recursive, fileTypes);
            progressTracker.processed = 0;
            progressTracker.updateProgress(0, progressTracker.total);
            logger.info(`Found ${progressTracker.total} files to process in ${directoryPath}`);
        }
        const entries = await fs.readdir(directoryPath, { withFileTypes: true });
        // Process in batches for better performance with large directories
        const batchSize = config.MAX_WORKERS;
        const batches = [];
        let currentBatch = [];
        // Group entries into batches
        for (const entry of entries) {
            const entryPath = path.join(directoryPath, entry.name);
            if (entry.isDirectory() && recursive) {
                // Process subdirectories immediately (not in batches)
                const subResults = await processDirectory(entryPath, recursive, fileTypes, progressTracker);
                Object.assign(results, subResults);
            }
            else if (entry.isFile() && shouldProcessFile(entryPath, fileTypes)) {
                // Add file to current batch
                currentBatch.push(entryPath);
                // When batch is full, add to batches array and create a new batch
                if (currentBatch.length >= batchSize) {
                    batches.push([...currentBatch]);
                    currentBatch = [];
                }
            }
        }
        // Add any remaining files to batches
        if (currentBatch.length > 0) {
            batches.push(currentBatch);
        }
        // Process batches in sequence
        for (const batch of batches) {
            // Process files in batch concurrently
            const batchResults = await Promise.all(batch.map(async (filePath) => {
                try {
                    const result = await processFile(filePath);
                    return { filePath, result };
                }
                catch (error) {
                    logger.warn(`Skipping file ${filePath} due to error: ${error instanceof Error ? error.message : String(error)}`);
                    return { filePath, error };
                }
                finally {
                    // Update progress regardless of success/failure
                    progressTracker.processed++;
                    progressTracker.updateProgress(progressTracker.processed, progressTracker.total);
                }
            }));
            // Add successful results to the results object
            for (const { filePath, result, error } of batchResults) {
                if (result && !error) {
                    results[filePath] = result;
                }
            }
        }
        logger.info(`Completed processing directory: ${directoryPath}`, {
            totalFiles: progressTracker.total,
            processedFiles: progressTracker.processed,
            successfulFiles: Object.keys(results).length
        });
        return results;
    }
    catch (error) {
        if (error instanceof FileSystemError) {
            throw error; // Re-throw known errors
        }
        logger.error(`Error processing directory ${directoryPath}: ${error instanceof Error ? error.message : String(error)}`);
        throw new FileSystemError(`Error processing directory ${directoryPath}: ${error instanceof Error ? error.message : String(error)}`);
    }
}
