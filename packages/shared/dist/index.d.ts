import { z } from 'zod';
export declare const StoreSchema: z.ZodEnum<["biedronka", "lidl"]>;
export type Store = z.infer<typeof StoreSchema>;
/** A single promotion as normalized by the scraper and served by the API. */
export declare const OfferSchema: z.ZodObject<{
    id: z.ZodString;
    store: z.ZodEnum<["biedronka", "lidl"]>;
    name: z.ZodString;
    category: z.ZodNullable<z.ZodString>;
    priceRegular: z.ZodNullable<z.ZodNumber>;
    pricePromo: z.ZodNumber;
    /** e.g. "kg", "l", "szt" — used to compute price per unit */
    unit: z.ZodNullable<z.ZodString>;
    unitQuantity: z.ZodNullable<z.ZodNumber>;
    /** Free-text conditions, e.g. "przy zakupie 2 szt.", "z aplikacją Lidl Plus" */
    conditions: z.ZodNullable<z.ZodString>;
    requiresApp: z.ZodBoolean;
    imageUrl: z.ZodNullable<z.ZodString>;
    sourceUrl: z.ZodString;
    validFrom: z.ZodString;
    validTo: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    store: "biedronka" | "lidl";
    name: string;
    category: string | null;
    priceRegular: number | null;
    pricePromo: number;
    unit: string | null;
    unitQuantity: number | null;
    conditions: string | null;
    requiresApp: boolean;
    imageUrl: string | null;
    sourceUrl: string;
    validFrom: string;
    validTo: string;
}, {
    id: string;
    store: "biedronka" | "lidl";
    name: string;
    category: string | null;
    priceRegular: number | null;
    pricePromo: number;
    unit: string | null;
    unitQuantity: number | null;
    conditions: string | null;
    requiresApp: boolean;
    imageUrl: string | null;
    sourceUrl: string;
    validFrom: string;
    validTo: string;
}>;
export type Offer = z.infer<typeof OfferSchema>;
/** Query parameters accepted by GET /api/offers. */
export declare const OfferFiltersSchema: z.ZodObject<{
    q: z.ZodOptional<z.ZodString>;
    store: z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodEnum<["biedronka", "lidl"]>, "many">, ("biedronka" | "lidl")[], unknown>>;
    category: z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], unknown>>;
    maxPrice: z.ZodOptional<z.ZodNumber>;
    minDiscount: z.ZodOptional<z.ZodNumber>;
    activeOn: z.ZodOptional<z.ZodString>;
    excludeAppOnly: z.ZodOptional<z.ZodBoolean>;
    sort: z.ZodDefault<z.ZodEnum<["discount", "price", "pricePerUnit", "validTo"]>>;
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    sort: "validTo" | "discount" | "price" | "pricePerUnit";
    page: number;
    pageSize: number;
    store?: ("biedronka" | "lidl")[] | undefined;
    category?: string[] | undefined;
    q?: string | undefined;
    maxPrice?: number | undefined;
    minDiscount?: number | undefined;
    activeOn?: string | undefined;
    excludeAppOnly?: boolean | undefined;
}, {
    sort?: "validTo" | "discount" | "price" | "pricePerUnit" | undefined;
    store?: unknown;
    category?: unknown;
    q?: string | undefined;
    maxPrice?: number | undefined;
    minDiscount?: number | undefined;
    activeOn?: string | undefined;
    excludeAppOnly?: boolean | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
}>;
export type OfferFilters = z.infer<typeof OfferFiltersSchema>;
export declare function discountPercent(o: Pick<Offer, 'priceRegular' | 'pricePromo'>): number | null;
