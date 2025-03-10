/**
 * Stream processing utilities for handling large files efficiently
 * Provides chunked processing to optimize memory usage
 */

import fs from 'fs';
import { Readable, Transform } from 'stream';
import { pipeline } from 'stream/promises';
import { stripCommentsByFileType } from './commentStripper.js';
import { config } from './config.js';
import { logger } from './logger.js';
import { FileSystemError, ProcessingError } from './errorHandler.js';

/**
 * ChunkTransform class for processing code in chunks
 * This allows processing large files without loading the entire file into memory
 */
export class CommentStripperTransform extends Transform {
  private buffer: string = '';
  private readonly filePath: string;
  private readonly chunkSize: number;

  /**
   * Create a new CommentStripperTransform
   * @param filePath - Path to the file being processed (for extension detection)
   * @param chunkSize - Size of chunks to process at once
   */
  constructor(filePath: string, chunkSize: number = config.CHUNK_SIZE) {
    super({
      readableObjectMode: true,
      writableObjectMode: false
    });
    this.filePath = filePath;
    this.chunkSize = chunkSize;
  }

  /**
   * Process chunks of data
   * @param chunk - Incoming chunk of data
   * @param encoding - Encoding of the chunk
   * @param callback - Callback function
   */
  _transform(
    chunk: Buffer | string,
    encoding: BufferEncoding,
    callback: (error?: Error | null, data?: any) => void
  ): void {
    try {
      // Convert chunk to string and add to buffer
      const chunkStr = Buffer.isBuffer(chunk) ? chunk.toString('utf-8') : chunk;
      this.buffer += chunkStr;

      // Process complete chunks when buffer exceeds chunk size
      if (this.buffer.length >= this.chunkSize) {
        this.processBuffer();
      }

      callback();
    } catch (error) {
      callback(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Process any remaining data in the buffer
   * @param callback - Callback function
   */
  _flush(callback: (error?: Error | null, data?: any) => void): void {
    try {
      if (this.buffer.length > 0) {
        this.processBuffer(true);
      }
      callback();
    } catch (error) {
      callback(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Process the current buffer
   * @param isLast - Whether this is the last chunk
   */
  private processBuffer(isLast: boolean = false): void {
    try {
      // If this is the last chunk, process the entire remaining buffer
      if (isLast) {
        const stripped = stripCommentsByFileType(this.filePath, this.buffer);
        this.push(stripped);
        this.buffer = '';
        return;
      }

      // Find a safe boundary to split the buffer (end of line)
      let boundaryIndex = this.buffer.lastIndexOf('\n', this.chunkSize);
      if (boundaryIndex === -1) {
        // If no newline found, use a reasonable position
        boundaryIndex = Math.max(this.buffer.lastIndexOf(';', this.chunkSize), 
                                this.buffer.lastIndexOf('}', this.chunkSize),
                                this.buffer.lastIndexOf('{', this.chunkSize));
      }

      // If still no good boundary, just use the chunk size
      if (boundaryIndex === -1) {
        boundaryIndex = this.chunkSize;
      }

      // Extract the chunk to process
      const chunkToProcess = this.buffer.substring(0, boundaryIndex + 1);
      
      // Process the chunk and push to output
      const stripped = stripCommentsByFileType(this.filePath, chunkToProcess);
      this.push(stripped);

      // Update the buffer to contain only the remaining data
      this.buffer = this.buffer.substring(boundaryIndex + 1);
    } catch (error) {
      logger.error(`Error processing buffer: ${error instanceof Error ? error.message : String(error)}`);
      throw new ProcessingError(`Failed to process file chunk: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

/**
 * Process a large file using streams
 * @param filePath - Path to the file to process
 * @param outputPath - Path to write the processed output
 * @returns Promise that resolves when processing is complete
 */
export async function processLargeFile(
  filePath: string,
  outputPath?: string
): Promise<{ original: string; stripped: string }> {
  try {
    // Create read stream for the input file
    const readStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
    
    // Create transform stream for processing
    const transformStream = new CommentStripperTransform(filePath);
    
    // Collect the processed output
    let strippedContent = '';
    transformStream.on('data', (chunk: string) => {
      strippedContent += chunk;
    });

    // Process the file
    if (outputPath) {
      // If output path is provided, write directly to file
      const writeStream = fs.createWriteStream(outputPath, { encoding: 'utf-8' });
      await pipeline(readStream, transformStream, writeStream);
    } else {
      // Otherwise, collect the output in memory
      await pipeline(readStream, transformStream);
    }

    // Read the original content for comparison
    const original = await fs.promises.readFile(filePath, 'utf-8');
    
    return {
      original,
      stripped: strippedContent
    };
  } catch (error) {
    logger.error(`Error processing large file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    throw new FileSystemError(`Failed to process large file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Determines if a file should be processed using streaming based on its size
 * @param filePath - Path to the file
 * @returns Promise that resolves to a boolean indicating if streaming should be used
 */
export async function shouldUseStreaming(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.promises.stat(filePath);
    // Use streaming for files larger than the configured memory limit
    return stats.size > config.MEMORY_LIMIT;
  } catch (error) {
    logger.warn(`Error checking file size for ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}
