import { beforeEach, describe, expect, it, vi } from 'vitest';

const { generateContent } = vi.hoisted(() => ({ generateContent: vi.fn() }));

vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = { generateContent };
  },
  Type: { OBJECT: 'OBJECT', STRING: 'STRING', NUMBER: 'NUMBER', ARRAY: 'ARRAY' },
}));

import { fetchPrices } from '../services/geminiService';

const gold = { metal: 'Gold', price: 2000, currency: 'USD', unit: 'per troy ounce', change: 0.5 };
const silver = { metal: 'Silver', price: 25, currency: 'USD', unit: 'per troy ounce', change: -1.2 };

beforeEach(() => {
  generateContent.mockReset();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('fetchPrices', () => {
  it('parses the JSON array from the model response', async () => {
    generateContent.mockResolvedValue({ text: JSON.stringify([gold, silver]) });
    await expect(fetchPrices()).resolves.toEqual([gold, silver]);
  });

  it('tolerates surrounding whitespace in the response text', async () => {
    generateContent.mockResolvedValue({ text: `\n  ${JSON.stringify([gold])}  \n` });
    await expect(fetchPrices()).resolves.toEqual([gold]);
  });

  it('always returns Gold before Silver', async () => {
    generateContent.mockResolvedValue({ text: JSON.stringify([silver, gold]) });
    const prices = await fetchPrices();
    expect(prices.map((p) => p.metal)).toEqual(['Gold', 'Silver']);
  });

  it('includes the browser locale in the prompt and requests a JSON schema', async () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('de-DE');
    generateContent.mockResolvedValue({ text: '[]' });
    await fetchPrices();

    const call = generateContent.mock.calls[0][0];
    expect(call.contents).toContain('"de-DE"');
    expect(call.config.responseMimeType).toBe('application/json');
    expect(call.config.responseSchema.items.required).toEqual(['metal', 'price', 'currency', 'unit', 'change']);
  });

  it.each(['429 Too Many Requests', 'RESOURCE_EXHAUSTED: quota'])(
    'maps quota error "%s" to a friendly message',
    async (message) => {
      generateContent.mockRejectedValue(new Error(message));
      await expect(fetchPrices()).rejects.toThrow('API quota exceeded');
    },
  );

  it('maps any other failure to a generic message', async () => {
    generateContent.mockRejectedValue(new Error('network down'));
    await expect(fetchPrices()).rejects.toThrow('Failed to fetch latest precious metals prices');
  });

  it('treats malformed JSON as a failed fetch', async () => {
    generateContent.mockResolvedValue({ text: '<html>oops</html>' });
    await expect(fetchPrices()).rejects.toThrow('Failed to fetch latest precious metals prices');
  });

  it('handles non-Error rejections', async () => {
    generateContent.mockRejectedValue({ status: 429, message: 'RESOURCE_EXHAUSTED' });
    await expect(fetchPrices()).rejects.toThrow('API quota exceeded');
  });
});

describe('module initialisation', () => {
  it('throws when API_KEY is not set', async () => {
    vi.resetModules();
    vi.stubEnv('API_KEY', '');
    await expect(import('../services/geminiService')).rejects.toThrow('API_KEY');
    vi.unstubAllEnvs();
  });
});
