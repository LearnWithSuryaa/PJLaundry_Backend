-- ====================================================================
-- PJLAUNDRY SUPABASE POSTGRESQL INITIALIZATION SCHEMA
-- Migration: 20261109000000_init_pjlaundry_schema.sql
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Trigger Function for Updated Timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 3. TABLES DEFINITION
-- ====================================================================

-- 3.1 SERVICES (Katalog Layanan Laundry)
CREATE TABLE IF NOT EXISTS public.services (
    id VARCHAR(50) PRIMARY KEY, -- 'kiloan-komplit', 'kiloan-express', etc.
    name VARCHAR(100) NOT NULL,
    category VARCHAR(30) NOT NULL CHECK (category IN ('kiloan', 'satuan', 'special')),
    price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
    unit VARCHAR(20) NOT NULL, -- 'kg', 'pcs', 'pasang'
    min_order INT NOT NULL DEFAULT 1 CHECK (min_order > 0),
    max_order INT NOT NULL DEFAULT 50 CHECK (max_order >= min_order),
    duration VARCHAR(50) NOT NULL,
    icon VARCHAR(50) NOT NULL DEFAULT 'WashingMachine',
    is_express BOOLEAN NOT NULL DEFAULT FALSE,
    tagline TEXT NOT NULL,
    features TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.2 PROMOS (Promosi & Kupon Diskon)
CREATE TABLE IF NOT EXISTS public.promos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) UNIQUE NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(12,2) NOT NULL CHECK (discount_value > 0),
    min_order_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    max_discount DECIMAL(12,2) NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.3 OUTLETS (Daftar Cabang / Titik Operasional)
CREATE TABLE IF NOT EXISTS public.outlets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    opening_hours VARCHAR(50) NOT NULL DEFAULT '07:00 - 21:00',
    latitude DECIMAL(10,8) NULL,
    longitude DECIMAL(11,8) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.4 ORDERS (Header Pesanan Pelanggan)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    outlet_id UUID NULL REFERENCES public.outlets(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'confirmed', 'pickup_scheduled', 'processing', 'completed', 'cancelled')),
    total_price DECIMAL(12,2) NOT NULL CHECK (total_price >= 0),
    pickup_address TEXT NOT NULL,
    pickup_date VARCHAR(50) NOT NULL,
    pickup_slot VARCHAR(50) NOT NULL,
    order_notes TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.5 ORDER_ITEMS (Detail Layanan dalam Pesanan)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    service_id VARCHAR(50) NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12,2) NOT NULL CHECK (unit_price >= 0),
    subtotal DECIMAL(12,2) NOT NULL CHECK (subtotal >= 0),
    notes TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.6 REVIEWS (Ulasan Pelanggan)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id UUID NULL REFERENCES public.orders(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    user_display_name VARCHAR(100) NULL,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 4. TRIGGERS FOR TIMESTAMP UPDATES
-- ====================================================================
DROP TRIGGER IF EXISTS trigger_services_updated_at ON public.services;
CREATE TRIGGER trigger_services_updated_at BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_promos_updated_at ON public.promos;
CREATE TRIGGER trigger_promos_updated_at BEFORE UPDATE ON public.promos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_outlets_updated_at ON public.outlets;
CREATE TRIGGER trigger_outlets_updated_at BEFORE UPDATE ON public.outlets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_orders_updated_at ON public.orders;
CREATE TRIGGER trigger_orders_updated_at BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_reviews_updated_at ON public.reviews;
CREATE TRIGGER trigger_reviews_updated_at BEFORE UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- 5. INDEXES FOR PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON public.services(is_active);
CREATE INDEX IF NOT EXISTS idx_promos_dates ON public.promos(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_is_published ON public.reviews(is_published);

-- ====================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 6.1 Services: Public read-only for active services
DROP POLICY IF EXISTS "Public read active services" ON public.services;
CREATE POLICY "Public read active services" ON public.services 
    FOR SELECT USING (is_active = true);

-- 6.2 Promos: Public read-only for active promos
DROP POLICY IF EXISTS "Public read active promos" ON public.promos;
CREATE POLICY "Public read active promos" ON public.promos 
    FOR SELECT USING (is_active = true AND NOW() BETWEEN start_date AND end_date);

-- 6.3 Outlets: Public read-only for active outlets
DROP POLICY IF EXISTS "Public read active outlets" ON public.outlets;
CREATE POLICY "Public read active outlets" ON public.outlets 
    FOR SELECT USING (is_active = true);

-- 6.4 Orders: Authenticated user can view & create their own orders
DROP POLICY IF EXISTS "Users can select own orders" ON public.orders;
CREATE POLICY "Users can select own orders" ON public.orders 
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
CREATE POLICY "Users can insert own orders" ON public.orders 
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 6.5 Order Items: Linked to authenticated user's order
DROP POLICY IF EXISTS "Users can select own order items" ON public.order_items;
CREATE POLICY "Users can select own order items" ON public.order_items 
    FOR SELECT TO authenticated 
    USING (EXISTS (
        SELECT 1 FROM public.orders 
        WHERE public.orders.id = public.order_items.order_id 
        AND public.orders.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;
CREATE POLICY "Users can insert own order items" ON public.order_items 
    FOR INSERT TO authenticated 
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.orders 
        WHERE public.orders.id = public.order_items.order_id 
        AND public.orders.user_id = auth.uid()
    ));

-- 6.6 Reviews: Public read published reviews, authenticated insert own
DROP POLICY IF EXISTS "Public read published reviews" ON public.reviews;
CREATE POLICY "Public read published reviews" ON public.reviews 
    FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Users can insert own review" ON public.reviews;
CREATE POLICY "Users can insert own review" ON public.reviews 
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

