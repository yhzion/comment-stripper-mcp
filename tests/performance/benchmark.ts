/**
 * Performance benchmark for comment stripping functionality
 */

import fs from 'fs';
import path from 'path';
import { stripJsComments, stripPythonComments, stripCommentsByFileType } from '../../src/utils/commentStripper.js';

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
 * Runs a benchmark test for a specific function
 * @param name - Name of the benchmark
 * @param fn - Function to benchmark
 * @param input - Input to pass to the function
 * @param iterations - Number of iterations to run
 */
async function runBenchmark(name: string, fn: (input: string) => string, input: string, iterations: number = 5): Promise<void> {
  console.log(`\nRunning benchmark: ${name}`);
  console.log(`Input size: ${Math.round(input.length / 1024)} KB`);
  
  const times: number[] = [];
  
  // Warm-up run
  fn(input);
  
  // Timed runs
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn(input);
    const end = performance.now();
    const timeMs = end - start;
    times.push(timeMs);
    console.log(`  Run ${i + 1}: ${timeMs.toFixed(2)} ms`);
  }
  
  // Calculate statistics
  const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  
  console.log(`  Average: ${avg.toFixed(2)} ms`);
  console.log(`  Min: ${min.toFixed(2)} ms`);
  console.log(`  Max: ${max.toFixed(2)} ms`);
}

/**
 * Main benchmark function
 */
async function main(): Promise<void> {
  console.log('Comment Stripper Performance Benchmark');
  console.log('====================================');
  
  // Test with different file sizes
  const sizes = [100, 500, 1000]; // KB
  
  for (const size of sizes) {
    // JavaScript benchmarks
    const jsCode = generateLargeJsFile(size);
    await runBenchmark(`JavaScript (${size} KB)`, stripJsComments, jsCode);
    
    // Python benchmarks
    const pyCode = generateLargePythonFile(size);
    await runBenchmark(`Python (${size} KB)`, stripPythonComments, pyCode);
  }
  
  console.log('\nBenchmark completed!');
}

// Run the benchmark
main().catch(error => {
  console.error('Benchmark failed:', error);
  process.exit(1);
});
