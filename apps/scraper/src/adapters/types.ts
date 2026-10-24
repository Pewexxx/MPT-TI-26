import type { Offer, Store } from '@promo/shared';

/**
 * One adapter per store. Each adapter knows how to fetch and parse that store's
 * promotions page(s) and returns offers in the shared, normalized shape.
 * When a store changes its website, only its adapter needs fixing.
 */
export interface StoreAdapter {
  store: Store;
  fetchOffers(): Promise<Offer[]>;
}
