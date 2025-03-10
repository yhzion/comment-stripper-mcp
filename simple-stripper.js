import fs from 'fs';

// JavaScript 댓글 제거 함수
function stripJsComments(code) {
  if (!code) return '';

  // 문자열 리터럴과 정규식을 저장할 맵
  const literalMap = new Map();
  let placeholderId = 0;
  
  // 문자열 리터럴 처리
  const processedCode1 = code.replace(/(['`"])(?:(?!\1)[^\\]|\\[\s\S])*?\1/g, (match) => {
    const placeholder = `__STR_${placeholderId++}__`;
    literalMap.set(placeholder, match);
    return placeholder;
  });
  
  // 정규식 리터럴 처리
  const processedCode2 = processedCode1.replace(/\/(?:[^\\*\/\n]|\\[\s\S])+?\/(?:[gimuy]+)?/g, (match) => {
    const placeholder = `__REGEX_${placeholderId++}__`;
    literalMap.set(placeholder, match);
    return placeholder;
  });
  
  // 여러 줄 주석 제거
  const processedCode3 = processedCode2.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // 한 줄 주석 제거 (공백 포함)
  const processedCode4 = processedCode3.replace(/\/\/.*$/gm, '');
  
  // 문자열과 정규식 복원
  const result = processedCode4.replace(/__(?:STR|REGEX)_\d+__/g, (match) => {
    return literalMap.get(match) || match;
  });
  
  // 라인 끝 공백 제거 및 여러 빈 줄 정리
  return result
    .replace(/[ \t]+$/gm, '') // 라인 끝 공백 제거
    .replace(/\n\s*\n+/g, '\n\n') // 연속된 빈 줄을 하나로
    .trim(); // 시작과 끝의 공백 제거
}

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
