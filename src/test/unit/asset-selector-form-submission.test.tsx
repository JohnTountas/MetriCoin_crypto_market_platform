import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { useAppStore } from '@/app';
import { useMarketStore } from '@/entities/market';
import { defaultPortfolioSettings, usePortfolioStore } from '@/entities/portfolio';
import { PortfolioTransactionForm } from '@/entities/portfolio/ui/PortfolioTransactionForm';
import { AlertsPanel } from '@/features/watchlist';
import { buildAssetLookup, createAssetMeta } from '@/shared/constants';
import type { AssetMeta } from '@/shared/types';

const assets: AssetMeta[] = [
  createAssetMeta({ id: 'BTC-USD', symbol: 'BTC', name: 'Bitcoin' }),
  createAssetMeta({ id: 'ETH-USD', symbol: 'ETH', name: 'Ethereum' }),
];

const assetLookup = buildAssetLookup(assets);

const selectAsset = async (assetName: string) => {
  const triggerButton = screen.getByRole('button', { name: /asset selector/i });
  await userEvent.click(triggerButton);

  const optionButton = screen.getByRole('button', { name: new RegExp(assetName, 'i') });
  await userEvent.click(optionButton);
};

describe('asset selector form submission', () => {
  beforeEach(() => {
    useMarketStore.setState({
      assets,
      assetLookup,
      assetsLoaded: true,
      snapshots: {
        'BTC-USD': {
          assetId: 'BTC-USD',
          price: 90_000,
          change24h: 1_500,
          changePercent24h: 1.7,
          volume24h: 100_000_000,
          high24h: 91_000,
          low24h: 88_000,
          open24h: 88_500,
          marketCap: undefined,
          bid: 89_999,
          ask: 90_001,
          spread: 2,
          lastUpdated: Date.now(),
          direction: 'up',
        },
        'ETH-USD': {
          assetId: 'ETH-USD',
          price: 4_000,
          change24h: 110,
          changePercent24h: 2.8,
          volume24h: 80_000_000,
          high24h: 4_050,
          low24h: 3_850,
          open24h: 3_890,
          marketCap: undefined,
          bid: 3_999,
          ask: 4_001,
          spread: 2,
          lastUpdated: Date.now(),
          direction: 'up',
        },
      },
      selectedAssetId: 'BTC-USD',
    });
    usePortfolioStore.setState({
      transactions: [],
      alerts: [],
      settings: defaultPortfolioSettings,
      editingTransactionId: undefined,
    });
    useAppStore.setState({ toasts: [] });
  });

  it('submits transactions using the asset selected in AssetSelect', async () => {
    render(<PortfolioTransactionForm />);

    await selectAsset('Ethereum');
    await userEvent.click(screen.getByRole('button', { name: /Add transaction/i }));

    expect(usePortfolioStore.getState().transactions[0]?.assetId).toBe('ETH-USD');
  });

  it('submits price alerts using the asset selected in AssetSelect', async () => {
    render(<AlertsPanel />);

    await selectAsset('Ethereum');
    await userEvent.click(screen.getByRole('button', { name: /Create trigger/i }));

    expect(usePortfolioStore.getState().alerts[0]?.assetId).toBe('ETH-USD');
  });

  it('clears the trigger form and leaves the trigger price empty', async () => {
    render(<AlertsPanel />);

    await selectAsset('Ethereum');
    await userEvent.selectOptions(screen.getByLabelText(/Direction/i), 'below');
    await userEvent.clear(screen.getByLabelText(/Trigger price/i));
    await userEvent.type(screen.getByLabelText(/Trigger price/i), '123456');
    await userEvent.type(screen.getByLabelText(/Label/i), 'Reset me');

    await userEvent.click(screen.getByRole('button', { name: /Clear form/i }));

    expect(screen.getByRole('button', { name: /asset selector/i })).toHaveTextContent('Bitcoin');
    expect(screen.getByLabelText(/Direction/i)).toHaveValue('above');
    expect((screen.getByLabelText(/Trigger price/i) as HTMLInputElement).value).toBe('');
    expect(screen.getByLabelText(/Label/i)).toHaveValue('');
  });
});
