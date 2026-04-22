// Server-side price lookups are isolated here so the alert engine can stay focused on delivery logic.
// If backend alerts are firing at the wrong time, verify the provider response path in this module first.
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
