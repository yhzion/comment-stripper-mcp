import fs from 'fs';
import { stripJsComments } from './src/utils/commentStripper.js';

const inputFile = process.argv[2];
const outputFile = process.argv[3] || inputFile.replace(/\.js$/, '-no-comments.js');

try {
  const fileContent = fs.readFileSync(inputFile, 'utf8');
  const stripped = stripJsComments(fileContent);
  fs.writeFileSync(outputFile, stripped);
  console.log(`Successfully stripped comments from ${inputFile} to ${outputFile}`);
} catch (error) {
  console.error('Error:', error.message);
}
