/**
 * Configuration management for the comment-stripper-mcp
 * Handles loading and validating configuration from environment variables
 */

import { z } from 'zod';
import { logger, LogLevel } from './logger.js';
import os from 'os';

// Define the configuration schema using Zod
const configSchema = z.object({
  // Server configuration
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default('127.0.0.1'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Logging configuration
  LOG_LEVEL: z.coerce
    .number()
    .int()
    .min(0)
    .max(4)
    .default(LogLevel.INFO)
    .transform(val => val as LogLevel),
  LOG_TO_FILE: z.coerce.boolean().default(false),
  LOG_DIR: z.string().default('logs'),
  LOG_FILE_NAME: z.string().optional(),
  
  // Performance configuration
  CHUNK_SIZE: z.coerce.number().int().positive().default(1024 * 1024), // 1MB default chunk size
  MAX_WORKERS: z.coerce
    .number()
    .int()
    .positive()
    .default(Math.max(1, Math.floor(os.cpus().length / 2))),
  MEMORY_LIMIT: z.coerce.number().int().positive().default(1024 * 1024 * 512), // 512MB default
  
  // Cache configuration
  ENABLE_CACHE: z.coerce.boolean().default(true),
  CACHE_TTL: z.coerce.number().int().positive().default(3600), // 1 hour default
  
  // Security configuration
  TIMEOUT: z.coerce.number().int().positive().default(30000), // 30 seconds default
});

// Define the configuration type
export type AppConfig = z.infer<typeof configSchema>;

/**
 * Load configuration from environment variables
 * @returns Validated configuration object
 */
export function loadConfig(): AppConfig {
  try {
    // Parse and validate configuration
    const config = configSchema.parse(process.env);
    
    // Configure logger with loaded settings
    logger.configure({
      logLevel: config.LOG_LEVEL,
      logToFile: config.LOG_TO_FILE,
      logDir: config.LOG_DIR,
      logFileName: config.LOG_FILE_NAME || `comment-stripper-${new Date().toISOString().split('T')[0]}.log`
    });
    
    // Log configuration in development mode
    if (config.NODE_ENV === 'development') {
      logger.debug('Loaded configuration', {
        ...config,
        // Omit any sensitive values if they were to be added in the future
      });
    }
    
    return config;
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      console.error('Configuration validation failed:', JSON.stringify(error.format(), null, 2));
      process.exit(1);
    }
    
    // Handle other errors
    console.error('Failed to load configuration:', error);
    process.exit(1);
  }
}

// Export the default configuration
export const config = loadConfig();
