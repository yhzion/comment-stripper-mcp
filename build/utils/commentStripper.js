/**
 * Utility functions for stripping comments from code files
 */
// Cache regex patterns for better performance
const REGEX_CACHE = {
    // JavaScript/TypeScript patterns
    js: {
        stringLiteral: /(['`"])(?:(?!\1)[^\\]|\\[\s\S])*?\1/g,
        regexLiteral: /\/(?:[^\\*\/\n]|\\[\s\S])+?\/(?:[gimuy]+)?/g,
        multiLineComment: /\/\*[\s\S]*?\*\//g,
        singleLineComment: /\/\/.*$/gm
    },
    // Python patterns
    py: {
        stringLiteral: /(['"])(?:(?!\1)[^\\]|\\[\s\S])*?\1/g,
        singleLineComment: /#.*$/gm
    },
    // HTML patterns
    html: {
        comment: /<!--[\s\S]*?-->/g
    },
    // CSS patterns
    css: {
        comment: /\/\*[\s\S]*?\*\//g
    },
    // Ruby patterns
    ruby: {
        stringLiteral: /(['"])(?:(?!\1)[^\\]|\\[\s\S])*?\1/g,
        heredoc: /<<[-~]?(['"]?)\w+\1.*?\n.*?\n\s*\w+/gs,
        multiLineComment: /=begin\s[\s\S]*?=end/g,
        singleLineComment: /#.*$/gm
    },
    // PHP patterns
    php: {
        stringLiteral: /(['"])(?:(?!\1)[^\\]|\\[\s\S])*?\1/g,
        multiLineComment: /\/\*[\s\S]*?\*\//g,
        singleLineComment: /(?:\/\/|#).*$/gm
    }
};
/**
 * Optimized function to replace literals with placeholders and store them for later restoration.
 * Uses a Map for faster lookups and a more efficient placeholder strategy.
 *
 * @param code - The source code to process
 * @param pattern - The regex pattern to match literals
 * @param literalMap - Map to store literals
 * @param prefix - Prefix for the placeholder
 * @returns Processed code with literals replaced by placeholders
 */
function replaceLiterals(code, pattern, literalMap, prefix) {
    let lastIndex = 0;
    let match;
    let result = '';
    // Reset the regex pattern's lastIndex
    pattern.lastIndex = 0;
    // Use exec for better performance with large strings
    while ((match = pattern.exec(code)) !== null) {
        // Add the text between the last match and this match
        result += code.substring(lastIndex, match.index);
        // Create a unique placeholder
        const placeholder = `__${prefix}_${literalMap.size}__`;
        // Store the literal in the map
        literalMap.set(placeholder, match[0]);
        // Add the placeholder to the result
        result += placeholder;
        // Update lastIndex
        lastIndex = pattern.lastIndex;
    }
    // Add the remaining text
    result += code.substring(lastIndex);
    return result;
}
/**
 * Restores literals from placeholders in a more efficient way.
 *
 * @param code - The processed code with placeholders
 * @param literalMap - Map containing the literals
 * @returns Code with literals restored
 */
function restoreLiterals(code, literalMap) {
    if (literalMap.size === 0)
        return code;
    let result = code;
    // Use a single regex replacement for all placeholders
    const placeholderPattern = /__[A-Z]+_\d+__/g;
    result = result.replace(placeholderPattern, (match) => {
        return literalMap.get(match) || match;
    });
    return result;
}
/**
 * Removes JavaScript/TypeScript comments from a string.
 * Optimized for performance with large files.
 *
 * @param code - The source code to process.
 * @returns The code with all comments removed.
 */
export function stripJsComments(code) {
    if (!code)
        return '';
    // Use a Map for faster lookups when restoring literals
    const literalMap = new Map();
    // Process string literals
    let processedCode = replaceLiterals(code, REGEX_CACHE.js.stringLiteral, literalMap, 'STR');
    // Process regex literals
    processedCode = replaceLiterals(processedCode, REGEX_CACHE.js.regexLiteral, literalMap, 'REGEX');
    // Remove multi-line comments
    processedCode = processedCode.replace(REGEX_CACHE.js.multiLineComment, '');
    // Remove single-line comments
    processedCode = processedCode.replace(REGEX_CACHE.js.singleLineComment, '');
    // Restore all literals in one pass
    return restoreLiterals(processedCode, literalMap);
}
/**
 * Removes Vue template comments from a string.
 * Handles HTML-style comments <!-- ... -->
 *
 * @param code - The Vue template code to process.
 * @returns The code with all comments removed.
 */
export function stripVueComments(code) {
    // First strip JS comments from script sections
    const jsCommentStripped = stripJsComments(code);
    // Then strip HTML comments
    return jsCommentStripped.replace(REGEX_CACHE.html.comment, '');
}
/**
 * Removes HTML comments from a string.
 *
 * @param code - The HTML code to process.
 * @returns The code with all comments removed.
 */
export function stripHtmlComments(code) {
    return code.replace(REGEX_CACHE.html.comment, '');
}
/**
 * Removes CSS comments from a string.
 *
 * @param code - The CSS code to process.
 * @returns The code with all comments removed.
 */
export function stripCssComments(code) {
    return code.replace(REGEX_CACHE.css.comment, '');
}
/**
 * Removes Python comments from a string.
 * Optimized for performance with large files.
 *
 * @param code - The Python code to process.
 * @returns The code with all comments removed.
 */
export function stripPythonComments(code) {
    if (!code)
        return '';
    // Use a Map for faster lookups when restoring literals
    const literalMap = new Map();
    // Process string literals (including triple-quoted strings)
    let processedCode = replaceLiterals(code, REGEX_CACHE.py.stringLiteral, literalMap, 'STR');
    // Remove single-line comments
    processedCode = processedCode.replace(REGEX_CACHE.py.singleLineComment, '');
    // Restore all literals in one pass
    return restoreLiterals(processedCode, literalMap);
}
/**
 * Removes Java/C#/C++ comments from a string.
 *
 * @param code - The source code to process.
 * @returns The code with all comments removed.
 */
export function stripCStyleComments(code) {
    // Since Java/C#/C++ use the same comment syntax as JavaScript,
    // we can reuse the JS comment stripping logic
    return stripJsComments(code);
}
/**
 * Removes Ruby comments from a string.
 *
 * @param code - The Ruby code to process.
 * @returns The code with all comments removed.
 */
export function stripRubyComments(code) {
    if (!code)
        return '';
    // Use a Map for faster lookups when restoring literals
    const literalMap = new Map();
    // Process string literals
    let processedCode = replaceLiterals(code, REGEX_CACHE.ruby.stringLiteral, literalMap, 'STR');
    // Process heredoc
    processedCode = replaceLiterals(processedCode, REGEX_CACHE.ruby.heredoc, literalMap, 'HEREDOC');
    // Remove multi-line comments
    processedCode = processedCode.replace(REGEX_CACHE.ruby.multiLineComment, '');
    // Remove single-line comments
    processedCode = processedCode.replace(REGEX_CACHE.ruby.singleLineComment, '');
    // Restore all literals in one pass
    return restoreLiterals(processedCode, literalMap);
}
/**
 * Removes PHP comments from a string.
 *
 * @param code - The PHP code to process.
 * @returns The code with all comments removed.
 */
export function stripPhpComments(code) {
    if (!code)
        return '';
    // Use a Map for faster lookups when restoring literals
    const literalMap = new Map();
    // Process string literals
    let processedCode = replaceLiterals(code, REGEX_CACHE.php.stringLiteral, literalMap, 'STR');
    // Remove multi-line comments
    processedCode = processedCode.replace(REGEX_CACHE.php.multiLineComment, '');
    // Remove single-line comments
    processedCode = processedCode.replace(REGEX_CACHE.php.singleLineComment, '');
    // Restore all literals in one pass
    return restoreLiterals(processedCode, literalMap);
}
// Cache for file extension mapping to improve performance
const FILE_TYPE_CACHE = new Map();
/**
 * Determines the appropriate comment stripping function based on file extension.
 * Uses caching for better performance.
 *
 * @param filePath - Path to the file.
 * @param code - The source code to process.
 * @returns The code with comments removed.
 */
export function stripCommentsByFileType(filePath, code) {
    if (!code)
        return '';
    const extension = filePath.split('.').pop()?.toLowerCase() || '';
    // Check if we have a cached function for this extension
    let stripFn = FILE_TYPE_CACHE.get(extension);
    if (!stripFn) {
        // Determine the appropriate function and cache it
        switch (extension) {
            case 'js':
            case 'ts':
            case 'jsx':
            case 'tsx':
            case 'java':
            case 'c':
            case 'cpp':
            case 'cs':
                stripFn = stripJsComments;
                break;
            case 'vue':
                stripFn = stripVueComments;
                break;
            case 'html':
            case 'htm':
                stripFn = stripHtmlComments;
                break;
            case 'css':
            case 'scss':
            case 'less':
                stripFn = stripCssComments;
                break;
            case 'py':
                stripFn = stripPythonComments;
                break;
            case 'rb':
                stripFn = stripRubyComments;
                break;
            case 'php':
                stripFn = stripPhpComments;
                break;
            default:
                stripFn = stripJsComments;
        }
        // Cache the function for future use
        FILE_TYPE_CACHE.set(extension, stripFn);
    }
    return stripFn(code);
}
/**
 * Main function to strip comments from code.
 *
 * @param code - The source code to process.
 * @param fileType - Optional file extension to determine comment style.
 * @returns The code with all comments removed.
 */
export function stripComments(code, fileType) {
    if (!code)
        return '';
    if (fileType) {
        // Create a fake file path to reuse the existing function
        return stripCommentsByFileType(`file.${fileType.toLowerCase()}`, code);
    }
    // Default to JS comment stripping if no file type is specified
    return stripJsComments(code);
}
