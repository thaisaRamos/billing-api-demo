import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRecurringBilling } from '@/lib/hitpay';
import type { RecurringBillingRequest } from '@/lib/hitpay';

const mockResponse = {
  id: 'abc-123',
  status: 'scheduled',
  currency: 'sgd',
  amount: 9,
  payment_methods: ['shopee_pay'],
  direct_link: {
    direct_link_url: 'https://hitpay.example.com/link/abc',
    direct_link_app_url: null,
    expiry_time: null,
  },
};

const baseRequest: RecurringBillingRequest = {
  customer_email: 'test@example.com',
  customer_name: 'John Doe',
  amount: '9.00',
  currency: 'SGD',
  name: 'Pro Plan',
  payment_method: 'shopee_pay',
  generate_param: 'generate_direct_link',
  redirect_url: 'https://example.com/success',
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('createRecurringBilling', () => {
  it('calls the sandbox URL by default', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    );

    await createRecurringBilling(baseRequest, 'test-api-key');

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.sandbox.hit-pay.com/v1/recurring-billing',
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('calls the production URL when specified', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    );

    await createRecurringBilling(baseRequest, 'test-api-key', 'production');

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.hit-pay.com/v1/recurring-billing',
      expect.anything()
    );
  });

  it('sets X-BUSINESS-API-KEY header', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    );

    await createRecurringBilling(baseRequest, 'my-secret-key');

    const [, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const headers = options.headers as Record<string, string>;
    expect(headers['X-BUSINESS-API-KEY']).toBe('my-secret-key');
  });

  it('includes payment_methods[] in request body', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    );

    await createRecurringBilling(baseRequest, 'test-api-key');

    const [, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = options.body as string;
    expect(body).toContain('payment_methods%5B%5D=shopee_pay');
  });

  it('includes the generate param set to 1', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    );

    await createRecurringBilling(baseRequest, 'test-api-key');

    const [, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = options.body as string;
    expect(body).toContain('generate_direct_link=1');
  });

  it('throws an error when the API returns non-200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Invalid API key' }), { status: 401 })
    );

    await expect(
      createRecurringBilling(baseRequest, 'bad-key')
    ).rejects.toThrow('Invalid API key');
  });

  it('returns the parsed response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    );

    const result = await createRecurringBilling(baseRequest, 'test-api-key');

    expect(result.id).toBe('abc-123');
    expect(result.direct_link?.direct_link_url).toBe('https://hitpay.example.com/link/abc');
  });
});
