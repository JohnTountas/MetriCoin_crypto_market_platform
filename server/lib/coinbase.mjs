const COINBASE_REST_URL = 'https://api.exchange.coinbase.com';

export const fetchSpotPrice = async (assetId) => {
  const response = await fetch(`${COINBASE_REST_URL}/products/${assetId}/ticker`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Coinbase ticker request failed for ${assetId}: ${response.status}`);
  }

  const payload = await response.json();
  const price = Number(payload.price);

  if (!Number.isFinite(price) || price <= 0) {
    throw new Error(`Coinbase returned an invalid price for ${assetId}.`);
  }

  return price;
};
