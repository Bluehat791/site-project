import type { ProductWithUrlSlug } from "./products";

const STOP_WORDS = new Set([
  "для",
  "или",
  "под",
  "при",
  "без",
  "над",
  "это",
  "все",
  "как",
]);

function tokenize(name: string): Set<string> {
  const words = name
    .toLowerCase()
    .match(/[а-яё]+/g) ?? [];
  return new Set(words.filter((w) => w.length >= 3 && !STOP_WORDS.has(w)));
}

/** Deterministic 32-bit hash, used to seed the padding shuffle. */
function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** mulberry32 PRNG — deterministic given a numeric seed. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Picks 3-4 "similar" products for a product page.
 *
 * `category` is currently a placeholder value shared by every product in
 * ProductList.json (see CLAUDE.md), so it carries no signal and isn't used
 * here. Ranking is by keyword overlap in the product name (desc), then by
 * price closeness (asc). If there aren't enough scored candidates, the rest
 * are padded with a deterministic pseudo-random pick seeded from the current
 * product's id, so the fill is stable across rebuilds instead of reshuffling
 * on every build.
 */
export function getSimilarProducts(
  current: ProductWithUrlSlug,
  allProducts: ProductWithUrlSlug[],
  count = 4,
): ProductWithUrlSlug[] {
  const currentTokens = tokenize(current.name);
  const candidates = allProducts.filter((p) => p.id !== current.id);

  const scored = candidates
    .map((product) => {
      const overlap = [...tokenize(product.name)].filter((t) =>
        currentTokens.has(t),
      ).length;
      const priceDiff =
        current.price > 0 && product.price > 0
          ? Math.abs(current.price - product.price)
          : Number.POSITIVE_INFINITY;
      return { product, overlap, priceDiff };
    })
    .filter((entry) => entry.overlap > 0)
    .sort((a, b) => {
      if (b.overlap !== a.overlap) return b.overlap - a.overlap;
      return a.priceDiff - b.priceDiff;
    })
    .map((entry) => entry.product);

  const picked = scored.slice(0, count);

  if (picked.length < count) {
    const pickedIds = new Set(picked.map((p) => p.id));
    const remaining = candidates.filter((p) => !pickedIds.has(p.id));

    const rng = mulberry32(hashString(current.id));
    const shuffled = [...remaining]
      .map((product) => ({ product, sortKey: rng() }))
      .sort((a, b) => a.sortKey - b.sortKey)
      .map((entry) => entry.product);

    picked.push(...shuffled.slice(0, count - picked.length));
  }

  return picked;
}
