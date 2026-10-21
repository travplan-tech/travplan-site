/**
 * Price-on-request handling.
 *
 * Some packages are sold on enquiry rather than at a listed rate. Those carry a
 * price of 0 — `Package.price` is non-null, so 0 is the sentinel — and every
 * public surface must show "Contact for price" instead of formatting ₹0, keep
 * them out of price filters and ranges, and refuse to take a booking at that
 * price. The last part matters most: without it a zero-price package is an
 * order form for a free holiday.
 */

export const PRICE_ON_REQUEST_LABEL = "Contact for price"

/** True when a package has no listed price and must be enquired about. */
export function isPriceOnRequest(price: number | null | undefined): boolean {
    return typeof price !== "number" || !Number.isFinite(price) || price <= 0
}

/** "₹29,999", or "Contact for price" when there is no listed rate. */
export function formatPrice(
    price: number | null | undefined,
    { symbol = "₹" }: { symbol?: string } = {}
): string {
    if (isPriceOnRequest(price)) return PRICE_ON_REQUEST_LABEL
    return `${symbol}${Math.round(price as number).toLocaleString("en-IN")}`
}
