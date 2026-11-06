import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const fetchPrices = vi.hoisted(() => vi.fn());
vi.mock('../services/geminiService', () => ({ fetchPrices }));

import App from '../App';

const prices = [
  { metal: 'Gold', price: 2000, currency: 'USD', unit: 'per troy ounce', change: 1 },
  { metal: 'Silver', price: 25, currency: 'USD', unit: 'per troy ounce', change: -1 },
];

beforeEach(() => {
  fetchPrices.mockReset();
});
afterEach(() => vi.useRealTimers());

describe('<App />', () => {
  it('renders a card per metal once prices load, and marks the feed live', async () => {
    fetchPrices.mockResolvedValue(prices);
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Gold' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Silver' })).toBeInTheDocument();
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('shows the error with a retry button when the first fetch fails, then recovers', async () => {
    fetchPrices.mockRejectedValueOnce(new Error('API quota exceeded.')).mockResolvedValue(prices);
    render(<App />);

    expect(await screen.findByText('API quota exceeded.')).toBeInTheDocument();
    expect(screen.getByText('Connecting...')).toBeInTheDocument();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Try Again' }));

    expect(await screen.findByRole('heading', { name: 'Gold' })).toBeInTheDocument();
    expect(screen.queryByText('API quota exceeded.')).not.toBeInTheDocument();
  });

  it('keeps showing stale prices when a background refresh fails', async () => {
    let calls = 0;
    fetchPrices.mockImplementation(async () => {
      if (calls++ === 0) return prices;
      throw new Error('boom');
    });
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole('heading', { name: 'Gold' });

    await user.click(screen.getByRole('button', { name: 'Refresh prices' }));

    await screen.findByText('Connecting...'); // footer drops "Live" while errored
    expect(screen.getByRole('heading', { name: 'Gold' })).toBeInTheDocument();
  });

  it('polls every 5 seconds and stops on unmount', async () => {
    vi.useFakeTimers();
    fetchPrices.mockResolvedValue(prices);
    const { unmount } = render(<App />);
    await act(async () => {});
    expect(fetchPrices).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(fetchPrices).toHaveBeenCalledTimes(2);

    unmount();
    await vi.advanceTimersByTimeAsync(20000);
    expect(fetchPrices).toHaveBeenCalledTimes(2);
  });
});
