import { describe, it, expect } from 'vitest';
import {
  SDKError,
  ApiError,
  ValidationError,
  NetworkError,
  ConfigurationError,
  VerificationError,
  AuthenticationError
} from '../errors.js';

describe('error classes', () => {
  it('SDKError carries code and toJSON', () => {
    const e = new SDKError('m', 'C', { a: 1 });
    expect(e.code).toBe('C');
    expect(e.toJSON().message).toBe('m');
  });

  it('ApiError classifies from response', () => {
    const e = ApiError.fromResponse(
      { status: 500 },
      { error: { message: 'n', code: 'X' } }
    );
    expect(e.isServerError).toBe(true);
  });

  it('ApiError surfaces x402 PAYMENT-REQUIRED on 402', () => {
    const e = ApiError.fromResponse(
      {
        status: 402,
        headers: { get: (name) => (String(name).toLowerCase() === 'payment-required' ? 'e2x402' : null) }
      },
      { error: { message: 'Payment required' } }
    );
    expect(e.statusCode).toBe(402);
    expect(e.code).toBe('PAYMENT_REQUIRED');
    expect(e.isPaymentRequired).toBe(true);
    expect(e.paymentRequired).toBe('e2x402');
  });

  it('constructors are distinct', () => {
    expect(new ValidationError('v')).toBeInstanceOf(ValidationError);
    expect(new NetworkError('n')).toBeInstanceOf(NetworkError);
    expect(new ConfigurationError('c')).toBeInstanceOf(ConfigurationError);
    expect(new VerificationError('f')).toBeInstanceOf(VerificationError);
    expect(new AuthenticationError('a')).toBeInstanceOf(AuthenticationError);
  });
});
