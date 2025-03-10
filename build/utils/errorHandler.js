/**
 * Error handling utilities for the comment-stripper-mcp
 * Provides standardized error types and handling mechanisms
 */
import { logger } from './logger.js';
/**
 * Base error class for the application
 */
export class AppError extends Error {
    code;
    statusCode;
    isOperational;
    context;
    constructor({ message, code = 'INTERNAL_ERROR', statusCode = 500, isOperational = true, context = {} }) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.context = context;
        // Capture stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}
/**
 * Error for invalid input parameters
 */
export class ValidationError extends AppError {
    constructor(message, context) {
        super({
            message,
            code: 'VALIDATION_ERROR',
            statusCode: 400,
            isOperational: true,
            context
        });
    }
}
/**
 * Error for file system operations
 */
export class FileSystemError extends AppError {
    constructor(message, context) {
        super({
            message,
            code: 'FILE_SYSTEM_ERROR',
            statusCode: 500,
            isOperational: true,
            context
        });
    }
}
/**
 * Error for unsupported file types
 */
export class UnsupportedFileTypeError extends AppError {
    constructor(fileType, context) {
        super({
            message: `Unsupported file type: ${fileType}`,
            code: 'UNSUPPORTED_FILE_TYPE',
            statusCode: 400,
            isOperational: true,
            context: { fileType, ...context }
        });
    }
}
/**
 * Error for processing failures
 */
export class ProcessingError extends AppError {
    constructor(message, context) {
        super({
            message,
            code: 'PROCESSING_ERROR',
            statusCode: 500,
            isOperational: true,
            context
        });
    }
}
/**
 * Handles an error by logging it and determining if it's operational
 * @param error - The error to handle
 * @returns Formatted error response
 */
export function handleError(error) {
    // Convert unknown errors to AppError format
    const appError = convertToAppError(error);
    // Log the error
    if (appError.isOperational) {
        logger.warn(`Operational error: ${appError.message}`, {
            code: appError.code,
            stack: appError.stack,
            context: appError.context
        });
    }
    else {
        logger.error(`Unhandled error: ${appError.message}`, {
            code: appError.code,
            stack: appError.stack,
            context: appError.context
        });
    }
    // Return a standardized error response
    return {
        success: false,
        error: appError.message,
        code: appError.code,
        details: appError.context
    };
}
/**
 * Converts any error to an AppError
 * @param error - The error to convert
 * @returns AppError instance
 */
function convertToAppError(error) {
    if (error instanceof AppError) {
        return error;
    }
    if (error instanceof Error) {
        return new AppError({
            message: error.message,
            isOperational: false,
            context: { originalError: error.name, stack: error.stack }
        });
    }
    return new AppError({
        message: String(error),
        isOperational: false,
        context: { originalError: error }
    });
}
/**
 * Wraps an async function with error handling
 * @param fn - The async function to wrap
 * @returns Wrapped function that handles errors
 */
export function withErrorHandling(fn) {
    return async (...args) => {
        try {
            return await fn(...args);
        }
        catch (error) {
            return handleError(error);
        }
    };
}
