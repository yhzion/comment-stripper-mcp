import fs from 'fs';
import stripComments from 'strip-comments';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM에서 __dirname 가져오기
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);
const inputFile = args[0];
const outputFile = args[1] || inputFile.replace(/\.js$/, '-no-comments.js');

try {
  const fileContent = fs.readFileSync(inputFile, 'utf8');
  const stripped = stripComments(fileContent);
  fs.writeFileSync(outputFile, stripped);
  console.log(`Successfully stripped comments from ${inputFile} to ${outputFile}`);
} catch (error) {
  console.error('Error:', error.message);
}
