// This is a single-line comment
const sampleVariable = 'Hello World'; // This is an inline comment

/**
 * This is a multi-line JSDoc comment
 * @param {string} name - The name parameter
 * @returns {string} A greeting message
 */
function greet(name) {
  /* This is a 
     multi-line
     block comment */
  return `Hello, ${name}!`;
}

/* Another block comment */
const result = greet('User');

// Export for testing
export { greet, result }; 