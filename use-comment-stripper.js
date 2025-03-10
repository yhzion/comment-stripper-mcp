import { stripJsComments } from './build/utils/commentStripper.js';
import fs from 'fs';

const inputFile = '/Users/youngho.jeon/datamaker/comment-stripper-mcp/tests/fixtures/sample.js';
const outputFile = '/Users/youngho.jeon/datamaker/comment-stripper-mcp/tests/fixtures/sample-no-comments.js';

try {
  // 파일 읽기
  const code = fs.readFileSync(inputFile, 'utf8');
  
  // 주석 제거
  let cleanedCode = stripJsComments(code);
  
  // 추가 정리 작업 (라인 끝 공백 제거 및 여러 빈 줄 정리)
  cleanedCode = cleanedCode
    .replace(/[ \t]+$/gm, '')     // 라인 끝 공백 제거
    .replace(/\n{3,}/g, '\n\n')   // 3개 이상의 연속된 빈 줄을 2개로 줄임
    .trim();                       // 시작과 끝의 공백 제거
  
  // 결과 저장
  fs.writeFileSync(outputFile, cleanedCode);
  
  console.log(`Successfully removed comments from ${inputFile} and saved to ${outputFile}`);
} catch (error) {
  console.error('Error:', error.message);
}
