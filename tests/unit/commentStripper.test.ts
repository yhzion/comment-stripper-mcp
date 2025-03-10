/**
 * Unit tests for the comment stripping functionality
 */

import { 
  stripJsComments, 
  stripVueComments, 
  stripComments, 
  stripHtmlComments, 
  stripCssComments,
  stripPythonComments,
  stripCStyleComments
} from '../../src/utils/commentStripper.js';

describe('Comment Stripper', () => {
  describe('JavaScript Comments', () => {
    test('should remove single-line comments', () => {
      const input = '// This is a comment\nconst x = 10;';
      const expected = '\nconst x = 10;';
      const result = stripJsComments(input);
      expect(result).toBe(expected);
    });

    test('should remove multi-line comments', () => {
      const input = '/* This is a\nmulti-line comment */\nconst x = 10;';
      const expected = '\nconst x = 10;';
      const result = stripJsComments(input);
      expect(result).toBe(expected);
    });

    test('should remove inline comments', () => {
      const input = 'const x = 10; // inline comment';
      const expected = 'const x = 10; ';
      const result = stripJsComments(input);
      expect(result).toBe(expected);
    });

    test('should not remove comments in string literals', () => {
      const input = 'const str = "This is not a // comment";';
      const expected = 'const str = "This is not a // comment";';
      const result = stripJsComments(input);
      expect(result).toBe(expected);
    });

    test('should handle complex cases with nested comments and strings', () => {
      const input = 'const x = 10; /* comment with "quotes" */ const y = "string with /* comment */";';
      const expected = 'const x = 10;  const y = "string with /* comment */";';
      const result = stripJsComments(input);
      expect(result).toBe(expected);
    });
  });

  describe('Vue Comments', () => {
    test('should remove HTML comments in Vue templates', () => {
      const input = '<template>\n  <!-- This is a comment -->\n  <div>Hello</div>\n</template>';
      const expected = '<template>\n  \n  <div>Hello</div>\n</template>';
      const result = stripVueComments(input);
      expect(result).toBe(expected);
    });

    test('should remove JS comments in Vue script sections', () => {
      const input = '<script>\n// This is a comment\nconst x = 10;\n</script>';
      const expected = '<script>\n\nconst x = 10;\n</script>';
      const result = stripVueComments(input);
      expect(result).toBe(expected);
    });
  });

  describe('HTML Comments', () => {
    test('should remove HTML comments', () => {
      const input = '<!DOCTYPE html>\n<html>\n  <!-- This is a comment -->\n  <body>\n    <h1>Hello World</h1>\n  </body>\n</html>';
      const expected = '<!DOCTYPE html>\n<html>\n  \n  <body>\n    <h1>Hello World</h1>\n  </body>\n</html>';
      const result = stripHtmlComments(input);
      expect(result).toBe(expected);
    });

    test('should remove multi-line HTML comments', () => {
      const input = '<!DOCTYPE html>\n<html>\n  <!-- This is a\n  multi-line\n  comment -->\n  <body>\n    <h1>Hello World</h1>\n  </body>\n</html>';
      const expected = '<!DOCTYPE html>\n<html>\n  \n  <body>\n    <h1>Hello World</h1>\n  </body>\n</html>';
      const result = stripHtmlComments(input);
      expect(result).toBe(expected);
    });
  });

  describe('CSS Comments', () => {
    test('should remove CSS comments', () => {
      const input = 'body {\n  /* This is a comment */\n  color: red;\n}';
      const expected = 'body {\n  \n  color: red;\n}';
      const result = stripCssComments(input);
      expect(result).toBe(expected);
    });

    test('should remove multi-line CSS comments', () => {
      const input = 'body {\n  /* This is a\n  multi-line\n  comment */\n  color: red;\n}';
      const expected = 'body {\n  \n  color: red;\n}';
      const result = stripCssComments(input);
      expect(result).toBe(expected);
    });
  });

  describe('Python Comments', () => {
    test('should remove single-line comments', () => {
      const input = '# This is a comment\nx = 10';
      const expected = '\nx = 10';
      const result = stripPythonComments(input);
      expect(result).toBe(expected);
    });

    test('should remove inline comments', () => {
      const input = 'x = 10  # inline comment';
      const expected = 'x = 10  ';
      const result = stripPythonComments(input);
      expect(result).toBe(expected);
    });

    test('should not remove comments in string literals', () => {
      const input = 'str = "This is not a # comment"';
      const expected = 'str = "This is not a # comment"';
      const result = stripPythonComments(input);
      expect(result).toBe(expected);
    });

    test('should handle triple-quoted strings', () => {
      const input = 'str = """This is a triple-quoted string with # not a comment"""\n# This is a real comment';
      const expected = 'str = """This is a triple-quoted string with # not a comment"""\n';
      const result = stripPythonComments(input);
      expect(result).toBe(expected);
    });
  });

  describe('C-Style Comments', () => {
    test('should remove single-line comments', () => {
      const input = '// This is a comment\nint x = 10;';
      const expected = '\nint x = 10;';
      const result = stripCStyleComments(input);
      expect(result).toBe(expected);
    });

    test('should remove multi-line comments', () => {
      const input = '/* This is a\nmulti-line comment */\nint x = 10;';
      const expected = '\nint x = 10;';
      const result = stripCStyleComments(input);
      expect(result).toBe(expected);
    });

    test('should not remove comments in string literals', () => {
      const input = 'String str = "This is not a // comment";';
      const expected = 'String str = "This is not a // comment";';
      const result = stripCStyleComments(input);
      expect(result).toBe(expected);
    });
  });

  describe('Generic Comment Stripping', () => {
    test('should strip comments based on file type', () => {
      const jsCode = '// JS comment\nconst x = 10;';
      const vueCode = '<template><!-- Vue comment --></template>';
      const htmlCode = '<!-- HTML comment --><div>Hello</div>';
      const cssCode = '/* CSS comment */ body { color: red; }';
      const pythonCode = '# Python comment\nx = 10';
      const cCode = '// C comment\nint x = 10;';
      
      expect(stripComments(jsCode, 'js')).toBe('\nconst x = 10;');
      expect(stripComments(vueCode, 'vue')).toBe('<template></template>');
      expect(stripComments(htmlCode, 'html')).toBe('<div>Hello</div>');
      expect(stripComments(cssCode, 'css')).toBe(' body { color: red; }');
      expect(stripComments(pythonCode, 'py')).toBe('\nx = 10');
      expect(stripComments(cCode, 'c')).toBe('\nint x = 10;');
    });

    test('should handle empty input', () => {
      expect(stripComments('')).toBe('');
    });
  });
}); 