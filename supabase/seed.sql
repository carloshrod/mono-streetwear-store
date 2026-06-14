-- ============================================================
-- MONO — sample data seed
-- Run in the Supabase SQL Editor (it runs as superuser and bypasses RLS).
-- Safe to re-run: every insert is idempotent via ON CONFLICT.
-- Prices are stored in cents.
-- ============================================================

-- ── Categories ──────────────────────────────────────────────
insert into public.categories (name, slug) values
  ('T-Shirts',    't-shirts'),
  ('Hoodies',     'hoodies'),
  ('Outerwear',   'outerwear'),
  ('Bottoms',     'bottoms'),
  ('Headwear',    'headwear'),
  ('Accessories', 'accessories')
on conflict (slug) do nothing;

-- ── Products ────────────────────────────────────────────────
-- Two images per product (front / alternate) drive the hover swap in ProductCard.
-- Images use picsum.photos placeholders in a 3:4 ratio.
-- Each category has one men and one women product.
-- Unisex products appear in both men and women filtered views.
with data(slug, name, description, price, cat_slug, img_seed, gender) as (
  values
    -- T-Shirts
    ('mono-box-tee',           'Box Logo Tee',
     'Heavyweight cotton tee with a tonal box logo. Boxy fit, ribbed collar, pre-shrunk.',
     4500,  't-shirts',    'mono-tee',        'men'),
    ('mono-cropped-tee',       'Cropped Graphic Tee',
     'Cropped cotton tee with a subtle tonal print. Relaxed chest, fitted hem.',
     3900,  't-shirts',    'mono-crop',       'women'),
    ('mono-essential-tee',     'Essential Blank Tee',
     '180gsm combed cotton. A true wardrobe blank — clean, minimal, unisex cut.',
     2900,  't-shirts',    'mono-essential',  'unisex'),
    -- Hoodies
    ('mono-essential-hoodie',  'Essential Hoodie',
     'Brushed-back fleece hoodie with a double-layer hood and kangaroo pocket.',
     9500,  'hoodies',     'mono-hoodie',     'men'),
    ('mono-oversized-hoodie',  'Oversized Pullover Hoodie',
     'Heavy 450gsm loopback cotton with an exaggerated oversized cut.',
     11000, 'hoodies',     'mono-oversized',  'women'),
    ('mono-zip-hoodie',        'Zip-Up Hoodie',
     'Midweight fleece zip hoodie with a clean minimal silhouette and no logo.',
     10500, 'hoodies',     'mono-zip',        'unisex'),
    -- Outerwear
    ('mono-coaches-jacket',    'Coaches Jacket',
     'Water-repellent shell with snap closure and a relaxed coach-cut fit.',
     14500, 'outerwear',   'mono-coach',      'men'),
    ('mono-padded-bomber',     'Padded Bomber',
     'Insulated bomber with ribbed cuffs, two-way zip and matte hardware.',
     21000, 'outerwear',   'mono-bomber',     'women'),
    -- Bottoms
    ('mono-cargo-pants',       'Cargo Pants',
     'Ripstop cargo with adjustable hem, utility pockets and a tapered leg.',
     12000, 'bottoms',     'mono-cargo',      'men'),
    ('mono-wide-leg-trousers', 'Wide Leg Trousers',
     'Structured wide-leg trousers in a lightweight technical fabric.',
     9800,  'bottoms',     'mono-wide',       'women'),
    -- Headwear
    ('mono-beanie',            'Embroidered Beanie',
     'Fine-gauge ribbed knit beanie with a tonal embroidered logo.',
     3200,  'headwear',    'mono-beanie',     'men'),
    ('mono-bucket-hat',        'Washed Bucket Hat',
     'Garment-washed cotton bucket hat with a tonal logo patch.',
     3800,  'headwear',    'mono-bucket',     'women'),
    ('mono-structured-cap',    'Structured Cap',
     'Six-panel structured cap with a pre-curved brim and adjustable strap.',
     3500,  'headwear',    'mono-cap',        'unisex'),
    -- Accessories
    ('mono-tote',              'Canvas Tote',
     'Heavy 16oz canvas tote with reinforced handles and an interior pocket.',
     2800,  'accessories', 'mono-tote',       'unisex'),
    ('mono-crossbody',         'Crossbody Bag',
     'Water-resistant crossbody with an adjustable strap and magnetic flap.',
     6500,  'accessories', 'mono-crossbody',  'women')
)
insert into public.products (slug, name, description, price, category_id, images, status, gender)
select
  d.slug,
  d.name,
  d.description,
  d.price,
  c.id,
  array[
    'https://picsum.photos/seed/' || d.img_seed || '-a/800/1067',
    'https://picsum.photos/seed/' || d.img_seed || '-b/800/1067'
  ],
  'active',
  d.gender
from data d
join public.categories c on c.slug = d.cat_slug
on conflict (slug) do update set gender = excluded.gender;

-- ── Variants ────────────────────────────────────────────────
-- Apparel gets S/M/L/XL; headwear & accessories get One Size (OS).
-- Stock is randomised between 5 and 45 for realistic availability.
insert into public.product_variants (product_id, size, stock)
select
  p.id,
  s.size,
  (5 + floor(random() * 41))::int
from public.products p
cross join lateral (
  select unnest(
    case
      when p.category_id in (
        select id from public.categories where slug in ('headwear', 'accessories')
      )
      then array['OS']
      else array['S', 'M', 'L', 'XL']
    end
  ) as size
) s
on conflict (product_id, size) do nothing;
