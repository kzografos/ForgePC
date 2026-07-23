-- ============================================================================
-- KZProducts — CATALOG SEED  (non-destructive, idempotent)
-- ============================================================================
-- Upserts the known-good catalog: 4 categories + 7 real components, all with
-- self-contained LOCAL images (public/products/*.jpg). Safe to re-run — it only
-- inserts/updates catalog rows and never touches orders/reviews/carts.
--
-- To fully RESET the demo (wipe test orders/reviews/carts + all products, then
-- reseed), use supabase/reset-demo.sql instead.
--
-- PREREQUISITE: deploy public/products/*.jpg first so the local paths resolve.
-- ============================================================================

-- Categories -----------------------------------------------------------------
INSERT INTO public.categories (id, name, slug, description, sort_order, image_url) VALUES
  (gen_random_uuid(), 'Processors',     'cpu', 'High-performance CPUs for gaming and workstation builds', 1, '/products/cpu-intel-i9.jpg'),
  (gen_random_uuid(), 'Graphics Cards', 'gpu', 'Powerful GPUs for gaming, rendering, and AI workloads',   2, '/products/gpu-nvidia.jpg'),
  (gen_random_uuid(), 'Memory',         'ram', 'High-speed DDR5 memory modules for maximum performance',  3, '/products/ram.jpg'),
  (gen_random_uuid(), 'Storage',        'ssd', 'NVMe SSDs with blazing fast read/write speeds',           4, '/products/ssd.jpg')
ON CONFLICT (slug) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url   = EXCLUDED.image_url,
  sort_order  = EXCLUDED.sort_order;

-- Products -------------------------------------------------------------------
WITH cat_ids AS (SELECT id, slug FROM public.categories)
INSERT INTO public.products
  (id, name, slug, description, price, compare_at_price, images, category_id, stock_quantity, is_active, metadata)
SELECT
  gen_random_uuid(), p.name, p.slug, p.description, p.price, p.compare_at_price,
  p.images, c.id, p.stock_quantity, p.is_active, p.metadata
FROM (VALUES
  ('Intel Core i9-14900K', 'intel-i9-14900k',
   'The Intel Core i9-14900K is the flagship processor of Intel''s 14th generation Raptor Lake Refresh lineup. With 24 cores (8P + 16E), 32 threads, and boost clocks up to 6.0 GHz, it delivers exceptional performance for gaming and content creation.',
   589.99::numeric, 649.99::numeric, ARRAY['/products/cpu-intel-i9.jpg'], 'cpu', 15, true,
   '{"cores":"24 (8P + 16E)","threads":"32","base_clock":"3.2 GHz","boost_clock":"6.0 GHz","cache":"36MB L3","tdp":"125W","socket":"LGA 1700"}'::jsonb),

  ('AMD Ryzen 9 7950X', 'amd-ryzen-9-7950x',
   'The AMD Ryzen 9 7950X represents the pinnacle of AMD''s Zen 4 architecture. With 16 cores, 32 threads, and boost speeds up to 5.7 GHz, it excels in both single- and multi-threaded workloads.',
   549.99::numeric, 699.99::numeric, ARRAY['/products/cpu-ryzen-9.jpg'], 'cpu', 12, true,
   '{"cores":"16","threads":"32","base_clock":"4.5 GHz","boost_clock":"5.7 GHz","cache":"64MB L3","tdp":"170W","socket":"AM5"}'::jsonb),

  ('NVIDIA GeForce RTX 4090', 'nvidia-rtx-4090',
   'The NVIDIA GeForce RTX 4090 is the most powerful consumer graphics card ever made. Powered by the Ada Lovelace architecture with 16,384 CUDA cores and 24GB GDDR6X memory.',
   1599.99::numeric, 1999.99::numeric, ARRAY['/products/gpu-nvidia.jpg','/products/gpu-nvidia-2.jpg'], 'gpu', 5, true,
   '{"cuda_cores":"16384","memory":"24GB GDDR6X","memory_bus":"384-bit","boost_clock":"2.52 GHz","tdp":"450W","ray_tracing":"3rd Gen RT Cores","dlss":"DLSS 3.0"}'::jsonb),

  ('NVIDIA GeForce RTX 4080 SUPER', 'nvidia-rtx-4080-super',
   'The RTX 4080 SUPER brings enhanced performance with 10,240 CUDA cores and 16GB GDDR6X memory. Built on Ada Lovelace for exceptional 4K gaming.',
   999.99::numeric, 1199.99::numeric, ARRAY['/products/gpu-nvidia.jpg','/products/gpu-nvidia-2.jpg'], 'gpu', 10, true,
   '{"cuda_cores":"10240","memory":"16GB GDDR6X","memory_bus":"256-bit","boost_clock":"2.55 GHz","tdp":"320W","ray_tracing":"3rd Gen RT Cores","dlss":"DLSS 3.0"}'::jsonb),

  ('AMD Radeon RX 7900 XTX', 'amd-rx-7900-xtx',
   'AMD''s flagship RDNA 3 graphics card delivers outstanding performance with 96 compute units, 24GB GDDR6 memory, and an innovative chiplet design.',
   899.99::numeric, 999.99::numeric, ARRAY['/products/gpu-nvidia.jpg'], 'gpu', 8, true,
   '{"compute_units":"96","stream_processors":"6144","memory":"24GB GDDR6","memory_bus":"384-bit","boost_clock":"2.5 GHz","tdp":"355W"}'::jsonb),

  ('Corsair Vengeance RGB DDR5 32GB', 'corsair-vengeance-rgb-ddr5-32gb',
   'Corsair Vengeance RGB DDR5 delivers 32GB (2x16GB) of high-speed 6000MHz memory with vivid RGB lighting and rock-solid stability for AM5 and Intel builds.',
   129.99::numeric, 159.99::numeric, ARRAY['/products/ram.jpg'], 'ram', 25, true,
   '{"capacity":"32GB (2x16GB)","type":"DDR5","speed":"6000 MHz","cas_latency":"CL36","voltage":"1.35V","rgb":"Yes"}'::jsonb),

  ('G.Skill Trident Z5 RGB DDR5 32GB', 'gskill-trident-z5-rgb-ddr5-32gb',
   'G.Skill Trident Z5 RGB pushes 32GB (2x16GB) of DDR5 to 6400MHz with tight CL32 timings — premium memory for enthusiasts chasing peak performance.',
   159.99::numeric, 189.99::numeric, ARRAY['/products/ram.jpg'], 'ram', 18, true,
   '{"capacity":"32GB (2x16GB)","type":"DDR5","speed":"6400 MHz","cas_latency":"CL32","voltage":"1.40V","rgb":"Yes"}'::jsonb)
) AS p(name, slug, description, price, compare_at_price, images, category_slug, stock_quantity, is_active, metadata)
JOIN cat_ids c ON c.slug = p.category_slug
ON CONFLICT (slug) DO UPDATE SET
  name             = EXCLUDED.name,
  description      = EXCLUDED.description,
  price            = EXCLUDED.price,
  compare_at_price = EXCLUDED.compare_at_price,
  images           = EXCLUDED.images,
  category_id      = EXCLUDED.category_id,
  stock_quantity   = EXCLUDED.stock_quantity,
  is_active        = EXCLUDED.is_active,
  metadata         = EXCLUDED.metadata;
