# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

A static Astro + Tailwind CSS site (SSG, no backend/DB) for a product catalog — a "catalog as business card" site, **not** an online store: no cart, no payment, no checkout. Every "buy" action is a link to Telegram or a phone number. See **Project requirements** below for the full brief.

The product data (`ProductList.json`) and photos (`public/images/`) predate the Astro app and were cleaned up/validated before scaffolding — see the schema and conventions below before touching them.

## Commands

```bash
npm install       # install deps
npm run dev        # dev server (http://localhost:4321)
npm run build       # type-checks + static build to dist/
npm run preview      # serve the built dist/ locally
```

There is no linter or test suite configured. After editing `ProductList.json` directly, validate it before running the app:

```bash
python3 -c "import json; json.load(open('ProductList.json', encoding='utf-8'))"
```

This file has previously contained hand-edited syntax errors (trailing commas, unescaped `"` inside description strings, e.g. `фланец "УАЗ"` or inch marks like `G 1"`) — treat manual edits with suspicion and re-validate.

## Architecture

- **`ProductList.json`** (repo root, *not* under `src/`) — single source of truth for all product data, imported directly into Astro pages/modules via relative path (`import raw from "../../ProductList.json"`). It's outside `src/` deliberately, keep it there.
- **`src/lib/products.ts`** — loads `ProductList.json` and is the only place that computes routing slugs. `ProductList.json`'s own `slug` field is **not URL-safe and not unique** (contains spaces; e.g. `"Key for car"` is reused by 5 unrelated products, `"Hydraulic pump"` by 2 — see Known data quirks). This module derives a kebab-case `urlSlug` and appends the product `id` whenever the base slug collides, so routing is guaranteed unique. Always get products through `allProducts` / `getProductByUrlSlug()` here rather than re-deriving slugs elsewhere.
- **`src/pages/index.astro`** — the catalog (home page), lists all products from `allProducts`.
- **`src/pages/product/[slug].astro`** — one static page per product (`getStaticPaths` maps over `allProducts`, keyed by `urlSlug`), each with its own `<title>` and meta description built from the product's name/shortDescription (per the SEO requirement below).
- **`src/pages/contacts.astro`** — static contacts page.
- **`src/layouts/BaseLayout.astro`** — shared `<html>`/nav/`<head>` shell (title + description props); all pages should go through it.
- **`public/images/`** — product photos, served as-is at `/images/...`. `ProductList.json`'s `images` arrays reference them by that path — see naming convention below.

Routing is Astro's standard file-based routing; the site is fully static (no SSR/adapter configured).

## `ProductList.json` schema

Every product object has exactly these fields (no optional/extra fields):

| field | type | notes |
|---|---|---|
| `id` | string | zero-padded 3-digit, `"001"`–`"053"`, unique |
| `slug` | string | short latin identifier — NOT URL-safe or unique, don't route on it directly (see `src/lib/products.ts`) |
| `name` | string | Russian product name |
| `category` | string | currently a placeholder `"Категория"` for every product — not yet real data |
| `price` | number | RUB, `0` means price not yet set/unknown |
| `currency` | string | always `"RUB"` currently |
| `inStock` | boolean | |
| `shortDescription` | string | |
| `fullDescription` | string | often long, keyword-stuffed marketing copy |
| `specifications` | object | free-form key/value; empty `{}` for almost all products |
| `images` | array of strings | absolute web paths, see convention below |

## Image-to-product mapping convention

Files in `public/images/` are named `<n>-<k>.<ext>`, where `<n>` is the product number **without zero-padding** (matches `id` with leading zeros stripped) and `<k>` is a 1-based image index for that product (order shown in the product's photo gallery). Example: product `id: "011"` → files `11-1.webp`, `11-2.webp`, `11-3.webp`.

`ProductList.json`'s `images` arrays reference these as absolute web paths: `/images/<n>-<k>.<ext>` (there is no `/images/products/<id>/...` subfolder despite that pattern appearing in early, buggy revisions of the file — do not reintroduce it).

## Known data quirks

- Products `008`, `012`, `040` are duplicate "Key for car" placeholder entries (identical content to `002`) with no dedicated photos of their own — they reuse `002`'s image (`/images/2-1.webp`).
- The `slug` field has two unrelated data bugs, both worked around by `src/lib/products.ts` (see Architecture): it's reused verbatim by unrelated products (`"Key for car"` × 5 — ids `002`, `008`, `012`, `030`, `040`; `"Hydraulic pump"` × 2 — ids `013`, `039`), and product `030` (a Hino/Isuzu PTO) has a copy-paste `slug` of `"Key for car"` that doesn't match its actual content.
- `category` is a placeholder value for every product; don't treat it as meaningful data.
- Adding a new product: drop its photos in `public/images/` as `<n>-1.<ext>`, `<n>-2.<ext>`, ... using the product's un-padded id number, then reference them from `images` as `/images/<n>-<k>.<ext>`. Routing/slug uniqueness is handled automatically by `src/lib/products.ts`.

## Project requirements

Type сайта: каталог-визитка, НЕ интернет-магазин. Оплаты и корзины нет. Заказ — через кнопки-ссылки на соцсети/телефон на каждой карточке товара и на странице товара.

Каналы заказа: Telegram [@Yugsoyuz](https://t.me/Yugsoyuz), телефон +7 928 175-50-05.

Требования:
- Мобильная адаптивность в приоритете.
- SEO: у каждого товара своя страница со своим `<title>` и meta description.
- Простой, но не шаблонный дизайн — избегать generic bootstrap-вида.

## Design system

Source of truth: `references/design-a.html` (dark / engineering-technical direction). Treat that file only as a **token/principle source**, never copy its markup or component structure verbatim — real layout/components are built separately (see below). The tokens below are already wired into the codebase; use them rather than re-declaring colors or fonts ad hoc.

**Do not change the values below without updating `references/design-a.html`, `src/styles/global.css`, and this section together — they must stay in sync.**

### Palette

Defined as Tailwind v4 theme colors in `src/styles/global.css` (`@theme` block — this project uses Tailwind v4's CSS-first config, there is no `tailwind.config.js`). Each token is usable as `bg-<name>`, `text-<name>`, `border-<name>`, etc.

| token | hex | Tailwind utility | semantic use |
|---|---|---|---|
| `bg` | `#1B1F22` | `bg-bg` | page background |
| `surface` | `#22272B` | `bg-surface` | card / panel background |
| `surface-2` | `#282E32` | `bg-surface-2` | nested/alternate panel background |
| `line` | `#3A4045` | `border-line` | default hairline border / divider |
| `line-strong` | `#4A90A4` | `border-line-strong` | emphasized border — corner marks, hover/focus outlines |
| `accent` | `#E8622C` | `bg-accent` / `text-accent` | primary CTA / highlight |
| `accent-dim` | `#7A3A1E` | `bg-accent-dim` | muted secondary accent |
| `text` | `#EDEFEF` | `text-text` | primary text |
| `text-muted` | `#8B9296` | `text-text-muted` | secondary text, labels, meta |
| `stock` | `#7A9B57` | `text-stock` | in-stock / success indicator |
| `band-warm` | `#221D1A` | `bg-band-warm` | home section band — gallery (key: `sand`) |
| `band-steel` | `#19232A` | `bg-band-steel` | home section band — map (key: `line-strong`) |
| `band-moss` | `#1D221C` | `bg-band-moss` | home section band — reviews (key: `stock`) |
| `sand` | `#C8A36A` | `text-sand` / `bg-sand` | key color of the gallery band only |

Home-page blocks are wrapped in `src/components/Section.astro` ("drawing sheet": full-width tinted band + faint grid, `01 / 04` sheet number and dimension-line rule in the band's key color). The catalog band uses `bg` with `accent` as its key. Add new home blocks through `Section` with a `tone` rather than hand-rolling a label divider.

### Fonts

Loaded via Google Fonts `<link>` tags in `src/layouts/BaseLayout.astro` (all pages go through this layout), mapped to Tailwind font utilities via `--font-*` theme keys in `src/styles/global.css`:

| family | weights loaded | Tailwind utility | usage rule |
|---|---|---|---|
| Space Grotesk | 400, 500, 600 | `font-display` | headings, logo, section titles — display/brand voice only |
| IBM Plex Sans | 400, 500 | `font-sans` (default body font) | body copy, UI labels, buttons |
| IBM Plex Mono | 400, 500 | `font-mono` | **all** numeric/technical data: prices, spec values, phone numbers, article/SKU numbers, category and section labels, badges |

Google Fonts URL in use: `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap`

### Core principles (mandatory for all future styling)

- **No border-radius anywhere.** Every element is sharp-cornered — never use `rounded-*` utilities.
- **No box-shadow anywhere.** Depth/hierarchy comes only from layering `bg` → `surface` → `surface-2` and hairline borders, never from shadows.
- **Hairline borders only.** Borders are always `1px solid`, using `border-line` by default and `border-line-strong` for emphasized/interactive elements. Never go thicker than 1px.
- **Corner tick marks on cards** — a blueprint-style detail: 10×10px L-shaped marks in the top-left and bottom-right corners of a card, in `line-strong`, drawn as `::before`/`::after` pseudo-elements (not a Tailwind utility on its own — needs a scoped `<style>` block or `before:`/`after:` arbitrary-value variants when a card component is built). Reference implementation from `design-a.html`:
  ```css
  .card { position: relative; }
  .card::before, .card::after {
    content: ""; position: absolute; width: 10px; height: 10px;
    border-top: 1px solid var(--line-strong); border-left: 1px solid var(--line-strong);
    top: 10px; left: 10px;
  }
  .card::after {
    left: auto; right: 10px; top: auto; bottom: 10px;
    border-top: none; border-left: none;
    border-bottom: 1px solid var(--line-strong); border-right: 1px solid var(--line-strong);
  }
  ```
- **Numbers are always monospace.** Any numeric or technical value (price, spec value, phone number, dimensions, counts) uses `font-mono`, never `font-sans`/`font-display`.

### Other patterns in the reference (secondary, available for reuse — not mandatory rules)

- Graph-paper background: two 1px linear-gradients in `surface` color on a 48px × 48px tile, applied to `body`.
- "Section label" divider: small `font-mono` uppercase-ish label followed by a `flex:1` hairline rule filling the remaining row width (e.g. `каталог · в наличии ————`).
- Sticky header with `backdrop-filter: blur(4px)` over a semi-transparent `bg`.
- Product grid as a single CSS grid with `gap:1px` and a `line`-colored background, so the 1px gaps themselves read as hairline dividers between cards (no per-card border needed on shared edges).
