import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ErrorDisplay from '../components/ErrorDisplay';
import Header from '../components/Header';
import PriceCard from '../components/PriceCard';
import { Metal } from '../types';

describe('<PriceCard />', () => {
  const base = { metal: Metal.Gold, price: 2345.678, currency: 'USD', unit: 'per troy ounce', change: 1.234 };

  it('formats the price as currency with two decimals', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');
    render(<PriceCard data={base} />);
    expect(screen.getByText('$2,345.68')).toBeInTheDocument();
    expect(screen.getByText('per troy ounce')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Gold' })).toBeInTheDocument();
  });

  it('respects the currency code and browser locale', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('de-DE');
    render(<PriceCard data={{ ...base, currency: 'EUR', price: 1999.5 }} />);
    expect(screen.getByText(/1\.999,50\s€/)).toBeInTheDocument();
  });

  it('shows a green rounded percentage for gains', () => {
    render(<PriceCard data={base} />);
    const pct = screen.getByText('1.23%');
    expect(pct.parentElement).toHaveClass('text-green-400');
  });

  it('shows a red percentage for losses', () => {
    render(<PriceCard data={{ ...base, metal: Metal.Silver, change: -2.5 }} />);
    const pct = screen.getByText('-2.50%');
    expect(pct.parentElement).toHaveClass('text-red-400');
    expect(screen.getByRole('heading', { name: 'Silver' })).toBeInTheDocument();
  });

  it('treats a zero change as non-negative', () => {
    render(<PriceCard data={{ ...base, change: 0 }} />);
    expect(screen.getByText('0.00%').parentElement).toHaveClass('text-green-400');
  });
});

describe('<ErrorDisplay />', () => {
  it('shows the message and calls onRetry', async () => {
    const onRetry = vi.fn();
    render(<ErrorDisplay message="Quota hit" onRetry={onRetry} />);
    expect(screen.getByText('Quota hit')).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Try Again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe('<Header />', () => {
  it('triggers a refresh when clicked', async () => {
    const onRefresh = vi.fn();
    render(<Header onRefresh={onRefresh} isRefreshing={false} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Refresh prices' }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('disables the refresh button while refreshing', () => {
    render(<Header onRefresh={() => {}} isRefreshing />);
    expect(screen.getByRole('button', { name: 'Refresh prices' })).toBeDisabled();
  });
});
