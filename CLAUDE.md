# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This is a **data-only repository**, not an application. It holds the product catalog and photos consumed by an external Node.js site (that app's code lives elsewhere, outside this repo). The repo contains exactly two things:

- `ProductList.json` — the product catalog (53 products under a single top-level `"products"` array).
- `images/` — a flat directory of product photos (`.webp`, with a few `.jpeg`), no subfolders.

There is no `package.json`, build tooling, linter, or test suite in this repo — don't assume any.

## Validating changes

There is no CI or build step, so after editing `ProductList.json` always validate it manually:

```bash
python3 -c "import json; json.load(open('ProductList.json', encoding='utf-8'))"
```

This repo's JSON has previously contained hand-edited syntax errors (trailing commas, unescaped `"` inside description strings, e.g. `фланец "УАЗ"` or inch marks like `G 1"`) — treat any manual edits to this file with suspicion and re-validate.

## `ProductList.json` schema

Every product object has exactly these fields (no optional/extra fields):

| field | type | notes |
|---|---|---|
| `id` | string | zero-padded 3-digit, `"001"`–`"053"`, unique |
| `slug` | string | short latin identifier, not URL-slugified (contains spaces) |
| `name` | string | Russian product name |
| `category` | string | currently a placeholder `"Категория"` for every product — not yet real data |
| `price` | number | RUB, `0` means price not yet set/unknown |
| `currency` | string | always `"RUB"` currently |
| `inStock` | boolean | |
| `shortDescription` | string | |
| `fullDescription` | string | often long, keyword-stuffed marketing copy |
| `specifications` | object | free-form key/value; empty `{}` for almost all products |
| `images` | array of strings | paths, see convention below |

## Image-to-product mapping convention

Files in `images/` are named `<n>-<k>.<ext>`, where `<n>` is the product number **without zero-padding** (matches `id` with leading zeros stripped) and `<k>` is a 1-based image index for that product (order shown in the product's photo gallery). Example: product `id: "011"` → files `11-1.webp`, `11-2.webp`, `11-3.webp`.

`ProductList.json`'s `images` arrays must reference these as absolute web paths: `/images/<n>-<k>.<ext>` (there is no `/images/products/<id>/...` subfolder despite that pattern appearing in early, buggy revisions of the file — do not reintroduce it).

Known gaps/quirks to be aware of when touching this data:
- Products `008`, `012`, `040` are duplicate "Key for car" placeholder entries (identical to `002`) with no dedicated photos of their own — they currently reuse `002`'s image (`/images/2-1.webp`).
- `category` is a placeholder value for every product; don't treat it as meaningful data.
- Adding a new product: drop its photos in `images/` as `<n>-1.<ext>`, `<n>-2.<ext>`, ... using the product's un-padded id number, then reference them from `images` as `/images/<n>-<k>.<ext>`.

# Проект: сайт-каталог товаров

Стек: Astro + Tailwind CSS, статическая генерация (SSG), без бэкенда и БД.
Данные о товарах — в ProductList.json, фото — в images/.

Тип сайта: каталог-визитка, НЕ интернет-магазин.
Оплаты и корзины нет. Заказ — через кнопки-ссылки на соцсети/телефон
на каждой карточке товара и на странице товара.

Каналы заказа: [Telegram: @Yugsoyuz, 
телефон: +79281755005]

Требования:
- Мобильная адаптивность в приоритете
- SEO: у каждого товара своя страница со своим <title> и meta description
- Простой, но не шаблонный дизайн — избегать generic bootstrap-вида