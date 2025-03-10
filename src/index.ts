import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { stripComments } from "./utils/commentStripper.js";
import { processFile, processDirectory, SUPPORTED_EXTENSIONS, ProgressTracker } from "./utils/fileProcessor.js";
import { logger } from "./utils/logger.js";
import { config } from "./utils/config.js";
import { handleError, ValidationError } from "./utils/errorHandler.js";
import { authMiddleware } from "./utils/auth.js";

// Define the request schema for the strip-comments endpoint
const stripCommentsSchema = z.object({
  text: z.string().optional(),
  filePath: z.string().optional(),
  directoryPath: z.string().optional(),
  recursive: z.boolean().optional().default(true),
  fileTypes: z.array(z.string()).optional().default(SUPPORTED_EXTENSIONS),
  trackProgress: z.boolean().optional().default(false)
}).refine(data => {
  // Ensure at least one of text, filePath, or directoryPath is provided
  return data.text !== undefined || data.filePath !== undefined || data.directoryPath !== undefined;
}, {
  message: "At least one of 'text', 'filePath', or 'directoryPath' must be provided"
});

// Define the type for the request parameters
type StripCommentsParams = z.infer<typeof stripCommentsSchema>;

// Create a map to store progress information for directory processing
const progressMap = new Map<string, ProgressTracker>();

// Create the MCP server
const server = new McpServer({
  name: "comment-stripper-mcp",
  version: "1.0.0",
  methods: {
    "/api/strip-comments": {
      description: "Strips comments from code files",
      parameters: stripCommentsSchema,
      handler: async (params: StripCommentsParams, context: { headers: Record<string, string> }) => {
        try {
          // Apply authentication middleware if enabled
          try {
            params = authMiddleware(params, context.headers);
          } catch (authError: any) {
            logger.error("Authentication failed", { error: authError.message });
            return {
              success: false,
              error: {
                code: 401,
                message: "Authentication failed",
                details: authError.message
              }
            };
          }
          
          logger.info("Processing strip-comments request", { 
            hasText: params.text !== undefined,
            filePath: params.filePath,
            directoryPath: params.directoryPath,
            recursive: params.recursive,
            fileTypes: params.fileTypes?.length,
            trackProgress: params.trackProgress
          });

          // Process text input
          if (params.text !== undefined) {
            logger.debug("Processing text input", { textLength: params.text.length });
            const stripped = stripComments(params.text);
            logger.debug("Text processing complete", { 
              originalLength: params.text.length, 
              strippedLength: stripped.length 
            });
            
            return {
              success: true,
              data: {
                original: params.text,
                stripped
              }
            };
          }
          
          // Process single file
          if (params.filePath !== undefined) {
            logger.info(`Processing file: ${params.filePath}`);
            const result = await processFile(params.filePath);
            logger.info(`File processing complete: ${params.filePath}`, {
              originalLength: result.original.length,
              strippedLength: result.stripped.length
            });
            
            return {
              success: true,
              data: result
            };
          }
          
          // Process directory
          if (params.directoryPath !== undefined) {
            let progressTracker: ProgressTracker | undefined;
            let trackerId: string | undefined;
            
            // Setup progress tracking if requested
            if (params.trackProgress) {
              trackerId = `dir_${Date.now()}`;
              
              progressTracker = {
                total: 0,
                processed: 0,
                updateProgress: (processed, total) => {
                  // Update the progress information
                  if (progressTracker) {
                    progressTracker.processed = processed;
                    progressTracker.total = total;
                    
                    // Log progress updates at reasonable intervals
                    if (processed % 10 === 0 || processed === total) {
                      const percentage = total > 0 ? Math.round((processed / total) * 100) : 0;
                      logger.debug(`Processing progress: ${processed}/${total} (${percentage}%)`);
                    }
                  }
                }
              };
              
              // Store the progress tracker
              progressMap.set(trackerId, progressTracker);
              logger.debug(`Created progress tracker: ${trackerId}`);
              
              // Clean up old progress trackers (keep only the last 10)
              if (progressMap.size > 10) {
                const keys = Array.from(progressMap.keys());
                progressMap.delete(keys[0]);
                logger.debug(`Removed old progress tracker: ${keys[0]}`);
              }
            }
            
            logger.info(`Processing directory: ${params.directoryPath}`, {
              recursive: params.recursive,
              fileTypes: params.fileTypes,
              trackProgress: params.trackProgress
            });
            
            const results = await processDirectory(
              params.directoryPath,
              params.recursive,
              params.fileTypes,
              progressTracker
            );
            
            const fileCount = Object.keys(results).length;
            logger.info(`Directory processing complete: ${params.directoryPath}`, {
              fileCount,
              trackerId
            });
            
            return {
              success: true,
              data: {
                files: Object.entries(results).map(([filePath, content]) => ({
                  filePath,
                  original: content.original as string,
                  stripped: content.stripped as string
                })),
                progress: progressTracker ? {
                  trackerId,
                  processed: progressTracker.processed,
                  total: progressTracker.total,
                  percentage: progressTracker.total > 0 
                    ? Math.round((progressTracker.processed / progressTracker.total) * 100) 
                    : 0
                } : undefined
              }
            };
          }
          
          // This should never happen due to schema validation
          throw new ValidationError("Invalid request parameters");
        } catch (error) {
          return handleError(error);
        }
      }
    },
    
    "/api/get-progress": {
      description: "Gets the progress of a directory processing operation",
      parameters: z.object({
        trackerId: z.string()
      }),
      handler: async (params: { trackerId: string }, context: { headers: Record<string, string> }) => {
        try {
          // Apply authentication middleware if enabled
          try {
            params = authMiddleware(params, context.headers);
          } catch (authError: any) {
            logger.error("Authentication failed", { error: authError.message });
            return {
              success: false,
              error: {
                code: 401,
                message: "Authentication failed",
                details: authError.message
              }
            };
          }
          
          logger.debug(`Getting progress for tracker: ${params.trackerId}`);
          const progressTracker = progressMap.get(params.trackerId);
          
          if (!progressTracker) {
            logger.warn(`Progress tracker not found: ${params.trackerId}`);
            return handleError(new ValidationError("Progress tracker not found", { trackerId: params.trackerId }));
          }
          
          const percentage = progressTracker.total > 0 
            ? Math.round((progressTracker.processed / progressTracker.total) * 100) 
            : 0;
          
          logger.debug(`Progress for ${params.trackerId}: ${progressTracker.processed}/${progressTracker.total} (${percentage}%)`);
          
          return {
            success: true,
            data: {
              processed: progressTracker.processed,
              total: progressTracker.total,
              percentage,
              completed: progressTracker.processed >= progressTracker.total
            }
          };
        } catch (error) {
          return handleError(error);
        }
      }
    },
    
    "/api/auth-status": {
      description: "Gets the current authentication status and configuration",
      parameters: z.object({}),
      handler: async (params: {}, context: { headers: Record<string, string> }) => {
        try {
          // Check if authentication is enabled
          const authEnabled = config.AUTH_ENABLED;
          
          // If authentication is enabled, validate the provided API key
          let authenticated = false;
          if (authEnabled) {
            try {
              authMiddleware({}, context.headers);
              authenticated = true;
            } catch (error) {
              authenticated = false;
            }
          }
          
          return {
            success: true,
            data: {
              authEnabled,
              authenticated,
              message: authEnabled 
                ? (authenticated ? "Authenticated successfully" : "Not authenticated") 
                : "Authentication is disabled"
            }
          };
        } catch (error) {
          return handleError(error);
        }
      }
    }
  }
});

// Start the server with stdio transport
const transport = new StdioServerTransport();

// Use an async IIFE to start the server
(async () => {
  try {
    logger.info(`Starting Comment Stripper MCP server (${config.NODE_ENV} mode)`);
    logger.debug("Server configuration", {
      logLevel: config.LOG_LEVEL,
      logToFile: config.LOG_TO_FILE,
      maxWorkers: config.MAX_WORKERS,
      chunkSize: config.CHUNK_SIZE,
      authEnabled: config.AUTH_ENABLED
    });
    
    await server.connect(transport);
    logger.info("Comment Stripper MCP server started successfully");
    
    if (config.AUTH_ENABLED) {
      logger.info("API authentication is enabled");
    } else {
      logger.info("API authentication is disabled");
    }
  } catch (error) {
    logger.error("Failed to start server", { error });
    process.exit(1);
  }
  
  // Handle process termination
  process.on('SIGINT', () => {
    logger.info("Server shutting down");
    logger.close();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    logger.info("Server shutting down");
    logger.close();
    process.exit(0);
  });
  
  process.on('uncaughtException', (error) => {
    logger.error("Uncaught exception", { error: error.message, stack: error.stack });
    logger.close();
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason) => {
    logger.error("Unhandled promise rejection", { reason });
    logger.close();
    process.exit(1);
  });
})();
