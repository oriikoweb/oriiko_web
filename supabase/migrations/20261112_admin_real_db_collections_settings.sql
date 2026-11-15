-- ============================================================
-- ORIIKO — Real Database Overhaul Migration
-- Run once in Supabase Dashboard -> SQL Editor -> New Query
-- Enables:
--   1. Strictly two roles ('customer', 'admin') — removes 'editor' / RBAC
--   2. Storefront Settings (delivery_charge, free_shipping_threshold, favicon_url)
--   3. Collections CRUD + Multi-Collection product tagging (product_collections)
--   4. Cloudinary CDN Images & Videos (product_images.media_type)
--   5. Full Admin Workspace, Orders, Customers, Visitor Analytics & Audit Logs RPCs
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- 1. PROFILES: Strictly 'customer' and 'admin' roles + CRM fields
-- ------------------------------------------------------------
UPDATE public.profiles SET role = 'admin' WHERE role = 'editor';

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check CHECK (role IN ('customer', 'admin'));

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS segment TEXT NOT NULL DEFAULT 'First-Time';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_opt_in BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notes TEXT NOT NULL DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_status_check CHECK (status IN ('Active', 'Blocked', 'VIP'));

-- Update custom auth RPCs (re-assert 'customer'/'admin' clean selection)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ------------------------------------------------------------
-- 2. STORE SETTINGS (Delivery Charge, Free-Shipping Threshold, Favicon)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_settings (
  id                      INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  delivery_charge         NUMERIC(10,2) NOT NULL DEFAULT 149,
  free_shipping_threshold NUMERIC(10,2) NOT NULL DEFAULT 2999,
  favicon_url             TEXT,
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.store_settings (id, delivery_charge, free_shipping_threshold, favicon_url)
VALUES (1, 149, 2999, NULL)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 3. COLLECTIONS & MULTI-COLLECTION TAGGING
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.collections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  season      TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS low_stock_threshold INT NOT NULL DEFAULT 5;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Active';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS subcategory TEXT NOT NULL DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS collection_label TEXT NOT NULL DEFAULT 'DROP 01';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sales_count INT NOT NULL DEFAULT 0;

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_status_check;
ALTER TABLE public.products
  ADD CONSTRAINT products_status_check CHECK (status IN ('Draft', 'Active', 'Archived'));

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku_unique
  ON public.products (sku)
  WHERE sku IS NOT NULL AND sku <> '';

CREATE TABLE IF NOT EXISTS public.product_collections (
  product_id    UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, collection_id)
);

CREATE INDEX IF NOT EXISTS idx_product_collections_collection
  ON public.product_collections(collection_id);

-- Backfill existing single collection_id relationships into product_collections
INSERT INTO public.product_collections (product_id, collection_id)
SELECT id, collection_id
FROM public.products
WHERE collection_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- 4. MEDIA: Support Cloudinary Images & Videos on product_images
-- ------------------------------------------------------------
ALTER TABLE public.product_images
  ADD COLUMN IF NOT EXISTS media_type TEXT NOT NULL DEFAULT 'image';

ALTER TABLE public.product_images DROP CONSTRAINT IF EXISTS product_images_media_type_check;
ALTER TABLE public.product_images
  ADD CONSTRAINT product_images_media_type_check CHECK (media_type IN ('image', 'video'));

-- ------------------------------------------------------------
-- 5. ORDERS: Full OMS Fields
-- ------------------------------------------------------------
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check CHECK (
    LOWER(status) IN (
      'pending', 'confirmed', 'processing', 'packed',
      'shipped', 'delivered', 'cancelled', 'returned', 'refunded'
    )
  );

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS fulfilment_courier TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_url TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS internal_notes TEXT NOT NULL DEFAULT '';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS activities JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refunds JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ------------------------------------------------------------
-- 6. ADMIN ACTIVITY LOGS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL,
  module     TEXT NOT NULL,
  action     TEXT NOT NULL,
  target     TEXT NOT NULL,
  details    TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created
  ON public.admin_activity_logs(created_at DESC);

-- ------------------------------------------------------------
-- 7. INTERNAL ADMIN SESSION VERIFICATION HELPER
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public._verify_admin_session(p_token_hash TEXT)
RETURNS TABLE (
  admin_id   UUID,
  admin_name TEXT,
  admin_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID;
  v_name     TEXT;
  v_email    TEXT;
BEGIN
  IF p_token_hash IS NULL OR TRIM(p_token_hash) = '' THEN
    RAISE EXCEPTION 'UNAUTHORIZED_ADMIN';
  END IF;

  SELECT p.id, COALESCE(NULLIF(TRIM(p.full_name), ''), p.email), p.email
  INTO v_admin_id, v_name, v_email
  FROM public.user_sessions s
  JOIN public.profiles p ON p.id = s.user_id
  WHERE s.token_hash = p_token_hash
    AND s.expires_at > NOW()
    AND p.role = 'admin'
    AND p.status <> 'Blocked'
  LIMIT 1;

  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED_ADMIN';
  END IF;

  UPDATE public.profiles
  SET last_active_at = NOW()
  WHERE id = v_admin_id;

  RETURN QUERY SELECT v_admin_id, v_name, v_email;
END;
$$;

-- ------------------------------------------------------------
-- 8. PUBLIC STOREFRONT BOOTSTRAP & PAGE VIEW TRACKING
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_store_bootstrap()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings    JSONB;
  v_collections JSONB;
  v_products    JSONB;
BEGIN
  SELECT COALESCE(
    (
      SELECT jsonb_build_object(
        'deliveryCharge', COALESCE(s.delivery_charge, 149),
        'freeShippingThreshold', COALESCE(s.free_shipping_threshold, 2999),
        'faviconUrl', s.favicon_url,
        'updatedAt', s.updated_at
      )
      FROM public.store_settings s
      WHERE s.id = 1
    ),
    jsonb_build_object(
      'deliveryCharge', 149,
      'freeShippingThreshold', 2999,
      'faviconUrl', NULL,
      'updatedAt', NOW()
    )
  ) INTO v_settings;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', c.id,
        'slug', c.slug,
        'name', c.name,
        'description', COALESCE(c.description, ''),
        'coverImage', c.cover_image,
        'season', c.season,
        'isActive', c.is_active,
        'sortOrder', c.sort_order
      )
      ORDER BY c.sort_order ASC, c.created_at ASC
    ),
    '[]'::jsonb
  )
  INTO v_collections
  FROM public.collections c
  WHERE c.is_active = TRUE;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'slug', p.slug,
        'name', p.name,
        'subtitle', COALESCE(p.subtitle, ''),
        'collection', COALESCE(NULLIF(p.collection_label, ''), 'DROP 01'),
        'category', COALESCE(NULLIF(p.category, ''), 'apparel'),
        'collectionIds', COALESCE((
          SELECT jsonb_agg(pc.collection_id)
          FROM public.product_collections pc
          WHERE pc.product_id = p.id
        ), '[]'::jsonb),
        'collectionSlugs', COALESCE((
          SELECT jsonb_agg(col.slug)
          FROM public.product_collections pc
          JOIN public.collections col ON col.id = pc.collection_id
          WHERE pc.product_id = p.id
        ), '[]'::jsonb),
        'collectionNames', COALESCE((
          SELECT jsonb_agg(col.name)
          FROM public.product_collections pc
          JOIN public.collections col ON col.id = pc.collection_id
          WHERE pc.product_id = p.id
        ), '[]'::jsonb),
        'price', p.price::NUMERIC,
        'originalPrice', p.compare_price::NUMERIC,
        'currency', p.currency,
        'badge', CASE
          WHEN p.promo_label IS NOT NULL AND p.promo_label <> '' THEN p.promo_label
          WHEN p.is_bestseller THEN 'Bestseller'
          WHEN p.is_new_arrival THEN 'New Arrival'
          ELSE NULL
        END,
        'discountBadge', p.promo_label,
        'isNewArrival', p.is_new_arrival,
        'isBestseller', p.is_bestseller,
        'isFeatured', p.is_featured,
        'rating', p.average_rating::NUMERIC,
        'reviewCount', p.review_count,
        'description', COALESCE(p.description, ''),
        'details', CASE
          WHEN jsonb_typeof(p.details) = 'array' THEN p.details
          ELSE '[]'::jsonb
        END,
        'materials', COALESCE(p.materials, ''),
        'care', COALESCE(p.care_instructions, ''),
        'primaryImage', COALESCE((
          SELECT pi.url FROM public.product_images pi
          WHERE pi.product_id = p.id AND pi.media_type = 'image'
          ORDER BY pi.is_primary DESC, pi.sort_order ASC
          LIMIT 1
        ), (
          SELECT pi.url FROM public.product_images pi
          WHERE pi.product_id = p.id
          ORDER BY pi.is_primary DESC, pi.sort_order ASC
          LIMIT 1
        ), ''),
        'secondaryImage', COALESCE((
          SELECT pi.url FROM public.product_images pi
          WHERE pi.product_id = p.id AND pi.media_type = 'image'
          ORDER BY pi.is_primary DESC, pi.sort_order ASC
          OFFSET 1 LIMIT 1
        ), ''),
        'galleryImages', COALESCE((
          SELECT jsonb_agg(pi.url ORDER BY pi.is_primary DESC, pi.sort_order ASC)
          FROM public.product_images pi
          WHERE pi.product_id = p.id AND pi.media_type = 'image'
        ), '[]'::jsonb),
        'media', COALESCE((
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', pi.id,
              'url', pi.url,
              'mediaType', pi.media_type,
              'altText', COALESCE(pi.alt_text, ''),
              'isPrimary', pi.is_primary
            )
            ORDER BY pi.is_primary DESC, pi.sort_order ASC
          )
          FROM public.product_images pi
          WHERE pi.product_id = p.id
        ), '[]'::jsonb),
        'variants', COALESCE((
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', pv.id,
              'name', TRIM(BOTH ' / ' FROM CONCAT_WS(' / ', NULLIF(pv.size, ''), NULLIF(pv.color_name, ''))),
              'size', COALESCE(pv.size, 'One Size'),
              'color', COALESCE(pv.color_name, 'Default'),
              'colorHex', COALESCE(pv.color_hex, '#26231F'),
              'sku', COALESCE(pv.sku, ''),
              'stock', pv.stock_qty,
              'inStock', (pv.is_active AND pv.stock_qty > 0)
            )
            ORDER BY pv.created_at ASC
          )
          FROM public.product_variants pv
          WHERE pv.product_id = p.id AND pv.is_active = TRUE
        ), '[]'::jsonb)
      )
      ORDER BY p.sort_order ASC, p.created_at DESC
    ),
    '[]'::jsonb
  )
  INTO v_products
  FROM public.products p
  WHERE p.is_active = TRUE AND p.status = 'Active';

  RETURN jsonb_build_object(
    'settings', v_settings,
    'collections', v_collections,
    'products', v_products
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.record_store_page_view(
  p_path       TEXT,
  p_session_id TEXT,
  p_device     TEXT DEFAULT 'desktop',
  p_referrer   TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_device TEXT;
  v_already_visited BOOLEAN;
BEGIN
  v_device := CASE
    WHEN p_device IN ('desktop', 'tablet', 'mobile') THEN p_device
    ELSE 'desktop'
  END;

  SELECT EXISTS (
    SELECT 1 FROM public.page_views pv
    WHERE pv.session_id = p_session_id
      AND pv.created_at >= CURRENT_DATE
  ) INTO v_already_visited;

  INSERT INTO public.page_views (session_id, path, referrer, device)
  VALUES (p_session_id, COALESCE(NULLIF(p_path, ''), '/'), p_referrer, v_device);

  INSERT INTO public.daily_stats (date, unique_visitors, page_views)
  VALUES (CURRENT_DATE, CASE WHEN v_already_visited THEN 0 ELSE 1 END, 1)
  ON CONFLICT (date) DO UPDATE
  SET page_views = public.daily_stats.page_views + 1,
      unique_visitors = public.daily_stats.unique_visitors + CASE WHEN v_already_visited THEN 0 ELSE 1 END,
      updated_at = NOW();
END;
$$;

-- ------------------------------------------------------------
-- 9. ADMIN WORKSPACE SNAPSHOT RPC
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_get_workspace(p_token_hash TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin RECORD;
  v_settings JSONB;
  v_collections JSONB;
  v_products JSONB;
  v_orders JSONB;
  v_customers JSONB;
  v_admins JSONB;
  v_logs JSONB;
  v_visitors JSONB;
BEGIN
  SELECT * INTO v_admin FROM public._verify_admin_session(p_token_hash) LIMIT 1;

  SELECT COALESCE(
    (
      SELECT jsonb_build_object(
        'deliveryCharge', COALESCE(s.delivery_charge, 149),
        'freeShippingThreshold', COALESCE(s.free_shipping_threshold, 2999),
        'faviconUrl', s.favicon_url,
        'updatedAt', s.updated_at
      )
      FROM public.store_settings s WHERE s.id = 1
    ),
    jsonb_build_object(
      'deliveryCharge', 149,
      'freeShippingThreshold', 2999,
      'faviconUrl', NULL,
      'updatedAt', NOW()
    )
  ) INTO v_settings;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', c.id,
        'slug', c.slug,
        'name', c.name,
        'description', COALESCE(c.description, ''),
        'coverImage', COALESCE(c.cover_image, ''),
        'season', COALESCE(c.season, ''),
        'isActive', c.is_active,
        'sortOrder', c.sort_order,
        'productCount', (
          SELECT COUNT(*)::INT FROM public.product_collections pc WHERE pc.collection_id = c.id
        ),
        'createdAt', c.created_at,
        'updatedAt', c.updated_at
      )
      ORDER BY c.sort_order ASC, c.created_at DESC
    ),
    '[]'::jsonb
  ) INTO v_collections FROM public.collections c;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'slug', p.slug,
        'name', p.name,
        'subtitle', COALESCE(p.subtitle, ''),
        'collection', COALESCE(NULLIF(p.collection_label, ''), 'DROP 01'),
        'category', COALESCE(NULLIF(p.category, ''), 'apparel'),
        'collectionIds', COALESCE((
          SELECT jsonb_agg(pc.collection_id)
          FROM public.product_collections pc
          WHERE pc.product_id = p.id
        ), '[]'::jsonb),
        'subcategory', COALESCE(p.subcategory, ''),
        'status', p.status,
        'price', p.price::NUMERIC,
        'compareAtPrice', p.compare_price::NUMERIC,
        'costPrice', COALESCE(p.cost_price, 0)::NUMERIC,
        'sku', COALESCE(p.sku, ''),
        'lowStockThreshold', COALESCE(p.low_stock_threshold, 5),
        'isFeatured', p.is_featured,
        'isBestseller', p.is_bestseller,
        'isNewArrival', p.is_new_arrival,
        'promoLabel', COALESCE(p.promo_label, ''),
        'description', COALESCE(p.description, ''),
        'details', CASE WHEN jsonb_typeof(p.details) = 'array' THEN p.details ELSE '[]'::jsonb END,
        'materials', COALESCE(p.materials, ''),
        'care', COALESCE(p.care_instructions, ''),
        'primaryImage', COALESCE((
          SELECT pi.url FROM public.product_images pi
          WHERE pi.product_id = p.id
          ORDER BY (pi.media_type = 'image') DESC, pi.is_primary DESC, pi.sort_order ASC
          LIMIT 1
        ), ''),
        'secondaryImage', COALESCE((
          SELECT pi.url FROM public.product_images pi
          WHERE pi.product_id = p.id AND pi.media_type = 'image'
          ORDER BY pi.is_primary DESC, pi.sort_order ASC
          OFFSET 1 LIMIT 1
        ), ''),
        'media', COALESCE((
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', pi.id,
              'url', pi.url,
              'mediaType', pi.media_type,
              'altText', COALESCE(pi.alt_text, ''),
              'isPrimary', pi.is_primary
            )
            ORDER BY pi.is_primary DESC, pi.sort_order ASC
          )
          FROM public.product_images pi
          WHERE pi.product_id = p.id
        ), '[]'::jsonb),
        'variants', COALESCE((
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', pv.id,
              'name', TRIM(BOTH ' / ' FROM CONCAT_WS(' / ', NULLIF(pv.size, ''), NULLIF(pv.color_name, ''))),
              'size', COALESCE(pv.size, 'One Size'),
              'color', COALESCE(pv.color_name, 'Default'),
              'colorHex', COALESCE(pv.color_hex, '#26231F'),
              'sku', COALESCE(pv.sku, ''),
              'stock', pv.stock_qty,
              'inStock', (pv.is_active AND pv.stock_qty > 0)
            )
            ORDER BY pv.created_at ASC
          )
          FROM public.product_variants pv
          WHERE pv.product_id = p.id
        ), '[]'::jsonb),
        'seoTitle', COALESCE(p.seo_title, ''),
        'seoDescription', COALESCE(p.seo_description, ''),
        'salesCount', COALESCE(p.sales_count, 0),
        'createdAt', p.created_at,
        'updatedAt', p.updated_at
      )
      ORDER BY p.updated_at DESC
    ),
    '[]'::jsonb
  ) INTO v_products FROM public.products p;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', o.id,
        'orderNumber', o.order_number,
        'customerId', COALESCE(o.user_id::TEXT, ''),
        'customerName', COALESCE(
          NULLIF(o.shipping_address->>'fullName', ''),
          NULLIF(o.shipping_address->>'full_name', ''),
          prof.full_name,
          'Guest Customer'
        ),
        'customerEmail', COALESCE(prof.email, ''),
        'customerPhone', COALESCE(
          NULLIF(o.shipping_address->>'phone', ''),
          prof.phone,
          ''
        ),
        'status', INITCAP(o.status),
        'paymentStatus', COALESCE(o.payment_status, 'Pending'),
        'paymentMethod', COALESCE(NULLIF(o.payment_method, ''), 'UPI'),
        'paymentReference', o.payment_id,
        'items', COALESCE((
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', oi.id,
              'productId', oi.product_id,
              'variantId', COALESCE(oi.variant_id::TEXT, ''),
              'productName', oi.product_name,
              'variantName', COALESCE(oi.variant_label, ''),
              'sku', COALESCE(oi.sku, ''),
              'image', COALESCE(oi.image_url, ''),
              'unitPrice', oi.unit_price::NUMERIC,
              'quantity', oi.quantity,
              'lineTotal', oi.total_price::NUMERIC
            )
          )
          FROM public.order_items oi
          WHERE oi.order_id = o.id
        ), '[]'::jsonb),
        'subtotal', o.subtotal::NUMERIC,
        'discountAmount', o.discount_amount::NUMERIC,
        'shippingAmount', o.shipping_amount::NUMERIC,
        'total', o.total::NUMERIC,
        'shippingAddress', jsonb_build_object(
          'fullName', COALESCE(o.shipping_address->>'fullName', o.shipping_address->>'full_name', prof.full_name, ''),
          'phone', COALESCE(o.shipping_address->>'phone', prof.phone, ''),
          'line1', COALESCE(o.shipping_address->>'line1', ''),
          'line2', COALESCE(o.shipping_address->>'line2', ''),
          'city', COALESCE(o.shipping_address->>'city', ''),
          'state', COALESCE(o.shipping_address->>'state', ''),
          'postalCode', COALESCE(o.shipping_address->>'postalCode', o.shipping_address->>'postal_code', ''),
          'country', COALESCE(o.shipping_address->>'country', 'IN')
        ),
        'billingAddress', jsonb_build_object(
          'fullName', COALESCE(o.shipping_address->>'fullName', o.shipping_address->>'full_name', prof.full_name, ''),
          'phone', COALESCE(o.shipping_address->>'phone', prof.phone, ''),
          'line1', COALESCE(o.shipping_address->>'line1', ''),
          'line2', COALESCE(o.shipping_address->>'line2', ''),
          'city', COALESCE(o.shipping_address->>'city', ''),
          'state', COALESCE(o.shipping_address->>'state', ''),
          'postalCode', COALESCE(o.shipping_address->>'postalCode', o.shipping_address->>'postal_code', ''),
          'country', COALESCE(o.shipping_address->>'country', 'IN')
        ),
        'tracking', jsonb_build_object(
          'courier', COALESCE(o.fulfilment_courier, ''),
          'trackingNumber', COALESCE(o.tracking_number, ''),
          'trackingUrl', COALESCE(o.tracking_url, '')
        ),
        'internalNotes', COALESCE(o.internal_notes, o.notes, ''),
        'refunds', CASE WHEN jsonb_typeof(o.refunds) = 'array' THEN o.refunds ELSE '[]'::jsonb END,
        'activities', CASE WHEN jsonb_typeof(o.activities) = 'array' THEN o.activities ELSE '[]'::jsonb END,
        'createdAt', o.created_at,
        'updatedAt', o.updated_at
      )
      ORDER BY o.created_at DESC
    ),
    '[]'::jsonb
  ) INTO v_orders
  FROM public.orders o
  LEFT JOIN public.profiles prof ON prof.id = o.user_id;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'fullName', COALESCE(NULLIF(p.full_name, ''), p.email),
        'email', COALESCE(p.email, ''),
        'phone', COALESCE(p.phone, ''),
        'role', p.role,
        'status', p.status,
        'segment', p.segment,
        'emailOptIn', p.email_opt_in,
        'tags', COALESCE(to_jsonb(p.tags), '[]'::jsonb),
        'notes', COALESCE(p.notes, ''),
        'addresses', COALESCE((
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', a.id,
              'label', a.label,
              'type', CASE WHEN LOWER(a.label) = 'billing' THEN 'Billing' ELSE 'Shipping' END,
              'fullName', a.full_name,
              'phone', COALESCE(p.phone, ''),
              'line1', a.line1,
              'line2', COALESCE(a.line2, ''),
              'city', a.city,
              'state', COALESCE(a.state, ''),
              'postalCode', a.postal_code,
              'country', a.country,
              'isDefault', a.is_default
            )
            ORDER BY a.is_default DESC, a.created_at ASC
          )
          FROM public.addresses a
          WHERE a.user_id = p.id
        ), '[]'::jsonb),
        'joinedAt', p.created_at,
        'lastActiveAt', p.last_active_at
      )
      ORDER BY p.created_at DESC
    ),
    '[]'::jsonb
  ) INTO v_customers
  FROM public.profiles p
  WHERE p.role = 'customer';

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'fullName', COALESCE(NULLIF(p.full_name, ''), p.email),
        'email', COALESCE(p.email, ''),
        'phone', COALESCE(p.phone, ''),
        'role', p.role,
        'title', COALESCE(p.title, 'Administrator'),
        'status', CASE WHEN p.status = 'Blocked' THEN 'Suspended' ELSE 'Active' END,
        'lastActiveAt', p.last_active_at,
        'createdAt', p.created_at
      )
      ORDER BY p.created_at ASC
    ),
    '[]'::jsonb
  ) INTO v_admins
  FROM public.profiles p
  WHERE p.role = 'admin';

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', l.id,
        'timestamp', l.created_at,
        'actorId', COALESCE(l.actor_id::TEXT, ''),
        'actorName', l.actor_name,
        'actorRole', 'admin',
        'module', l.module,
        'action', l.action,
        'target', l.target,
        'details', l.details
      )
      ORDER BY l.created_at DESC
    ),
    '[]'::jsonb
  ) INTO v_logs
  FROM (
    SELECT * FROM public.admin_activity_logs
    ORDER BY created_at DESC
    LIMIT 200
  ) l;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'date', ds.date::TEXT,
        'label', TO_CHAR(ds.date, 'DD Mon'),
        'visitors', ds.unique_visitors,
        'sessions', GREATEST(ds.unique_visitors, ds.page_views),
        'pageViews', ds.page_views,
        'newSignups', ds.new_signups
      )
      ORDER BY ds.date ASC
    ),
    '[]'::jsonb
  ) INTO v_visitors
  FROM (
    SELECT * FROM public.daily_stats
    ORDER BY date DESC
    LIMIT 90
  ) ds;

  RETURN jsonb_build_object(
    'settings', v_settings,
    'collections', v_collections,
    'products', v_products,
    'orders', v_orders,
    'customers', v_customers,
    'admins', v_admins,
    'activityLogs', v_logs,
    'visitorMetrics', v_visitors
  );
END;
$$;

-- ------------------------------------------------------------
-- 10. ADMIN MUTATION RPCs
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_upsert_collection(
  p_token_hash TEXT,
  p_payload    JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin RECORD;
  v_id    UUID;
  v_name  TEXT;
  v_slug  TEXT;
BEGIN
  SELECT * INTO v_admin FROM public._verify_admin_session(p_token_hash) LIMIT 1;

  v_name := TRIM(COALESCE(p_payload->>'name', ''));
  IF v_name = '' THEN
    RAISE EXCEPTION 'Collection name is required';
  END IF;

  v_slug := LOWER(REGEXP_REPLACE(
    COALESCE(NULLIF(TRIM(p_payload->>'slug'), ''), v_name),
    '[^a-z0-9]+', '-', 'g'
  ));
  v_slug := TRIM(BOTH '-' FROM v_slug);

  IF NULLIF(TRIM(COALESCE(p_payload->>'id', '')), '') IS NOT NULL THEN
    v_id := (p_payload->>'id')::UUID;
    UPDATE public.collections
    SET name        = v_name,
        slug        = v_slug,
        description = NULLIF(TRIM(COALESCE(p_payload->>'description', '')), ''),
        cover_image = NULLIF(TRIM(COALESCE(p_payload->>'coverImage', '')), ''),
        season      = NULLIF(TRIM(COALESCE(p_payload->>'season', '')), ''),
        is_active   = COALESCE((p_payload->>'isActive')::BOOLEAN, TRUE),
        sort_order  = COALESCE((p_payload->>'sortOrder')::INT, 0),
        updated_at  = NOW()
    WHERE id = v_id;
  ELSE
    INSERT INTO public.collections (name, slug, description, cover_image, season, is_active, sort_order)
    VALUES (
      v_name,
      v_slug,
      NULLIF(TRIM(COALESCE(p_payload->>'description', '')), ''),
      NULLIF(TRIM(COALESCE(p_payload->>'coverImage', '')), ''),
      NULLIF(TRIM(COALESCE(p_payload->>'season', '')), ''),
      COALESCE((p_payload->>'isActive')::BOOLEAN, TRUE),
      COALESCE((p_payload->>'sortOrder')::INT, 0)
    )
    RETURNING id INTO v_id;
  END IF;

  INSERT INTO public.admin_activity_logs (actor_id, actor_name, module, action, target, details)
  VALUES (v_admin.admin_id, v_admin.admin_name, 'collections', 'Saved collection', v_name, 'Slug: ' || v_slug);

  RETURN jsonb_build_object('id', v_id, 'slug', v_slug);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_collection(
  p_token_hash TEXT,
  p_id         UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin RECORD;
  v_name  TEXT;
BEGIN
  SELECT * INTO v_admin FROM public._verify_admin_session(p_token_hash) LIMIT 1;

  SELECT name INTO v_name FROM public.collections WHERE id = p_id;
  DELETE FROM public.collections WHERE id = p_id;

  IF v_name IS NOT NULL THEN
    INSERT INTO public.admin_activity_logs (actor_id, actor_name, module, action, target, details)
    VALUES (v_admin.admin_id, v_admin.admin_name, 'collections', 'Deleted collection', v_name, '');
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_upsert_product(
  p_token_hash TEXT,
  p_payload    JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin         RECORD;
  v_id            UUID;
  v_name          TEXT;
  v_slug          TEXT;
  v_status        TEXT;
  v_first_col_id  UUID;
  v_item          JSONB;
  v_idx           INT := 0;
  v_col_id        UUID;
BEGIN
  SELECT * INTO v_admin FROM public._verify_admin_session(p_token_hash) LIMIT 1;

  v_name := TRIM(COALESCE(p_payload->>'name', ''));
  IF v_name = '' THEN
    RAISE EXCEPTION 'Product name is required';
  END IF;

  v_slug := LOWER(REGEXP_REPLACE(
    COALESCE(NULLIF(TRIM(p_payload->>'slug'), ''), v_name),
    '[^a-z0-9]+', '-', 'g'
  ));
  v_slug := TRIM(BOTH '-' FROM v_slug);

  v_status := COALESCE(NULLIF(p_payload->>'status', ''), 'Active');
  IF v_status NOT IN ('Draft', 'Active', 'Archived') THEN
    v_status := 'Draft';
  END IF;

  SELECT (val)::UUID INTO v_first_col_id
  FROM jsonb_array_elements_text(COALESCE(p_payload->'collectionIds', '[]'::jsonb)) AS val
  LIMIT 1;

  IF NULLIF(TRIM(COALESCE(p_payload->>'id', '')), '') IS NOT NULL THEN
    v_id := (p_payload->>'id')::UUID;
    UPDATE public.products
    SET slug                = v_slug,
        collection_id       = v_first_col_id,
        name                = v_name,
        subtitle            = NULLIF(TRIM(COALESCE(p_payload->>'subtitle', '')), ''),
        description         = COALESCE(p_payload->>'description', ''),
        category            = COALESCE(NULLIF(TRIM(p_payload->>'category'), ''), 'apparel'),
        subcategory         = COALESCE(TRIM(p_payload->>'subcategory'), ''),
        collection_label    = COALESCE(NULLIF(TRIM(p_payload->>'collection'), ''), 'DROP 01'),
        status              = v_status,
        is_active           = (v_status = 'Active'),
        price               = COALESCE((p_payload->>'price')::NUMERIC, 0),
        compare_price       = NULLIF(COALESCE(p_payload->>'compareAtPrice', ''), '')::NUMERIC,
        cost_price          = COALESCE((p_payload->>'costPrice')::NUMERIC, 0),
        sku                 = NULLIF(UPPER(TRIM(COALESCE(p_payload->>'sku', ''))), ''),
        low_stock_threshold = GREATEST(1, COALESCE((p_payload->>'lowStockThreshold')::INT, 5)),
        is_featured         = COALESCE((p_payload->>'isFeatured')::BOOLEAN, FALSE),
        is_bestseller       = COALESCE((p_payload->>'isBestseller')::BOOLEAN, FALSE),
        is_new_arrival      = COALESCE((p_payload->>'isNewArrival')::BOOLEAN, FALSE),
        promo_label         = NULLIF(TRIM(COALESCE(p_payload->>'promoLabel', '')), ''),
        materials           = COALESCE(p_payload->>'materials', ''),
        care_instructions   = COALESCE(p_payload->>'care', ''),
        details             = COALESCE(p_payload->'details', '[]'::jsonb),
        seo_title           = NULLIF(TRIM(COALESCE(p_payload->>'seoTitle', '')), ''),
        seo_description     = NULLIF(TRIM(COALESCE(p_payload->>'seoDescription', '')), ''),
        updated_at          = NOW()
    WHERE id = v_id;
  ELSE
    INSERT INTO public.products (
      slug, collection_id, name, subtitle, description, category, subcategory,
      collection_label, status, is_active, price, compare_price, cost_price,
      sku, low_stock_threshold, is_featured, is_bestseller, is_new_arrival,
      promo_label, materials, care_instructions, details, seo_title, seo_description
    ) VALUES (
      v_slug,
      v_first_col_id,
      v_name,
      NULLIF(TRIM(COALESCE(p_payload->>'subtitle', '')), ''),
      COALESCE(p_payload->>'description', ''),
      COALESCE(NULLIF(TRIM(p_payload->>'category'), ''), 'apparel'),
      COALESCE(TRIM(p_payload->>'subcategory'), ''),
      COALESCE(NULLIF(TRIM(p_payload->>'collection'), ''), 'DROP 01'),
      v_status,
      (v_status = 'Active'),
      COALESCE((p_payload->>'price')::NUMERIC, 0),
      NULLIF(COALESCE(p_payload->>'compareAtPrice', ''), '')::NUMERIC,
      COALESCE((p_payload->>'costPrice')::NUMERIC, 0),
      NULLIF(UPPER(TRIM(COALESCE(p_payload->>'sku', ''))), ''),
      GREATEST(1, COALESCE((p_payload->>'lowStockThreshold')::INT, 5)),
      COALESCE((p_payload->>'isFeatured')::BOOLEAN, FALSE),
      COALESCE((p_payload->>'isBestseller')::BOOLEAN, FALSE),
      COALESCE((p_payload->>'isNewArrival')::BOOLEAN, FALSE),
      NULLIF(TRIM(COALESCE(p_payload->>'promoLabel', '')), ''),
      COALESCE(p_payload->>'materials', ''),
      COALESCE(p_payload->>'care', ''),
      COALESCE(p_payload->'details', '[]'::jsonb),
      NULLIF(TRIM(COALESCE(p_payload->>'seoTitle', '')), ''),
      NULLIF(TRIM(COALESCE(p_payload->>'seoDescription', '')), '')
    )
    RETURNING id INTO v_id;
  END IF;

  -- Sync multi-collection assignments
  DELETE FROM public.product_collections WHERE product_id = v_id;
  FOR v_col_id IN
    SELECT DISTINCT (val)::UUID
    FROM jsonb_array_elements_text(COALESCE(p_payload->'collectionIds', '[]'::jsonb)) AS val
    WHERE TRIM(val) <> ''
  LOOP
    INSERT INTO public.product_collections (product_id, collection_id)
    VALUES (v_id, v_col_id)
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Sync Cloudinary media (images & videos)
  DELETE FROM public.product_images WHERE product_id = v_id;
  v_idx := 0;
  FOR v_item IN SELECT * FROM jsonb_array_elements(COALESCE(p_payload->'media', '[]'::jsonb))
  LOOP
    IF COALESCE(TRIM(v_item->>'url'), '') <> '' THEN
      INSERT INTO public.product_images (product_id, url, media_type, alt_text, sort_order, is_primary)
      VALUES (
        v_id,
        TRIM(v_item->>'url'),
        CASE WHEN (v_item->>'mediaType') = 'video' THEN 'video' ELSE 'image' END,
        NULLIF(TRIM(COALESCE(v_item->>'altText', '')), ''),
        v_idx,
        COALESCE((v_item->>'isPrimary')::BOOLEAN, v_idx = 0)
      );
      v_idx := v_idx + 1;
    END IF;
  END LOOP;

  -- Sync product variants
  DELETE FROM public.product_variants WHERE product_id = v_id;
  FOR v_item IN SELECT * FROM jsonb_array_elements(COALESCE(p_payload->'variants', '[]'::jsonb))
  LOOP
    INSERT INTO public.product_variants (product_id, size, color_name, color_hex, sku, stock_qty, is_active)
    VALUES (
      v_id,
      COALESCE(NULLIF(TRIM(v_item->>'size'), ''), 'One Size'),
      COALESCE(NULLIF(TRIM(v_item->>'color'), ''), 'Default'),
      COALESCE(NULLIF(TRIM(v_item->>'colorHex'), ''), '#26231F'),
      NULLIF(UPPER(TRIM(COALESCE(v_item->>'sku', ''))), ''),
      GREATEST(0, COALESCE((v_item->>'stock')::INT, 0)),
      COALESCE((v_item->>'inStock')::BOOLEAN, COALESCE((v_item->>'stock')::INT, 0) > 0)
    );
  END LOOP;

  INSERT INTO public.admin_activity_logs (actor_id, actor_name, module, action, target, details)
  VALUES (v_admin.admin_id, v_admin.admin_name, 'products', 'Saved product', v_name, 'Status: ' || v_status);

  RETURN jsonb_build_object('id', v_id, 'slug', v_slug);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_product_status(
  p_token_hash TEXT,
  p_ids        UUID[],
  p_status     TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin RECORD;
BEGIN
  SELECT * INTO v_admin FROM public._verify_admin_session(p_token_hash) LIMIT 1;

  IF p_status NOT IN ('Draft', 'Active', 'Archived') THEN
    RAISE EXCEPTION 'Invalid product status';
  END IF;

  UPDATE public.products
  SET status     = p_status,
      is_active  = (p_status = 'Active'),
      updated_at = NOW()
  WHERE id = ANY(p_ids);

  INSERT INTO public.admin_activity_logs (actor_id, actor_name, module, action, target, details)
  VALUES (v_admin.admin_id, v_admin.admin_name, 'products', 'Updated status to ' || p_status, COALESCE(array_length(p_ids, 1), 0) || ' products', '');
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_products(
  p_token_hash TEXT,
  p_ids        UUID[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin RECORD;
BEGIN
  SELECT * INTO v_admin FROM public._verify_admin_session(p_token_hash) LIMIT 1;

  DELETE FROM public.products WHERE id = ANY(p_ids);

  INSERT INTO public.admin_activity_logs (actor_id, actor_name, module, action, target, details)
  VALUES (v_admin.admin_id, v_admin.admin_name, 'products', 'Deleted products', COALESCE(array_length(p_ids, 1), 0) || ' products', '');
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_order(
  p_token_hash TEXT,
  p_payload    JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin  RECORD;
  v_id     UUID;
  v_num    TEXT;
BEGIN
  SELECT * INTO v_admin FROM public._verify_admin_session(p_token_hash) LIMIT 1;
  v_id := (p_payload->>'id')::UUID;

  SELECT order_number INTO v_num FROM public.orders WHERE id = v_id;

  UPDATE public.orders
  SET status             = COALESCE(NULLIF(p_payload->>'status', ''), status),
      payment_status     = COALESCE(NULLIF(p_payload->>'paymentStatus', ''), payment_status),
      fulfilment_courier = COALESCE(p_payload->'tracking'->>'courier', fulfilment_courier),
      tracking_number    = COALESCE(p_payload->'tracking'->>'trackingNumber', tracking_number),
      tracking_url       = COALESCE(p_payload->'tracking'->>'trackingUrl', tracking_url),
      internal_notes     = COALESCE(p_payload->>'internalNotes', internal_notes),
      refunds            = COALESCE(p_payload->'refunds', refunds),
      activities         = COALESCE(p_payload->'activities', activities),
      updated_at         = NOW()
  WHERE id = v_id;

  INSERT INTO public.admin_activity_logs (actor_id, actor_name, module, action, target, details)
  VALUES (v_admin.admin_id, v_admin.admin_name, 'orders', 'Updated order', COALESCE(v_num, v_id::TEXT), COALESCE(p_payload->>'logDetail', ''));
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_upsert_user(
  p_token_hash TEXT,
  p_payload    JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_admin    RECORD;
  v_id       UUID;
  v_email    TEXT;
  v_role     TEXT;
  v_name     TEXT;
  v_password TEXT;
  v_addr     JSONB;
BEGIN
  SELECT * INTO v_admin FROM public._verify_admin_session(p_token_hash) LIMIT 1;

  v_email := LOWER(TRIM(COALESCE(p_payload->>'email', '')));
  v_name := NULLIF(TRIM(COALESCE(p_payload->>'fullName', '')), '');
  v_role := CASE WHEN (p_payload->>'role') = 'admin' THEN 'admin' ELSE 'customer' END;
  v_password := p_payload->>'password';

  IF NULLIF(TRIM(COALESCE(p_payload->>'id', '')), '') IS NOT NULL THEN
    v_id := (p_payload->>'id')::UUID;
    UPDATE public.profiles
    SET full_name    = COALESCE(v_name, full_name),
        phone        = COALESCE(p_payload->>'phone', phone),
        role         = CASE WHEN p_payload ? 'role' THEN v_role ELSE role END,
        title        = COALESCE(p_payload->>'title', title),
        status       = COALESCE(NULLIF(p_payload->>'status', ''), status),
        segment      = COALESCE(NULLIF(p_payload->>'segment', ''), segment),
        email_opt_in = COALESCE((p_payload->>'emailOptIn')::BOOLEAN, email_opt_in),
        tags         = CASE
          WHEN p_payload ? 'tags' AND jsonb_typeof(p_payload->'tags') = 'array'
            THEN ARRAY(SELECT jsonb_array_elements_text(p_payload->'tags'))
          ELSE tags
        END,
        notes        = COALESCE(p_payload->>'notes', notes),
        updated_at   = NOW()
    WHERE id = v_id;
  ELSE
    IF v_email = '' OR POSITION('@' IN v_email) = 0 THEN
      RAISE EXCEPTION 'Valid email address is required';
    END IF;
    IF EXISTS (SELECT 1 FROM public.profiles WHERE LOWER(email) = v_email) THEN
      RAISE EXCEPTION 'An account with this email already exists';
    END IF;

    INSERT INTO public.profiles (
      email, full_name, phone, role, title, status, segment, email_opt_in, tags, notes, auth_provider
    ) VALUES (
      v_email,
      v_name,
      NULLIF(TRIM(COALESCE(p_payload->>'phone', '')), ''),
      v_role,
      NULLIF(TRIM(COALESCE(p_payload->>'title', '')), ''),
      COALESCE(NULLIF(p_payload->>'status', ''), 'Active'),
      COALESCE(NULLIF(p_payload->>'segment', ''), 'First-Time'),
      COALESCE((p_payload->>'emailOptIn')::BOOLEAN, TRUE),
      CASE
        WHEN p_payload ? 'tags' AND jsonb_typeof(p_payload->'tags') = 'array'
          THEN ARRAY(SELECT jsonb_array_elements_text(p_payload->'tags'))
        ELSE '{}'::TEXT[]
      END,
      COALESCE(p_payload->>'notes', ''),
      'email'
    )
    RETURNING id INTO v_id;

    IF v_password IS NOT NULL AND LENGTH(v_password) >= 6 THEN
      INSERT INTO public.user_credentials (user_id, password_hash)
      VALUES (v_id, crypt(v_password, gen_salt('bf', 10)))
      ON CONFLICT (user_id) DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = NOW();
    END IF;
  END IF;

  IF p_payload ? 'addresses' AND jsonb_typeof(p_payload->'addresses') = 'array' THEN
    DELETE FROM public.addresses WHERE user_id = v_id;
    FOR v_addr IN SELECT * FROM jsonb_array_elements(p_payload->'addresses')
    LOOP
      INSERT INTO public.addresses (user_id, label, full_name, line1, line2, city, state, postal_code, country, is_default)
      VALUES (
        v_id,
        COALESCE(NULLIF(v_addr->>'label', ''), 'Home'),
        COALESCE(NULLIF(v_addr->>'fullName', ''), COALESCE(v_name, v_email)),
        COALESCE(v_addr->>'line1', ''),
        NULLIF(COALESCE(v_addr->>'line2', ''), ''),
        COALESCE(v_addr->>'city', ''),
        NULLIF(COALESCE(v_addr->>'state', ''), ''),
        COALESCE(v_addr->>'postalCode', ''),
        COALESCE(NULLIF(v_addr->>'country', ''), 'IN'),
        COALESCE((v_addr->>'isDefault')::BOOLEAN, FALSE)
      );
    END LOOP;
  END IF;

  INSERT INTO public.admin_activity_logs (actor_id, actor_name, module, action, target, details)
  VALUES (v_admin.admin_id, v_admin.admin_name, 'users', 'Saved user account', COALESCE(v_name, v_email), 'Role: ' || v_role);

  RETURN jsonb_build_object('id', v_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_settings(
  p_token_hash TEXT,
  p_payload    JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin RECORD;
BEGIN
  SELECT * INTO v_admin FROM public._verify_admin_session(p_token_hash) LIMIT 1;

  IF p_payload ? 'storeSettings' THEN
    INSERT INTO public.store_settings (id, delivery_charge, free_shipping_threshold, favicon_url, updated_at)
    VALUES (
      1,
      GREATEST(0, COALESCE((p_payload->'storeSettings'->>'deliveryCharge')::NUMERIC, 149)),
      GREATEST(0, COALESCE((p_payload->'storeSettings'->>'freeShippingThreshold')::NUMERIC, 2999)),
      NULLIF(TRIM(COALESCE(p_payload->'storeSettings'->>'faviconUrl', '')), ''),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET delivery_charge         = EXCLUDED.delivery_charge,
        free_shipping_threshold = EXCLUDED.free_shipping_threshold,
        favicon_url             = EXCLUDED.favicon_url,
        updated_at              = NOW();

    INSERT INTO public.admin_activity_logs (actor_id, actor_name, module, action, target, details)
    VALUES (
      v_admin.admin_id,
      v_admin.admin_name,
      'settings',
      'Updated storefront settings',
      'Delivery & Branding',
      'Delivery ₹' || COALESCE((p_payload->'storeSettings'->>'deliveryCharge'), '149') ||
      ' / Free above ₹' || COALESCE((p_payload->'storeSettings'->>'freeShippingThreshold'), '2999')
    );
  END IF;

  IF p_payload ? 'ownProfile' THEN
    UPDATE public.profiles
    SET full_name  = COALESCE(NULLIF(TRIM(p_payload->'ownProfile'->>'fullName'), ''), full_name),
        phone      = COALESCE(p_payload->'ownProfile'->>'phone', phone),
        title      = COALESCE(p_payload->'ownProfile'->>'title', title),
        updated_at = NOW()
    WHERE id = v_admin.admin_id;

    INSERT INTO public.admin_activity_logs (actor_id, actor_name, module, action, target, details)
    VALUES (v_admin.admin_id, v_admin.admin_name, 'settings', 'Updated own profile', v_admin.admin_name, '');
  END IF;
END;
$$;

-- Lock down execute privileges cleanly
REVOKE ALL ON FUNCTION public._verify_admin_session(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_store_bootstrap() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_store_page_view(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_get_workspace(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_upsert_collection(TEXT, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_delete_collection(TEXT, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_upsert_product(TEXT, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_update_product_status(TEXT, UUID[], TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_delete_products(TEXT, UUID[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_update_order(TEXT, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_upsert_user(TEXT, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_update_settings(TEXT, JSONB) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_store_bootstrap() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_store_page_view(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_get_workspace(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_upsert_collection(TEXT, JSONB) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_delete_collection(TEXT, UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_upsert_product(TEXT, JSONB) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_update_product_status(TEXT, UUID[], TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_delete_products(TEXT, UUID[]) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_update_order(TEXT, JSONB) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_upsert_user(TEXT, JSONB) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_update_settings(TEXT, JSONB) TO anon, authenticated, service_role;

