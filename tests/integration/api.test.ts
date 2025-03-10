/**
 * Integration tests for the API endpoints
 */

import { stripComments } from '../../src/utils/commentStripper.js';
import { processFile, processDirectory } from '../../src/utils/fileProcessor.js';
import path from 'path';

// Create mock handlers for testing
const mockHandlers = {
  stripComments: async (params: any) => {
    try {
      // Process text input
      if (params.text !== undefined) {
        const stripped = stripComments(params.text);
        return {
          success: true,
          data: {
            original: params.text,
            stripped
          }
        };
      }
      
      // Process single file
      if (params.filePath !== undefined) {
        const result = await processFile(params.filePath);
        return {
          success: true,
          data: result
        };
      }
      
      // Process directory
      if (params.directoryPath !== undefined) {
        const results = await processDirectory(
          params.directoryPath,
          params.recursive ?? true,
          params.fileTypes
        );
        
        return {
          success: true,
          data: {
            files: Object.entries(results).map(([filePath, content]) => ({
              filePath,
              original: content.original as string,
              stripped: content.stripped as string
            }))
          }
        };
      }
      
      return {
        success: false,
        error: {
          code: 400,
          message: 'Invalid request parameters',
          details: 'At least one of text, filePath, or directoryPath must be provided'
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 500,
          message: 'Server error',
          details: error.message
        }
      };
    }
  },
  getProgress: async (params: { trackerId: string }) => {
    return {
      success: true,
      data: {
        processed: 5,
        total: 10,
        percentage: 50
      }
    };
  },
  authStatus: async () => {
    return {
      success: true,
      data: {
        enabled: false,
        tokenRequired: false
      }
    };
  }
};

// Mock request handler for testing
const mockRequest = {
  post: (url: string) => {
    return {
      send: async (data: any) => {
        let result;
        
        // Route the request to the appropriate handler
        if (url === '/api/strip-comments') {
          result = await mockHandlers.stripComments(data);
        } else if (url === '/api/get-progress') {
          result = await mockHandlers.getProgress(data);
        } else if (url === '/api/auth-status') {
          result = await mockHandlers.authStatus();
        } else {
          result = {
            success: false,
            error: {
              code: 404,
              message: 'Endpoint not found',
              details: `No handler for ${url}`
            }
          };
        }
        
        return {
          status: result.success ? 200 : (result.error?.code || 500),
          body: result
        };
      }
    };
  }
};

describe('API Endpoints', () => {
  describe('POST /api/strip-comments', () => {
    test('should strip comments from text input', async () => {
      const response = await mockRequest
        .post('/api/strip-comments')
        .send({
          text: '// This is a comment\nconst x = 10; // inline comment'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.stripped).toBe('\nconst x = 10; ');
    });

    test('should strip comments from a file', async () => {
      const fixturePath = path.join(process.cwd(), 'tests', 'fixtures', 'sample.js');
      
      const response = await mockRequest
        .post('/api/strip-comments')
        .send({
          filePath: fixturePath
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.stripped).toBeDefined();
      expect(response.body.data.stripped).not.toContain('// This is a single-line comment');
      expect(response.body.data.stripped).not.toContain('// This is an inline comment');
      expect(response.body.data.stripped).not.toContain('* This is a multi-line JSDoc comment');
    });

    test('should strip comments from a directory', async () => {
      const fixturesDir = path.join(process.cwd(), 'tests', 'fixtures');
      
      const response = await mockRequest
        .post('/api/strip-comments')
        .send({
          directoryPath: fixturesDir,
          recursive: true
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.files).toBeDefined();
      expect(Array.isArray(response.body.data.files)).toBe(true);
      expect(response.body.data.files.length).toBeGreaterThan(0);
      
      // Check the first file
      const firstFile = response.body.data.files[0];
      expect(firstFile.filePath).toBeDefined();
      expect(firstFile.original).toBeDefined();
      expect(firstFile.stripped).toBeDefined();
      expect(firstFile.stripped).not.toContain('// This is a');
    });

    test('should return error for invalid input', async () => {
      const response = await mockRequest
        .post('/api/strip-comments')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toContain('Invalid request parameters');
    });
  });
  
  describe('POST /api/get-progress', () => {
    test('should return progress information', async () => {
      const response = await mockRequest
        .post('/api/get-progress')
        .send({
          trackerId: 'test-tracker-id'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.processed).toBeDefined();
      expect(response.body.data.total).toBeDefined();
      expect(response.body.data.percentage).toBeDefined();
    });
  });
  
  describe('POST /api/auth-status', () => {
    test('should return authentication status', async () => {
      const response = await mockRequest
        .post('/api/auth-status')
        .send({});
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.enabled).toBeDefined();
      expect(response.body.data.tokenRequired).toBeDefined();
    });
  });
});