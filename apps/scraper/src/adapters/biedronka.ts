import type { StoreAdapter } from './types.js';

export const biedronkaAdapter: StoreAdapter = {
  store: 'biedronka',
  async fetchOffers() {
    // TODO: fetch the Biedronka promotions page, parse with cheerio (or Playwright if the page
    // is rendered client-side), and map each product to the Offer schema.
    return [];
  },
};
