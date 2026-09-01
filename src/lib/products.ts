import raw from "../../ProductList.json";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  inStock: boolean;
  shortDescription: string;
  fullDescription: string;
  specifications: Record<string, string>;
  images: string[];
}

export interface ProductWithUrlSlug extends Product {
  /** URL-safe, unique slug used for routing (derived from `slug`, see below). */
  urlSlug: string;
}

/**
 * ProductList.json's `slug` field is not URL-safe (contains spaces) and is not
 * unique (e.g. "Key for car" is reused across several unrelated products).
 * We derive a kebab-case slug for routing and disambiguate collisions by
 * appending the product `id`, so every product still gets a stable URL.
 */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const products = (raw as { products: Product[] }).products;

const baseSlugCounts = new Map<string, number>();
for (const product of products) {
  const base = slugify(product.slug) || product.id;
  baseSlugCounts.set(base, (baseSlugCounts.get(base) ?? 0) + 1);
}

export const allProducts: ProductWithUrlSlug[] = products.map((product) => {
  const base = slugify(product.slug) || product.id;
  const isDuplicate = (baseSlugCounts.get(base) ?? 0) > 1;
  return { ...product, urlSlug: isDuplicate ? `${base}-${product.id}` : base };
});

export function getProductByUrlSlug(
  urlSlug: string,
): ProductWithUrlSlug | undefined {
  return allProducts.find((product) => product.urlSlug === urlSlug);
}
