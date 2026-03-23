import type { AssetMeta, Timeframe } from '@/shared/types';

export const TRACKED_ASSETS: AssetMeta[] = [
  {
    id: 'BTC-USD',
    productId: 'BTC-USD',
    symbol: 'BTC',
    name: 'Bitcoin',
    description: 'Digital reserve asset with macro-grade liquidity.',
    accent: 'from-amber-400 via-orange-400 to-yellow-300',
    circulatingSupply: 19_840_000,
    quantityPrecision: 8,
  },
  {
    id: 'ETH-USD',
    productId: 'ETH-USD',
    symbol: 'ETH',
    name: 'Ethereum',
    description: 'Programmable settlement layer for on-chain finance.',
    accent: 'from-indigo-400 via-violet-400 to-sky-300',
    circulatingSupply: 120_450_000,
    quantityPrecision: 6,
  },
  {
    id: 'SOL-USD',
    productId: 'SOL-USD',
    symbol: 'SOL',
    name: 'Solana',
    description: 'High-throughput smart contract network for consumer apps.',
    accent: 'from-emerald-400 via-teal-400 to-cyan-300',
    circulatingSupply: 475_000_000,
    quantityPrecision: 4,
  },
  {
    id: 'LINK-USD',
    productId: 'LINK-USD',
    symbol: 'LINK',
    name: 'Chainlink',
    description: 'Oracle network powering verified off-chain market data.',
    accent: 'from-blue-400 via-cyan-400 to-slate-200',
    circulatingSupply: 608_000_000,
    quantityPrecision: 3,
  },
  {
    id: 'AVAX-USD',
    productId: 'AVAX-USD',
    symbol: 'AVAX',
    name: 'Avalanche',
    description: 'Institutional-grade app chains and asset issuance network.',
    accent: 'from-rose-400 via-red-400 to-orange-300',
    circulatingSupply: 416_000_000,
    quantityPrecision: 3,
  },
];

export const DEFAULT_ASSET_ID = 'BTC-USD';

export const TIMEFRAME_OPTIONS: { label: Timeframe; seconds: number; granularity: number }[] = [
  { label: '1H', seconds: 60 * 60, granularity: 60 },
  { label: '24H', seconds: 24 * 60 * 60, granularity: 300 },
  { label: '7D', seconds: 7 * 24 * 60 * 60, granularity: 3600 },
  { label: '30D', seconds: 30 * 24 * 60 * 60, granularity: 21600 },
  { label: '1Y', seconds: 365 * 24 * 60 * 60, granularity: 86400 },
];

export const ASSET_LOOKUP = Object.fromEntries(
  TRACKED_ASSETS.map((asset) => [asset.id, asset]),
) as Record<string, AssetMeta>;
