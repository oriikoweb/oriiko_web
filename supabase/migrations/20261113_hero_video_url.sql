-- ============================================================
-- ORIIKO — Add hero_video_url to store_settings
-- Run once in Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Add the column (safe to re-run with IF NOT EXISTS)
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS hero_video_url TEXT;

-- 2. Update get_store_bootstrap to expose heroVideoUrl to the storefront
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
        'deliveryCharge',         COALESCE(s.delivery_charge, 149),
        'freeShippingThreshold',  COALESCE(s.free_shipping_threshold, 2999),
        'faviconUrl',             s.favicon_url,
        'heroVideoUrl',           s.hero_video_url,
        'updatedAt',              s.updated_at
      )
      FROM public.store_settings s
      WHERE s.id = 1
    ),
    jsonb_build_object(
      'deliveryCharge',         149,
      'freeShippingThreshold',  2999,
      'faviconUrl',             NULL,
      'heroVideoUrl',           NULL,
      'updatedAt',              NOW()
    )
  ) INTO v_settings;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id',          c.id,
        'slug',        c.slug,
        'name',        c.name,
        'description', COALESCE(c.description, ''),
        'coverImage',  c.cover_image,
        'season',      c.season,
        'isActive',    c.is_active,
        'sortOrder',   c.sort_order
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
        'id',              p.id,
        'slug',            p.slug,
        'name',            p.name,
        'subtitle',        COALESCE(p.subtitle, ''),
        'collection',      COALESCE(NULLIF(p.collection_label, ''), 'DROP 01'),
        'category',        COALESCE(NULLIF(p.category, ''), 'apparel'),
        'collectionIds',   COALESCE((
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
        'price',           p.price::NUMERIC,
        'originalPrice',   p.compare_price::NUMERIC,
        'currency',        p.currency,
        'badge', CASE
          WHEN p.promo_label IS NOT NULL AND p.promo_label <> '' THEN p.promo_label
          WHEN p.is_bestseller  THEN 'Bestseller'
          WHEN p.is_new_arrival THEN 'New Arrival'
          ELSE NULL
        END,
        'discountBadge',   p.promo_label,
        'isNewArrival',    p.is_new_arrival,
        'isBestseller',    p.is_bestseller,
        'isFeatured',      p.is_featured,
        'rating',          p.average_rating::NUMERIC,
        'reviewCount',     p.review_count,
        'description',     COALESCE(p.description, ''),
        'details', CASE
          WHEN jsonb_typeof(p.details) = 'array' THEN p.details
          ELSE '[]'::jsonb
        END,
        'materials',       COALESCE(p.materials, ''),
        'care',            COALESCE(p.care_instructions, ''),
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
              'id',        pi.id,
              'url',       pi.url,
              'mediaType', pi.media_type,
              'altText',   COALESCE(pi.alt_text, ''),
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
              'id',       pv.id,
              'name',     TRIM(BOTH ' / ' FROM CONCAT_WS(' / ', NULLIF(pv.size, ''), NULLIF(pv.color_name, ''))),
              'size',     COALESCE(pv.size, 'One Size'),
              'color',    COALESCE(pv.color_name, 'Default'),
              'colorHex', COALESCE(pv.color_hex, '#26231F'),
              'sku',      COALESCE(pv.sku, ''),
              'stock',    pv.stock_qty,
              'inStock',  (pv.is_active AND pv.stock_qty > 0)
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
    'settings',    v_settings,
    'collections', v_collections,
    'products',    v_products
  );
END;
$$;

-- 3. Update admin_get_workspace to expose heroVideoUrl in settings panel
CREATE OR REPLACE FUNCTION public.admin_get_workspace(p_token_hash TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin       RECORD;
  v_settings    JSONB;
  v_collections JSONB;
  v_products    JSONB;
  v_orders      JSONB;
  v_customers   JSONB;
  v_admins      JSONB;
  v_logs        JSONB;
  v_visitors    JSONB;
BEGIN
  SELECT * INTO v_admin FROM public._verify_admin_session(p_token_hash) LIMIT 1;

  SELECT COALESCE(
    (
      SELECT jsonb_build_object(
        'deliveryCharge',        COALESCE(s.delivery_charge, 149),
        'freeShippingThreshold', COALESCE(s.free_shipping_threshold, 2999),
        'faviconUrl',            s.favicon_url,
        'heroVideoUrl',          s.hero_video_url,
        'updatedAt',             s.updated_at
      )
      FROM public.store_settings s WHERE s.id = 1
    ),
    jsonb_build_object(
      'deliveryCharge',        149,
      'freeShippingThreshold', 2999,
      'faviconUrl',            NULL,
      'heroVideoUrl',          NULL,
      'updatedAt',             NOW()
    )
  ) INTO v_settings;

  -- (rest of the function is unchanged – collections, products, orders, customers, admins, logs, visitors)
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id',           c.id,
        'slug',         c.slug,
        'name',         c.name,
        'description',  COALESCE(c.description, ''),
        'coverImage',   COALESCE(c.cover_image, ''),
        'season',       COALESCE(c.season, ''),
        'isActive',     c.is_active,
        'sortOrder',    c.sort_order,
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
        'id',               p.id,
        'slug',             p.slug,
        'name',             p.name,
        'subtitle',         COALESCE(p.subtitle, ''),
        'collection',       COALESCE(NULLIF(p.collection_label, ''), 'DROP 01'),
        'category',         COALESCE(NULLIF(p.category, ''), 'apparel'),
        'collectionIds',    COALESCE((
          SELECT jsonb_agg(pc.collection_id)
          FROM public.product_collections pc
          WHERE pc.product_id = p.id
        ), '[]'::jsonb),
        'subcategory',      COALESCE(p.subcategory, ''),
        'status',           p.status,
        'price',            p.price::NUMERIC,
        'compareAtPrice',   p.compare_price::NUMERIC,
        'costPrice',        COALESCE(p.cost_price, 0)::NUMERIC,
        'sku',              COALESCE(p.sku, ''),
        'lowStockThreshold',COALESCE(p.low_stock_threshold, 5),
        'isFeatured',       p.is_featured,
        'isBestseller',     p.is_bestseller,
        'isNewArrival',     p.is_new_arrival,
        'promoLabel',       COALESCE(p.promo_label, ''),
        'description',      COALESCE(p.description, ''),
        'details', CASE WHEN jsonb_typeof(p.details) = 'array' THEN p.details ELSE '[]'::jsonb END,
        'materials',        COALESCE(p.materials, ''),
        'care',             COALESCE(p.care_instructions, ''),
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
              'id',        pi.id,
              'url',       pi.url,
              'mediaType', pi.media_type,
              'altText',   COALESCE(pi.alt_text, ''),
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
              'id',       pv.id,
              'name',     TRIM(BOTH ' / ' FROM CONCAT_WS(' / ', NULLIF(pv.size, ''), NULLIF(pv.color_name, ''))),
              'size',     COALESCE(pv.size, 'One Size'),
              'color',    COALESCE(pv.color_name, 'Default'),
              'colorHex', COALESCE(pv.color_hex, '#26231F'),
              'sku',      COALESCE(pv.sku, ''),
              'stock',    pv.stock_qty,
              'inStock',  (pv.is_active AND pv.stock_qty > 0)
            )
            ORDER BY pv.created_at ASC
          )
          FROM public.product_variants pv
          WHERE pv.product_id = p.id
        ), '[]'::jsonb),
        'seoTitle',       COALESCE(p.seo_title, ''),
        'seoDescription', COALESCE(p.seo_description, ''),
        'salesCount',     COALESCE(p.sales_count, 0),
        'createdAt',      p.created_at,
        'updatedAt',      p.updated_at
      )
      ORDER BY p.updated_at DESC
    ),
    '[]'::jsonb
  ) INTO v_products FROM public.products p;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id',              o.id,
        'orderNumber',     o.order_number,
        'customerId',      COALESCE(o.user_id::TEXT, ''),
        'customerName',    COALESCE(NULLIF(o.shipping_address->>'fullName',''), NULLIF(o.shipping_address->>'full_name',''), prof.full_name, 'Guest Customer'),
        'customerEmail',   COALESCE(prof.email, ''),
        'customerPhone',   COALESCE(NULLIF(o.shipping_address->>'phone',''), prof.phone, ''),
        'status',          INITCAP(o.status),
        'paymentStatus',   COALESCE(o.payment_status, 'Pending'),
        'paymentMethod',   COALESCE(NULLIF(o.payment_method,''), 'UPI'),
        'paymentReference',o.payment_id,
        'items', COALESCE((
          SELECT jsonb_agg(
            jsonb_build_object(
              'id',          oi.id,
              'productId',   oi.product_id,
              'variantId',   COALESCE(oi.variant_id::TEXT, ''),
              'productName', oi.product_name,
              'variantName', COALESCE(oi.variant_label, ''),
              'sku',         COALESCE(oi.sku, ''),
              'image',       COALESCE(oi.image_url, ''),
              'unitPrice',   oi.unit_price::NUMERIC,
              'quantity',    oi.quantity,
              'lineTotal',   oi.total_price::NUMERIC
            )
          )
          FROM public.order_items oi
          WHERE oi.order_id = o.id
        ), '[]'::jsonb),
        'subtotal',        o.subtotal::NUMERIC,
        'discountAmount',  o.discount_amount::NUMERIC,
        'shippingAmount',  o.shipping_amount::NUMERIC,
        'total',           o.total::NUMERIC,
        'shippingAddress', jsonb_build_object(
          'fullName',   COALESCE(o.shipping_address->>'fullName', o.shipping_address->>'full_name', prof.full_name, ''),
          'phone',      COALESCE(o.shipping_address->>'phone', prof.phone, ''),
          'line1',      COALESCE(o.shipping_address->>'line1', ''),
          'line2',      COALESCE(o.shipping_address->>'line2', ''),
          'city',       COALESCE(o.shipping_address->>'city', ''),
          'state',      COALESCE(o.shipping_address->>'state', ''),
          'postalCode', COALESCE(o.shipping_address->>'postalCode', o.shipping_address->>'postal_code', ''),
          'country',    COALESCE(o.shipping_address->>'country', 'IN')
        ),
        'billingAddress', jsonb_build_object(
          'fullName',   COALESCE(o.shipping_address->>'fullName', o.shipping_address->>'full_name', prof.full_name, ''),
          'phone',      COALESCE(o.shipping_address->>'phone', prof.phone, ''),
          'line1',      COALESCE(o.shipping_address->>'line1', ''),
          'line2',      COALESCE(o.shipping_address->>'line2', ''),
          'city',       COALESCE(o.shipping_address->>'city', ''),
          'state',      COALESCE(o.shipping_address->>'state', ''),
          'postalCode', COALESCE(o.shipping_address->>'postalCode', o.shipping_address->>'postal_code', ''),
          'country',    COALESCE(o.shipping_address->>'country', 'IN')
        ),
        'tracking', jsonb_build_object(
          'courier',        COALESCE(o.fulfilment_courier, ''),
          'trackingNumber', COALESCE(o.tracking_number, ''),
          'trackingUrl',    COALESCE(o.tracking_url, '')
        ),
        'internalNotes', COALESCE(o.internal_notes, o.notes, ''),
        'refunds',       CASE WHEN jsonb_typeof(o.refunds)     = 'array' THEN o.refunds     ELSE '[]'::jsonb END,
        'activities',    CASE WHEN jsonb_typeof(o.activities)  = 'array' THEN o.activities  ELSE '[]'::jsonb END,
        'createdAt',     o.created_at,
        'updatedAt',     o.updated_at
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
        'id',          p.id,
        'fullName',    COALESCE(NULLIF(p.full_name, ''), p.email),
        'email',       COALESCE(p.email, ''),
        'phone',       COALESCE(p.phone, ''),
        'role',        p.role,
        'status',      p.status,
        'segment',     p.segment,
        'emailOptIn',  p.email_opt_in,
        'tags',        COALESCE(to_jsonb(p.tags), '[]'::jsonb),
        'notes',       COALESCE(p.notes, ''),
        'addresses', COALESCE((
          SELECT jsonb_agg(
            jsonb_build_object(
              'id',         a.id,
              'label',      a.label,
              'type',       CASE WHEN LOWER(a.label) = 'billing' THEN 'Billing' ELSE 'Shipping' END,
              'fullName',   a.full_name,
              'phone',      COALESCE(p.phone, ''),
              'line1',      a.line1,
              'line2',      COALESCE(a.line2, ''),
              'city',       a.city,
              'state',      COALESCE(a.state, ''),
              'postalCode', a.postal_code,
              'country',    a.country,
              'isDefault',  a.is_default
            )
            ORDER BY a.is_default DESC, a.created_at ASC
          )
          FROM public.addresses a
          WHERE a.user_id = p.id
        ), '[]'::jsonb),
        'joinedAt',     p.created_at,
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
        'id',           p.id,
        'fullName',     COALESCE(NULLIF(p.full_name, ''), p.email),
        'email',        COALESCE(p.email, ''),
        'phone',        COALESCE(p.phone, ''),
        'role',         p.role,
        'title',        COALESCE(p.title, 'Administrator'),
        'status',       CASE WHEN p.status = 'Blocked' THEN 'Suspended' ELSE 'Active' END,
        'lastActiveAt', p.last_active_at,
        'createdAt',    p.created_at
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
        'id',        l.id,
        'timestamp', l.created_at,
        'actorId',   COALESCE(l.actor_id::TEXT, ''),
        'actorName', l.actor_name,
        'actorRole', 'admin',
        'module',    l.module,
        'action',    l.action,
        'target',    l.target,
        'details',   l.details
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
        'date',       ds.date::TEXT,
        'label',      TO_CHAR(ds.date, 'DD Mon'),
        'visitors',   ds.unique_visitors,
        'sessions',   GREATEST(ds.unique_visitors, ds.page_views),
        'pageViews',  ds.page_views,
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
    'settings',       v_settings,
    'collections',    v_collections,
    'products',       v_products,
    'orders',         v_orders,
    'customers',      v_customers,
    'admins',         v_admins,
    'activityLogs',   v_logs,
    'visitorMetrics', v_visitors
  );
END;
$$;

-- 4. Update admin_update_settings to persist heroVideoUrl
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
    INSERT INTO public.store_settings (id, delivery_charge, free_shipping_threshold, favicon_url, hero_video_url, updated_at)
    VALUES (
      1,
      GREATEST(0, COALESCE((p_payload->'storeSettings'->>'deliveryCharge')::NUMERIC, 149)),
      GREATEST(0, COALESCE((p_payload->'storeSettings'->>'freeShippingThreshold')::NUMERIC, 2999)),
      NULLIF(TRIM(COALESCE(p_payload->'storeSettings'->>'faviconUrl', '')), ''),
      NULLIF(TRIM(COALESCE(p_payload->'storeSettings'->>'heroVideoUrl', '')), ''),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET delivery_charge         = EXCLUDED.delivery_charge,
        free_shipping_threshold = EXCLUDED.free_shipping_threshold,
        favicon_url             = EXCLUDED.favicon_url,
        hero_video_url          = EXCLUDED.hero_video_url,
        updated_at              = NOW();

    INSERT INTO public.admin_activity_logs (actor_id, actor_name, module, action, target, details)
    VALUES (
      v_admin.admin_id,
      v_admin.admin_name,
      'settings',
      'Updated storefront settings',
      'Delivery & Branding',
      'Delivery ₹' || COALESCE((p_payload->'storeSettings'->>'deliveryCharge'), '149') ||
      ' / Free above ₹' || COALESCE((p_payload->'storeSettings'->>'freeShippingThreshold'), '2999') ||
      CASE WHEN NULLIF(TRIM(COALESCE(p_payload->'storeSettings'->>'heroVideoUrl', '')), '') IS NOT NULL
           THEN ' / Hero video updated' ELSE '' END
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

