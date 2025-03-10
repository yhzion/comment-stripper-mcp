/**
 * Script to run the benchmark
 */

import { execSync } from 'child_process';

try {
  console.log('Compiling TypeScript...');
  execSync('npx tsc tests/performance/benchmark.ts --esModuleInterop --target es2020 --module esnext --moduleResolution node --outDir tests/performance/dist', { stdio: 'inherit' });
  
  console.log('\nRunning benchmark...');
  execSync('node tests/performance/dist/benchmark.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Error running benchmark:', error);
  process.exit(1);
}
