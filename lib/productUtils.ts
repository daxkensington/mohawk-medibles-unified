// Lightweight product utility functions — safe for client bundles.
// These do NOT import productData.ts and its 2MB product array.

import type { Product } from "@/lib/productData";

/** Truncate a product name to 25 chars for compact display */
export function getShortName(product: { name: string }) {
    const name = product.name;
    return name.length > 25 ? name.substring(0, 25) + "..." : name;
}

/** Decode common HTML entities in a string */
export function decodeHtmlEntitiesBasic(str: string): string {
    if (!str || !str.includes("&")) return str;
    return str
        .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
}
