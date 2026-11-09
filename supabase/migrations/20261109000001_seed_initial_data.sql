-- ====================================================================
-- PJLAUNDRY INITIAL SEED DATA
-- Migration: 20261109000001_seed_initial_data.sql
-- ====================================================================

-- 1. SEED SERVICES (Preserves existing mobile data exactly)
INSERT INTO public.services (id, name, category, price, unit, min_order, max_order, duration, icon, is_express, tagline, features, is_active)
VALUES
(
    'kiloan-komplit',
    'Kiloan Komplit',
    'kiloan',
    8000.00,
    'kg',
    3,
    50,
    '2 Hari',
    'Layers',
    false,
    'Cuci bersih, kering menyeluruh, dan setrika uap rapi.',
    ARRAY['Setrika uap halus anti kusut', 'Deterjen ramah serat kain', 'Kemas rapi per pack wangi'],
    true
),
(
    'kiloan-express',
    'Kiloan Kilat 24 Jam',
    'kiloan',
    13000.00,
    'kg',
    3,
    50,
    '24 Jam',
    'WashingMachine',
    true,
    'Prioritas kilat untuk kebutuhan cucian mendesak.',
    ARRAY['Prioritas pengerjaan 1 mesin 1 pelanggan', 'Setrika uap mendalam', 'Antar jemput terjadwal tepat waktu'],
    true
),
(
    'kiloan-lipat',
    'Cuci Lipat Hemat',
    'kiloan',
    6000.00,
    'kg',
    3,
    50,
    '2 Hari',
    'Wind',
    false,
    'Pilihan praktis dan ekonomis untuk pakaian harian.',
    ARRAY['Pencucian dan pengeringan 100%', 'Dipilah dan dilipat rapi', 'Aroma segar tahan lama'],
    true
),
(
    'satuan-kemeja',
    'Kemeja & Blouse',
    'satuan',
    15000.00,
    'pcs',
    1,
    20,
    '2 Hari',
    'Shirt',
    false,
    'Perawatan presisi untuk kerah tegak dan kain halus.',
    ARRAY['Pembersihan noda membandel pada kerah', 'Setrika uap presisi tinggi', 'Gantungan baju (hanger) gratis'],
    true
),
(
    'satuan-jas',
    'Jas & Blazer Formal',
    'satuan',
    35000.00,
    'pcs',
    1,
    10,
    '3 Hari',
    'PackageCheck',
    false,
    'Dry cleaning profesional menjaga struktur bahan.',
    ARRAY['Dry cleaning solvent khusus serat wol & jas', 'Anti susut dan anti jamur', 'Suit cover pelindung debu eksklusif'],
    true
),
(
    'special-bedcover',
    'Bed Cover & Selimut',
    'special',
    25000.00,
    'pcs',
    1,
    10,
    '3 Hari',
    'Layers',
    false,
    'Pencucian menyeluruh bebas tungau dan debu serat.',
    ARRAY['Mesin kapasitas besar pencucian optimal', 'Pengeringan suhu terkontrol', 'Aroma menenangkan untuk tidur lelap'],
    true
),
(
    'special-sepatu',
    'Sepatu Sneakers & Kulit',
    'special',
    30000.00,
    'special',
    1,
    10,
    '3 Hari',
    'Footprints',
    false,
    'Deep cleaning sol, upper, dan tali sepatu.',
    ARRAY['Pembersih khusus disesuaikan bahan sepatu', 'Treatment anti bakteri & bau kaki', 'Pengeringan non-heat anti retak sol'],
    true
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    unit = EXCLUDED.unit,
    min_order = EXCLUDED.min_order,
    max_order = EXCLUDED.max_order,
    duration = EXCLUDED.duration,
    icon = EXCLUDED.icon,
    is_express = EXCLUDED.is_express,
    tagline = EXCLUDED.tagline,
    features = EXCLUDED.features,
    is_active = EXCLUDED.is_active;

-- 2. SEED PROMOS
INSERT INTO public.promos (code, title, description, discount_type, discount_value, min_order_amount, max_discount, start_date, end_date, is_active)
VALUES
(
    'PJNEW20',
    'Diskon Pelanggan Baru 20%',
    'Nikmati potongan harga 20% untuk pesanan pertama layanan Kiloan maupun Satuan di PJLaundry.',
    'percentage',
    20.00,
    25000.00,
    15000.00,
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '90 days',
    true
),
(
    'KILATHEMAT',
    'Potongan Rp 10.000 Kilat 24 Jam',
    'Cucian kilat express lebih hemat dengan potongan langsung Rp 10.000.',
    'fixed',
    10000.00,
    50000.00,
    10000.00,
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '60 days',
    true
)
ON CONFLICT (code) DO NOTHING;

-- 3. SEED OUTLETS
INSERT INTO public.outlets (name, address, phone, opening_hours, latitude, longitude, is_active)
VALUES
(
    'PJLaundry Kebayoran Baru (Pusat)',
    'Jl. Melati No. 18, Kebayoran Baru, Jakarta Selatan',
    '+62 812-3456-7890',
    '07:00 - 21:00',
    -6.241586,
    106.800583,
    true
),
(
    'PJLaundry Tebet Timur',
    'Jl. Tebet Timur Dalam Raya No. 42, Tebet, Jakarta Selatan',
    '+62 812-9876-5432',
    '07:30 - 21:30',
    -6.234120,
    106.852300,
    true
)
ON CONFLICT DO NOTHING;

