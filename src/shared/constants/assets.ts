import type { AssetMeta, Timeframe } from '@/shared/types';

const ACCENT_OPTIONS = [
  'from-amber-400 via-orange-400 to-yellow-300',
  'from-indigo-400 via-violet-400 to-sky-300',
  'from-emerald-400 via-teal-400 to-cyan-300',
  'from-blue-400 via-cyan-400 to-slate-200',
  'from-rose-400 via-red-400 to-orange-300',
  'from-fuchsia-400 via-pink-400 to-rose-300',
  'from-cyan-400 via-sky-400 to-blue-300',
  'from-lime-400 via-emerald-400 to-teal-300',
];

const hashValue = (value: string) =>
  Array.from(value).reduce((accumulator, character) => accumulator + character.charCodeAt(0), 0);

export const getAssetAccent = (symbol: string) => ACCENT_OPTIONS[hashValue(symbol) % ACCENT_OPTIONS.length];

const getQuantityPrecision = (baseIncrement?: string) => {
  if (!baseIncrement?.includes('.')) {
    return 0;
  }

  return baseIncrement.split('.')[1].replace(/0+$/, '').length;
};

const CHART_GRADIENT_PALETTE = [
  { startColor: '#f59e0b', endColor: '#fcd34d' },
  { startColor: '#38bdf8', endColor: '#818cf8' },
  { startColor: '#2dd4bf', endColor: '#22d3ee' },
  { startColor: '#fb7185', endColor: '#f97316' },
  { startColor: '#a78bfa', endColor: '#60a5fa' },
  { startColor: '#34d399', endColor: '#67e8f9' },
  { startColor: '#f472b6', endColor: '#fb7185' },
  { startColor: '#4ade80', endColor: '#2dd4bf' },
] as const;

const ASSET_DESCRIPTIONS: Record<string, string> = {
  BTC: 'Digital reserve asset with macro-grade liquidity.',
  ETH: 'Programmable settlement layer for on-chain finance.',
  SOL: 'High-throughput smart contract network for consumer apps.',
  LINK: 'Oracle network powering verified off-chain market data.',
  AVAX: 'Institutional-grade app chains and asset issuance network.',
};

const TRACKED_ASSET_CATALOG = [
  { symbol: 'BTC', name: 'Bitcoin', iconUrl: 'https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png?1696501400', circulatingSupply: 20003043.0, baseIncrement: '0.00000001' },
  { symbol: 'ETH', name: 'Ethereum', iconUrl: 'https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628', circulatingSupply: 120691533.0678, baseIncrement: '0.00000001' },
  { symbol: 'USDT', name: 'Tether', iconUrl: 'https://coin-images.coingecko.com/coins/images/325/large/Tether.png?1696501661', circulatingSupply: 184216554250.0974, baseIncrement: '0.01' },
  { symbol: 'BNB', name: 'BNB', iconUrl: 'https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1696501970', circulatingSupply: 136357346.0799999, baseIncrement: '0.00001' },
  { symbol: 'XRP', name: 'XRP', iconUrl: 'https://coin-images.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png?1696501442', circulatingSupply: 61344583754.0, baseIncrement: '0.000001' },
  { symbol: 'SOL', name: 'Solana', iconUrl: 'https://coin-images.coingecko.com/coins/images/4128/large/solana.png?1718769756', circulatingSupply: 572255809.3441771, baseIncrement: '0.00000001' },
  { symbol: 'DOGE', name: 'Dogecoin', iconUrl: 'https://coin-images.coingecko.com/coins/images/5/large/dogecoin.png?1696501409', circulatingSupply: 153575326383.7052, baseIncrement: '0.1' },
  { symbol: 'USDS', name: 'USDS', iconUrl: 'https://coin-images.coingecko.com/coins/images/39926/large/usds.webp?1726666683', circulatingSupply: 11504595407.90336, baseIncrement: '0.01' },
  { symbol: 'ADA', name: 'Cardano', iconUrl: 'https://coin-images.coingecko.com/coins/images/975/large/cardano.png?1696502090', circulatingSupply: 36853689191.83881, baseIncrement: '0.00000001' },
  { symbol: 'HYPE', name: 'Hyperliquid', iconUrl: 'https://coin-images.coingecko.com/coins/images/50882/large/hyperliquid.jpg?1729431300', circulatingSupply: 238385315.9541414, baseIncrement: '0.001' },
  { symbol: 'BCH', name: 'Bitcoin Cash', iconUrl: 'https://coin-images.coingecko.com/coins/images/780/large/bitcoin-cash-circle.png?1696501932', circulatingSupply: 20012674.89665078, baseIncrement: '0.00000001' },
  { symbol: 'LINK', name: 'Chainlink', iconUrl: 'https://coin-images.coingecko.com/coins/images/877/large/Chainlink_Logo_500.png?1760023405', circulatingSupply: 708099970.4525567, baseIncrement: '0.01' },
  { symbol: 'XLM', name: 'Stellar', iconUrl: 'https://coin-images.coingecko.com/coins/images/100/large/fmpFRHHQ_400x400.jpg?1735231350', circulatingSupply: 33035212386.94344, baseIncrement: '0.00000001' },
  { symbol: 'USD1', name: 'USD1', iconUrl: 'https://coin-images.coingecko.com/coins/images/54977/large/USD1_1000x1000_transparent.png?1749297002', circulatingSupply: 4417156686.634472, baseIncrement: '0.01' },
  { symbol: 'DAI', name: 'Dai', iconUrl: 'https://coin-images.coingecko.com/coins/images/9956/large/Badge_Dai.png?1696509996', circulatingSupply: 4300133083.870079, baseIncrement: '0.00001' },
  { symbol: 'LTC', name: 'Litecoin', iconUrl: 'https://coin-images.coingecko.com/coins/images/2/large/litecoin.png?1696501400', circulatingSupply: 76988051.98347135, baseIncrement: '0.00000001' },
  { symbol: 'HBAR', name: 'Hedera', iconUrl: 'https://coin-images.coingecko.com/coins/images/3688/large/hbar.png?1696504364', circulatingSupply: 43303446052.32751, baseIncrement: '0.1' },
  { symbol: 'AVAX', name: 'Avalanche', iconUrl: 'https://coin-images.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png?1696512369', circulatingSupply: 431771961.1772119, baseIncrement: '0.00000001' },
  { symbol: 'ZEC', name: 'Zcash', iconUrl: 'https://coin-images.coingecko.com/coins/images/486/large/circle-zcash-color.png?1696501740', circulatingSupply: 16623118.9155448, baseIncrement: '0.00000001' },
  { symbol: 'SUI', name: 'Sui', iconUrl: 'https://coin-images.coingecko.com/coins/images/26375/large/sui-ocean-square.png?1727791290', circulatingSupply: 3899984688.415443, baseIncrement: '0.1' },
  { symbol: 'SHIB', name: 'Shiba Inu', iconUrl: 'https://coin-images.coingecko.com/coins/images/11939/large/shiba.png?1696511800', circulatingSupply: 589243607175545.1, baseIncrement: '1' },
  { symbol: 'TAO', name: 'Bittensor', iconUrl: 'https://coin-images.coingecko.com/coins/images/28452/large/ARUsPeNQ_400x400.jpeg?1696527447', circulatingSupply: 9597491.0, baseIncrement: '0.0001' },
  { symbol: 'CRO', name: 'Cronos', iconUrl: 'https://coin-images.coingecko.com/coins/images/7310/large/cro_token_logo.png?1696507599', circulatingSupply: 42302412289.62806, baseIncrement: '0.1' },
  { symbol: 'TON', name: 'Toncoin', iconUrl: 'https://coin-images.coingecko.com/coins/images/17980/large/photo_2024-09-10_17.09.00.jpeg?1725963446', circulatingSupply: 2462100226.614423, baseIncrement: '0.01' },
  { symbol: 'WLFI', name: 'World Liberty Financial', iconUrl: 'https://coin-images.coingecko.com/coins/images/50767/large/wlfi.png?1756438915', circulatingSupply: 28762171740.0, baseIncrement: '0.1' },
  { symbol: 'PAXG', name: 'PAX Gold', iconUrl: 'https://coin-images.coingecko.com/coins/images/9519/large/paxgold.png?1696509604', circulatingSupply: 514128.803, baseIncrement: '0.00001' },
  { symbol: 'UNI', name: 'Uniswap', iconUrl: 'https://coin-images.coingecko.com/coins/images/12504/large/uniswap-logo.png?1720676669', circulatingSupply: 633561603.6037512, baseIncrement: '0.000001' },
  { symbol: 'DOT', name: 'Polkadot', iconUrl: 'https://coin-images.coingecko.com/coins/images/12171/large/polkadot.jpg?1766533446', circulatingSupply: 1676281349.611407, baseIncrement: '0.00000001' },
  { symbol: 'ASTER', name: 'Aster', iconUrl: 'https://coin-images.coingecko.com/coins/images/69040/large/_ASTER.png?1757326782', circulatingSupply: 2456309719.12999, baseIncrement: '0.01' },
  { symbol: 'SKY', name: 'Sky', iconUrl: 'https://coin-images.coingecko.com/coins/images/39925/large/sky.jpg?1724827980', circulatingSupply: 23100590441.367214, baseIncrement: '0.1' },
  { symbol: 'AAVE', name: 'Aave', iconUrl: 'https://coin-images.coingecko.com/coins/images/12645/large/aave-token-round.png?1720472354', circulatingSupply: 15185312.660629598, baseIncrement: '0.001' },
  { symbol: 'NEAR', name: 'NEAR Protocol', iconUrl: 'https://coin-images.coingecko.com/coins/images/10365/large/near.jpg?1696510367', circulatingSupply: 1291221686.0, baseIncrement: '0.001' },
  { symbol: 'PEPE', name: 'Pepe', iconUrl: 'https://coin-images.coingecko.com/coins/images/29850/large/pepe-token.jpeg?1696528776', circulatingSupply: 420690000000000.0, baseIncrement: '1' },
  { symbol: 'ONDO', name: 'Ondo', iconUrl: 'https://coin-images.coingecko.com/coins/images/26580/large/ONDO.png?1696525656', circulatingSupply: 4869330647.0, baseIncrement: '0.01' },
  { symbol: 'ETC', name: 'Ethereum Classic', iconUrl: 'https://coin-images.coingecko.com/coins/images/453/large/ethereum-classic-logo.png?1696501717', circulatingSupply: 156054762.4219438, baseIncrement: '0.00000001' },
  { symbol: 'ICP', name: 'Internet Computer', iconUrl: 'https://coin-images.coingecko.com/coins/images/14495/large/Internet_Computer_logo.png?1696514180', circulatingSupply: 550617661.7940055, baseIncrement: '0.0001' },
  { symbol: 'QNT', name: 'Quant', iconUrl: 'https://coin-images.coingecko.com/coins/images/3370/large/5ZOu7brX_400x400.jpg?1696504070', circulatingSupply: 14544176.164081175, baseIncrement: '0.001' },
  { symbol: 'PUMP', name: 'Pump.fun', iconUrl: 'https://coin-images.coingecko.com/coins/images/67164/large/pump.jpg?1751949376', circulatingSupply: 590000000000.0, baseIncrement: '1' },
  { symbol: 'POL', name: 'POL (ex-MATIC)', iconUrl: 'https://coin-images.coingecko.com/coins/images/32440/large/pol.png?1759114181', circulatingSupply: 10614588918.11222, baseIncrement: '0.01' },
  { symbol: 'RENDER', name: 'Render', iconUrl: 'https://coin-images.coingecko.com/coins/images/11636/large/rndr.png?1696511529', circulatingSupply: 518743261.0140742, baseIncrement: '0.01' },
  { symbol: 'WLD', name: 'Worldcoin', iconUrl: 'https://coin-images.coingecko.com/coins/images/31069/large/worldcoin.jpeg?1696529903', circulatingSupply: 3104479187.847239, baseIncrement: '0.01' },
  { symbol: 'MORPHO', name: 'Morpho', iconUrl: 'https://coin-images.coingecko.com/coins/images/29837/large/Morpho-token-icon.png?1726771230', circulatingSupply: 551318984.0706614, baseIncrement: '0.01' },
  { symbol: 'ATOM', name: 'Cosmos Hub', iconUrl: 'https://coin-images.coingecko.com/coins/images/1481/large/cosmos_hub.png?1696502525', circulatingSupply: 500121407.178474, baseIncrement: '0.01' },
  { symbol: 'APT', name: 'Aptos', iconUrl: 'https://coin-images.coingecko.com/coins/images/26455/large/Aptos-Network-Symbol-Black-RGB-1x.png?1761789140', circulatingSupply: 793911282.6167315, baseIncrement: '0.001' },
  { symbol: 'ENA', name: 'Ethena', iconUrl: 'https://coin-images.coingecko.com/coins/images/36530/large/ethena.png?1711701436', circulatingSupply: 8492187500.0, baseIncrement: '0.1' },
  { symbol: 'ALGO', name: 'Algorand', iconUrl: 'https://coin-images.coingecko.com/coins/images/4380/large/download.png?1696504978', circulatingSupply: 8892396951.048042, baseIncrement: '0.1' },
  { symbol: 'TRUMP', name: 'Official Trump', iconUrl: 'https://coin-images.coingecko.com/coins/images/53746/large/trump.png?1737171561', circulatingSupply: 232498807.465716, baseIncrement: '0.001' },
  { symbol: 'FLR', name: 'Flare', iconUrl: 'https://coin-images.coingecko.com/coins/images/28624/large/FLR-icon200x200.png?1696527609', circulatingSupply: 85382652615.63507, baseIncrement: '1' },
  { symbol: 'FIL', name: 'Filecoin', iconUrl: 'https://coin-images.coingecko.com/coins/images/12817/large/filecoin.png?1696512609', circulatingSupply: 763627918.0, baseIncrement: '0.001' },
  { symbol: 'VET', name: 'VeChain', iconUrl: 'https://coin-images.coingecko.com/coins/images/1167/large/VET.png?1742383283', circulatingSupply: 85985041177.0, baseIncrement: '1' },
] satisfies {
  symbol: string;
  name: string;
  iconUrl: string;
  circulatingSupply: number;
  baseIncrement: string;
}[];

const createTrackedAsset = ({
  symbol,
  name,
  iconUrl,
  circulatingSupply,
  baseIncrement,
}: (typeof TRACKED_ASSET_CATALOG)[number]): AssetMeta => ({
  id: `${symbol}-USD`,
  productId: `${symbol}-USD`,
  symbol,
  name,
  description: ASSET_DESCRIPTIONS[symbol] ?? `${name} spot market traded against US dollars.`,
  accent: getAssetAccent(symbol),
  iconUrl,
  circulatingSupply,
  quantityPrecision: getQuantityPrecision(baseIncrement),
});

export const TRACKED_ASSETS: AssetMeta[] = TRACKED_ASSET_CATALOG.map(createTrackedAsset);

export const DEFAULT_ASSET_ID = 'BTC-USD';
export const DEFAULT_FAVORITE_ASSET_IDS = ['BTC-USD', 'ETH-USD', 'SOL-USD'] as const;

export const getAssetChartGradient = (symbol: string) =>
  CHART_GRADIENT_PALETTE[hashValue(symbol) % CHART_GRADIENT_PALETTE.length];

const FEATURED_ASSET_LOOKUP = Object.fromEntries(
  TRACKED_ASSETS.map((asset) => [asset.id, asset]),
) as Record<string, AssetMeta>;

export const buildAssetLookup = (assets: AssetMeta[]) =>
  Object.fromEntries(assets.map((asset) => [asset.id, asset])) as Record<string, AssetMeta>;

export const createAssetMeta = ({
  id,
  symbol,
  name,
  productId = id,
  description,
  accent,
  iconUrl,
  circulatingSupply,
  quantityPrecision = 4,
}: {
  id: string;
  symbol: string;
  name: string;
  productId?: string;
  description?: string;
  accent?: string;
  iconUrl?: string;
  circulatingSupply?: number;
  quantityPrecision?: number;
}): AssetMeta => {
  const featuredAsset = FEATURED_ASSET_LOOKUP[id];

  return {
    id,
    productId,
    symbol,
    name,
    description:
      featuredAsset?.description ?? description ?? `${name} spot market traded against US dollars.`,
    accent: featuredAsset?.accent ?? accent ?? getAssetAccent(symbol),
    iconUrl: featuredAsset?.iconUrl ?? iconUrl,
    circulatingSupply: featuredAsset?.circulatingSupply ?? circulatingSupply,
    quantityPrecision: featuredAsset?.quantityPrecision ?? quantityPrecision,
  };
};

export const getFallbackAssetMeta = (assetId: string) => {
  const featuredAsset = FEATURED_ASSET_LOOKUP[assetId];
  if (featuredAsset) {
    return featuredAsset;
  }

  const symbol = assetId.replace(/-USD$/i, '');

  return createAssetMeta({
    id: assetId,
    productId: assetId,
    symbol,
    name: symbol,
  });
};

export const TIMEFRAME_OPTIONS: { label: Timeframe; seconds: number; granularity: number }[] = [
  { label: '1H', seconds: 60 * 60, granularity: 60 },
  { label: '24H', seconds: 24 * 60 * 60, granularity: 300 },
  { label: '7D', seconds: 7 * 24 * 60 * 60, granularity: 3600 },
  { label: '30D', seconds: 30 * 24 * 60 * 60, granularity: 21600 },
  { label: '1Y', seconds: 365 * 24 * 60 * 60, granularity: 86400 },
];

export const ASSET_LOOKUP = buildAssetLookup(TRACKED_ASSETS);
