import type { StoreAdapter } from './types.js';

export const lidlAdapter: StoreAdapter = {
  store: 'lidl',
  async fetchOffers() {
    // TODO: fetch the Lidl promotions page, parse with cheerio (or Playwright if the page
    // is rendered client-side), and map each product to the Offer schema.
    return [];
  },
};
