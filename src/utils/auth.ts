/**
 * Authentication utilities for the comment-stripper-mcp
 * Provides API key validation and middleware for securing API endpoints
 */

import { config } from './config.js';
import { logger } from './logger.js';
import { ValidationError } from './errorHandler.js';

/**
 * Interface for authentication result
 * @typedef {Object} AuthResult
 * @property {boolean} authenticated - Whether the authentication was successful
 * @property {string} [message] - Optional error message
 * @property {Object} [user] - Optional user details
 * @property {string} user.id - User ID
 * @property {string} user.name - User name
 * @property {string} user.role - User role
 */
export interface AuthResult {
  authenticated: boolean;
  message?: string;
  user?: {
    id: string;
    name: string;
    role: string;
  };
}

/**
 * Validates an API key against the configured API keys
 * @param {string} apiKey - The API key to validate
 * @returns {AuthResult} Authentication result
 */
export function validateApiKey(apiKey: string): AuthResult {
  /**
   * If authentication is disabled, always return authenticated
   * @see config.AUTH_ENABLED
   */
  if (!config.AUTH_ENABLED) {
    return { authenticated: true };
  }
  
  /**
   * Check if API key is provided
   * @throws {AuthResult} If API key is not provided
   */
  if (!apiKey) {
    return { 
      authenticated: false, 
      message: 'API key is required' 
    };
  }
  
  /**
   * Get API keys from configuration
   * @see config.API_KEYS
   */
  const apiKeys = config.API_KEYS.split(',').map(key => key.trim());
  
  /**
   * Check if the provided API key exists in the configured keys
   * @throws {AuthResult} If API key is invalid
   */
  if (!apiKeys.includes(apiKey)) {
    logger.warn('Invalid API key attempt', { apiKey: apiKey.substring(0, 4) + '***' });
    return { 
      authenticated: false, 
      message: 'Invalid API key' 
    };
  }
  
  /**
   * For a more sophisticated implementation, you could look up user details
   * from a database or other source based on the API key
   */
  return { 
    authenticated: true,
    user: {
      id: 'user-1', // In a real implementation, this would be looked up
      name: 'API User',
      role: 'user'
    }
  };
}

/**
 * Authentication middleware for MCP server requests
 * @param {T} params - Request parameters
 * @param {Record<string, string>} headers - Request headers
 * @returns {T} Validated parameters or throws an error
 * @template T
 */
export function authMiddleware<T>(params: T, headers: Record<string, string>): T {
  /**
   * If authentication is disabled, pass through
   * @see config.AUTH_ENABLED
   */
  if (!config.AUTH_ENABLED) {
    return params;
  }
  
  /**
   * Extract API key from headers
   * @see headers['x-api-key'] or headers['authorization']
   */
  const apiKey = headers['x-api-key'] || headers['authorization']?.replace('Bearer ', '');
  
  /**
   * Validate the API key
   * @see validateApiKey
   */
  const authResult = validateApiKey(apiKey);
  
  /**
   * If not authenticated, throw an error
   * @throws {ValidationError} If authentication fails
   */
  if (!authResult.authenticated) {
    throw new ValidationError(authResult.message || 'Authentication failed');
  }
  
  /**
   * Return the original parameters if authentication succeeds
   */
  return params;
}
