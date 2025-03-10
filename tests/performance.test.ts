/**
 * Performance tests for comment stripping functionality
 */

import { stripJsComments, stripPythonComments } from '../src/utils/commentStripper';

/**
 * Generates a large JavaScript file with comments for testing
 * @param size - Approximate size in KB
 * @returns A string containing JavaScript code with comments
 */
function generateLargeJsFile(size: number): string {
  const singleLineTemplate = '// This is a single line comment\nconst variable{i} = {i};\n';
  const multiLineTemplate = '/* This is a multi-line comment\n   with multiple lines\n   of text */\nfunction test{i}() {\n  return {i};\n}\n';
  const stringLiteralTemplate = 'const str{i} = "This is a string with // comment inside";\n';
  const regexLiteralTemplate = 'const regex{i} = /test{i}/g;\n';
  
  let result = '';
  let i = 0;
  
  // Generate content until we reach the approximate size
  while (result.length < size * 1024) {
    result += singleLineTemplate.replace(/{i}/g, i.toString());
    result += multiLineTemplate.replace(/{i}/g, i.toString());
    result += stringLiteralTemplate.replace(/{i}/g, i.toString());
    result += regexLiteralTemplate.replace(/{i}/g, i.toString());
    i++;
  }
  
  return result;
}

/**
 * Generates a large Python file with comments for testing
 * @param size - Approximate size in KB
 * @returns A string containing Python code with comments
 */
function generateLargePythonFile(size: number): string {
  const singleLineTemplate = '# This is a single line comment\nvariable{i} = {i}\n';
  const stringLiteralTemplate = 'str{i} = "This is a string with # comment inside"\n';
  const tripleQuoteTemplate = 'doc{i} = """This is a triple-quoted string\n# with a comment-like line\nand multiple lines\n"""\n';
  
  let result = '';
  let i = 0;
  
  // Generate content until we reach the approximate size
  while (result.length < size * 1024) {
    result += singleLineTemplate.replace(/{i}/g, i.toString());
    result += stringLiteralTemplate.replace(/{i}/g, i.toString());
    result += tripleQuoteTemplate.replace(/{i}/g, i.toString());
    i++;
  }
  
  return result;
}

/**
 * Measures the execution time of a function
 * @param fn - Function to measure
 * @param input - Input to pass to the function
 * @returns Execution time in milliseconds
 */
function measureExecutionTime(fn: (input: string) => string, input: string): number {
  const start = performance.now();
  fn(input);
  const end = performance.now();
  return end - start;
}

describe('Comment Stripper Performance', () => {
  // Increase Jest timeout for large file processing
  jest.setTimeout(30000);
  
  const sizes = [100, 500]; // KB - using smaller sizes for Jest tests
  
  // Test JavaScript comment stripping performance
  describe('JavaScript Comment Stripping', () => {
    sizes.forEach(size => {
      test(`Processes ${size}KB JavaScript file efficiently`, () => {
        const jsCode = generateLargeJsFile(size);
        
        // Warm-up run
        stripJsComments(jsCode);
        
        // Measure performance
        const executionTime = measureExecutionTime(stripJsComments, jsCode);
        
        console.log(`JavaScript (${size}KB): ${executionTime.toFixed(2)}ms`);
        
        // Basic performance assertion - this is just a sanity check
        // The actual performance improvement will be visible in the console output
        expect(executionTime).toBeLessThan(10000); // Should complete in under 10 seconds
      });
    });
  });
  
  // Test Python comment stripping performance
  describe('Python Comment Stripping', () => {
    sizes.forEach(size => {
      test(`Processes ${size}KB Python file efficiently`, () => {
        const pyCode = generateLargePythonFile(size);
        
        // Warm-up run
        stripPythonComments(pyCode);
        
        // Measure performance
        const executionTime = measureExecutionTime(stripPythonComments, pyCode);
        
        console.log(`Python (${size}KB): ${executionTime.toFixed(2)}ms`);
        
        // Basic performance assertion - this is just a sanity check
        // The actual performance improvement will be visible in the console output
        expect(executionTime).toBeLessThan(10000); // Should complete in under 10 seconds
      });
    });
  });
});
