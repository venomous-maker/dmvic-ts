/**
 * # dmvic-ts
 *
 * TypeScript client for the Kenya **Digital Motor Vehicle Insurance Certificate** (DMVIC) API.
 *
 * Issue, validate, cancel, and manage motor vehicle insurance certificates
 * with X.509 mutual-TLS authentication, automatic token caching, and
 * typed request / response interfaces.
 *
 * @packageDocumentation
 */

// Main client
export { DmvicClient } from './client';
export type { IDmvicClient } from './client';

// Types
export * from './types';

// Constants
export * from './constants';

// Utilities
export * from './utils';

// Errors
export { DmvicError } from './errors';
export type { ErrorType } from './errors';

// Cache (for advanced usage)
export { TTLCache, FileTTLCache } from './cache';
export type { TokenStorage, FileTTLCacheConfig } from './cache';

// Factory function for creating a client
import { DmvicClient } from './client';
import { DmvicConfig } from './types';

/**
 * Creates a new DMVIC client instance
 * @param config - Configuration for the DMVIC client
 * @returns A new DmvicClient instance
 */
export function createDmvicClient(config: DmvicConfig): DmvicClient {
  return new DmvicClient(config);
}

/**
 * Default export for convenience
 */
export default DmvicClient;
