/**
 * Unit tests for the authentication functionality
 */

import { validateApiKey, authMiddleware } from '../../src/utils/auth.js';
import { config } from '../../src/utils/config.js';
import { ValidationError } from '../../src/utils/errorHandler.js';

// Mock the config module
jest.mock('../../src/utils/config.js', () => ({
  config: {
    AUTH_ENABLED: true,
    API_KEYS: 'test-key-1,test-key-2',
    AUTH_RATE_LIMIT: 100
  }
}));

// Mock the logger module
jest.mock('../../src/utils/logger.js', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    info: jest.fn()
  }
}));

describe('Authentication', () => {
  describe('validateApiKey', () => {
    test('should return authenticated=true when auth is disabled', () => {
      // Override the mock for this test
      Object.defineProperty(config, 'AUTH_ENABLED', { value: false });
      
      const result = validateApiKey('any-key');
      
      expect(result.authenticated).toBe(true);
      expect(result.message).toBeUndefined();
      
      // Reset the mock
      Object.defineProperty(config, 'AUTH_ENABLED', { value: true });
    });
    
    test('should return authenticated=false when no API key is provided', () => {
      const result = validateApiKey('');
      
      expect(result.authenticated).toBe(false);
      expect(result.message).toBe('API key is required');
    });
    
    test('should return authenticated=false when an invalid API key is provided', () => {
      const result = validateApiKey('invalid-key');
      
      expect(result.authenticated).toBe(false);
      expect(result.message).toBe('Invalid API key');
    });
    
    test('should return authenticated=true when a valid API key is provided', () => {
      const result = validateApiKey('test-key-1');
      
      expect(result.authenticated).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.id).toBe('user-1');
      expect(result.user?.role).toBe('user');
    });
  });
  
  describe('authMiddleware', () => {
    test('should pass through params when auth is disabled', () => {
      // Override the mock for this test
      Object.defineProperty(config, 'AUTH_ENABLED', { value: false });
      
      const params = { test: 'value' };
      const headers = {};
      
      const result = authMiddleware(params, headers);
      
      expect(result).toBe(params);
      
      // Reset the mock
      Object.defineProperty(config, 'AUTH_ENABLED', { value: true });
    });
    
    test('should throw ValidationError when no API key is provided', () => {
      const params = { test: 'value' };
      const headers = {};
      
      expect(() => authMiddleware(params, headers)).toThrow(ValidationError);
      expect(() => authMiddleware(params, headers)).toThrow('API key is required');
    });
    
    test('should throw ValidationError when an invalid API key is provided', () => {
      const params = { test: 'value' };
      const headers = { 'x-api-key': 'invalid-key' };
      
      expect(() => authMiddleware(params, headers)).toThrow(ValidationError);
      expect(() => authMiddleware(params, headers)).toThrow('Invalid API key');
    });
    
    test('should return params when a valid API key is provided in x-api-key header', () => {
      const params = { test: 'value' };
      const headers = { 'x-api-key': 'test-key-1' };
      
      const result = authMiddleware(params, headers);
      
      expect(result).toBe(params);
    });
    
    test('should return params when a valid API key is provided in authorization header', () => {
      const params = { test: 'value' };
      const headers = { 'authorization': 'Bearer test-key-2' };
      
      const result = authMiddleware(params, headers);
      
      expect(result).toBe(params);
    });
  });
});
