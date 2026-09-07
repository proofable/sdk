import { describe, it, expect, beforeAll } from 'vitest';
import { ProofableClient } from '../client.js';

const LIVE = process.env.PROOFABLE_SDK_LIVE_TESTS === '1';
const API_URL = process.env.PROOFABLE_API_URL || 'https://api.proofable.me';
const TIMEOUT = 30000;

describe('Proofable SDK Integration', () => {
  let client;

  beforeAll(() => {
    client = new ProofableClient({
      apiUrl: API_URL,
      timeout: TIMEOUT,
      enableLogging: false
    });
  });

  describe('API Health Check', () => {
    it('should connect to API successfully', async () => {
      if (!LIVE) return;

      const healthy = await client.isHealthy();
      expect(healthy).toBe(true);
    }, 10000);
  });

  describe('Verifiers List', () => {
    it('should fetch available verifiers', async () => {
      if (!LIVE) return;

      const verifiers = await client.getVerifiers();

      expect(Array.isArray(verifiers)).toBe(true);
      expect(verifiers.length).toBeGreaterThan(0);

      const expectedVerifiers = [
        'ownership-basic',
        'nft-ownership',
        'token-holding'
      ];

      expectedVerifiers.forEach(verifier => {
        expect(verifiers).toContain(verifier);
      });
    }, 10000);
  });

  describe('Status Endpoint', () => {
    it('should handle non-existent proof gracefully', async () => {
      if (!LIVE) return;

      const fakeQHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

      try {
        await client.getProof(fakeQHash);
      } catch (error) {
        expect(error.name).toBe('ApiError');
        expect(error.statusCode).toBe(404);
      }
    }, 10000);
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const badClient = new ProofableClient({
        apiUrl: 'https://nonexistent.invalid',
        timeout: 1000
      });

      const healthy = await badClient.isHealthy();
      expect(healthy).toBe(false);
    });

    it('should validate inputs before API calls', async () => {
      await expect(client.getProof('')).rejects.toThrow('qHash is required');
      await expect(client.getProof(123)).rejects.toThrow('qHash is required');
      await expect(client.verify({ content: 123 })).rejects.toThrow('content is required and must be a string');
    });
  });

  describe('SDK Configuration', () => {
    it('should handle different API URL formats', () => {
      const a = new ProofableClient({ apiUrl: 'https://api.proofable.me/' });
      const b = new ProofableClient({ apiUrl: 'https://api.proofable.me' });

      expect(a.baseUrl).toBe('https://api.proofable.me');
      expect(b.baseUrl).toBe('https://api.proofable.me');
    });

    it('should enforce HTTPS for production domains', () => {
      const client = new ProofableClient({ apiUrl: 'http://api.proofable.me' });
      expect(client.baseUrl).toBe('https://api.proofable.me');
    });
  });

  describe('Basic Workflow Simulation', () => {
    it('should demonstrate typical usage pattern', async () => {
      const healthy = LIVE ? await client.isHealthy().catch(() => false) : false;
      expect(typeof healthy).toBe('boolean');

      if (healthy && LIVE) {
        const verifiers = await client.getVerifiers();
        expect(Array.isArray(verifiers)).toBe(true);
        expect(verifiers.length).toBeGreaterThan(0);
      }

      expect(typeof client.isHealthy).toBe('function');
    });
  });
});
