/**
 * Logger utility for the comment-stripper-mcp
 * Provides standardized logging with different log levels and formatting
 */
import fs from 'fs';
import path from 'path';
// Log levels enum
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 3] = "DEBUG";
    LogLevel[LogLevel["TRACE"] = 4] = "TRACE";
})(LogLevel || (LogLevel = {}));
// Log level names for output formatting
const LOG_LEVEL_NAMES = {
    [LogLevel.ERROR]: 'ERROR',
    [LogLevel.WARN]: 'WARN',
    [LogLevel.INFO]: 'INFO',
    [LogLevel.DEBUG]: 'DEBUG',
    [LogLevel.TRACE]: 'TRACE'
};
// ANSI color codes for console output
const COLORS = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m'
};
// Color mapping for log levels
const LEVEL_COLORS = {
    [LogLevel.ERROR]: COLORS.red,
    [LogLevel.WARN]: COLORS.yellow,
    [LogLevel.INFO]: COLORS.green,
    [LogLevel.DEBUG]: COLORS.blue,
    [LogLevel.TRACE]: COLORS.magenta
};
/**
 * Creates a directory if it doesn't exist
 * @param dirPath - Path to the directory to create
 */
function createLogDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}
/**
 * Logger class that handles logging to console and file
 */
export class Logger {
    static instance;
    logLevel;
    logToFile;
    logFilePath;
    logFileStream = null;
    /**
     * Private constructor for singleton pattern
     * @param logLevel - The minimum log level to output
     * @param logToFile - Whether to log to a file
     * @param logDir - Directory for log files
     * @param logFileName - Name of the log file
     */
    constructor(logLevel = LogLevel.INFO, logToFile = false, logDir = 'logs', logFileName = `comment-stripper-${new Date().toISOString().split('T')[0]}.log`) {
        this.logLevel = logLevel;
        this.logToFile = logToFile;
        this.logFilePath = path.join(logDir, logFileName);
        if (this.logToFile) {
            try {
                createLogDir(logDir);
                this.logFileStream = fs.createWriteStream(this.logFilePath, { flags: 'a' });
            }
            catch (error) {
                console.error(`Failed to create log file: ${error instanceof Error ? error.message : String(error)}`);
                this.logToFile = false;
            }
        }
    }
    /**
     * Get the singleton instance of the logger
     */
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger(process.env.LOG_LEVEL ? parseInt(process.env.LOG_LEVEL) : undefined, process.env.LOG_TO_FILE === 'true', process.env.LOG_DIR, process.env.LOG_FILE_NAME);
        }
        return Logger.instance;
    }
    /**
     * Configure the logger with new settings
     */
    configure({ logLevel, logToFile, logDir, logFileName }) {
        if (logLevel !== undefined) {
            this.logLevel = logLevel;
        }
        if (logToFile !== undefined && logToFile !== this.logToFile) {
            this.logToFile = logToFile;
            // Close existing stream if we're turning off file logging
            if (!logToFile && this.logFileStream) {
                this.logFileStream.end();
                this.logFileStream = null;
            }
        }
        // If we're changing the log file location
        if (this.logToFile && (logDir || logFileName)) {
            const newLogDir = logDir || path.dirname(this.logFilePath);
            const newLogFileName = logFileName || path.basename(this.logFilePath);
            const newLogFilePath = path.join(newLogDir, newLogFileName);
            // Only create a new stream if the path has changed
            if (newLogFilePath !== this.logFilePath) {
                // Close existing stream
                if (this.logFileStream) {
                    this.logFileStream.end();
                }
                try {
                    createLogDir(newLogDir);
                    this.logFilePath = newLogFilePath;
                    this.logFileStream = fs.createWriteStream(this.logFilePath, { flags: 'a' });
                }
                catch (error) {
                    console.error(`Failed to create log file: ${error instanceof Error ? error.message : String(error)}`);
                    this.logToFile = false;
                }
            }
        }
    }
    /**
     * Format a log message with timestamp and level
     */
    formatLogMessage(level, message, meta) {
        const timestamp = new Date().toISOString();
        const levelName = LOG_LEVEL_NAMES[level];
        let formattedMessage = `[${timestamp}] [${levelName}] ${message}`;
        if (meta) {
            formattedMessage += ` ${JSON.stringify(meta)}`;
        }
        return formattedMessage;
    }
    /**
     * Log a message if the level is enabled
     */
    log(level, message, meta) {
        if (level > this.logLevel)
            return;
        const formattedMessage = this.formatLogMessage(level, message, meta);
        // Log to console with colors
        if (process.stdout.isTTY) {
            console.log(`${LEVEL_COLORS[level]}${formattedMessage}${COLORS.reset}`);
        }
        else {
            console.log(formattedMessage);
        }
        // Log to file if enabled
        if (this.logToFile && this.logFileStream) {
            this.logFileStream.write(formattedMessage + '\n');
        }
    }
    /**
     * Log an error message
     */
    error(message, meta) {
        this.log(LogLevel.ERROR, message, meta);
    }
    /**
     * Log a warning message
     */
    warn(message, meta) {
        this.log(LogLevel.WARN, message, meta);
    }
    /**
     * Log an info message
     */
    info(message, meta) {
        this.log(LogLevel.INFO, message, meta);
    }
    /**
     * Log a debug message
     */
    debug(message, meta) {
        this.log(LogLevel.DEBUG, message, meta);
    }
    /**
     * Log a trace message
     */
    trace(message, meta) {
        this.log(LogLevel.TRACE, message, meta);
    }
    /**
     * Close the logger and any open file streams
     */
    close() {
        if (this.logFileStream) {
            this.logFileStream.end();
            this.logFileStream = null;
        }
    }
}
// Export a default logger instance
export const logger = Logger.getInstance();
