import { supabasePublic } from "../../config/supabase";
import { ServiceRow } from "../../types/database.types";
import { GetServicesQuery } from "./service.schema";

// Static fallback data matching mobile initial catalogue
export const STATIC_SERVICES_FALLBACK: ServiceRow[] = [
  {
    id: "kiloan-komplit",
    name: "Kiloan Komplit",
    category: "kiloan",
    price: 8000,
    unit: "kg",
    min_order: 3,
    max_order: 50,
    duration: "2 Hari",
    icon: "Layers",
    is_express: false,
    tagline: "Cuci bersih, kering menyeluruh, dan setrika uap rapi.",
    features: [
      "Setrika uap halus anti kusut",
      "Deterjen ramah serat kain",
      "Kemas rapi per pack wangi",
    ],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "kiloan-express",
    name: "Kiloan Kilat 24 Jam",
    category: "kiloan",
    price: 13000,
    unit: "kg",
    min_order: 3,
    max_order: 50,
    duration: "24 Jam",
    icon: "WashingMachine",
    is_express: true,
    tagline: "Prioritas kilat untuk kebutuhan cucian mendesak.",
    features: [
      "Prioritas pengerjaan 1 mesin 1 pelanggan",
      "Setrika uap mendalam",
      "Antar jemput terjadwal tepat waktu",
    ],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "kiloan-lipat",
    name: "Cuci Lipat Hemat",
    category: "kiloan",
    price: 6000,
    unit: "kg",
    min_order: 3,
    max_order: 50,
    duration: "2 Hari",
    icon: "Wind",
    is_express: false,
    tagline: "Pilihan praktis dan ekonomis untuk pakaian harian.",
    features: [
      "Pencucian dan pengeringan 100%",
      "Dipilah dan dilipat rapi",
      "Aroma segar tahan lama",
    ],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "satuan-kemeja",
    name: "Kemeja & Blouse",
    category: "satuan",
    price: 15000,
    unit: "pcs",
    min_order: 1,
    max_order: 20,
    duration: "2 Hari",
    icon: "Shirt",
    is_express: false,
    tagline: "Perawatan presisi untuk kerah tegak dan kain halus.",
    features: [
      "Pembersihan noda membandel pada kerah",
      "Setrika uap presisi tinggi",
      "Gantungan baju (hanger) gratis",
    ],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "satuan-jas",
    name: "Jas & Blazer Formal",
    category: "satuan",
    price: 35000,
    unit: "pcs",
    min_order: 1,
    max_order: 10,
    duration: "3 Hari",
    icon: "PackageCheck",
    is_express: false,
    tagline: "Dry cleaning profesional menjaga struktur bahan.",
    features: [
      "Dry cleaning solvent khusus serat wol & jas",
      "Anti susut dan anti jamur",
      "Suit cover pelindung debu eksklusif",
    ],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "special-bedcover",
    name: "Bed Cover & Selimut",
    category: "special",
    price: 25000,
    unit: "pcs",
    min_order: 1,
    max_order: 10,
    duration: "3 Hari",
    icon: "Layers",
    is_express: false,
    tagline: "Pencucian menyeluruh bebas tungau dan debu serat.",
    features: [
      "Mesin kapasitas besar pencucian optimal",
      "Pengeringan suhu terkontrol",
      "Aroma menenangkan untuk tidur lelap",
    ],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "special-sepatu",
    name: "Sepatu Sneakers & Kulit",
    category: "special",
    price: 30000,
    unit: "pasang",
    min_order: 1,
    max_order: 10,
    duration: "3 Hari",
    icon: "Footprints",
    is_express: false,
    tagline: "Deep cleaning sol, upper, dan tali sepatu.",
    features: [
      "Pembersih khusus disesuaikan bahan sepatu",
      "Treatment anti bakteri & bau kaki",
      "Pengeringan non-heat anti retak sol",
    ],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function fetchAllServices(query: GetServicesQuery): Promise<{
  data: ServiceRow[];
  total: number;
  isFallback?: boolean;
}> {
  const { category, search, page, limit } = query;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    let dbQuery = supabasePublic
      .from("services")
      .select("*", { count: "exact" })
      .eq("is_active", true)
      .order("name", { ascending: true })
      .range(from, to);

    if (category && category !== "all") {
      dbQuery = dbQuery.eq("category", category);
    }

    if (search && search.trim().length > 0) {
      dbQuery = dbQuery.or(`name.ilike.%${search.trim()}%,tagline.ilike.%${search.trim()}%`);
    }

    const { data, count, error } = await dbQuery;

    if (error || !data) {
      if (error) {
        console.warn(`[Services Service] Supabase query notice: ${error.message}. Returning cached fallback.`);
      }
      return applyFallbackFilter(query);
    }

    return {
      data: data as ServiceRow[],
      total: count ?? data.length,
      isFallback: false,
    };
  } catch (err) {
    console.warn("[Services Service] Supabase unavailable. Falling back to local data.", err);
    return applyFallbackFilter(query);
  }
}

export async function fetchServiceById(id: string): Promise<ServiceRow | null> {
  try {
    const { data, error } = await supabasePublic
      .from("services")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      const fallbackItem = STATIC_SERVICES_FALLBACK.find((s) => s.id === id);
      return fallbackItem || null;
    }

    return data as ServiceRow;
  } catch (err) {
    const fallbackItem = STATIC_SERVICES_FALLBACK.find((s) => s.id === id);
    return fallbackItem || null;
  }
}

function applyFallbackFilter(query: GetServicesQuery): {
  data: ServiceRow[];
  total: number;
  isFallback: boolean;
} {
  const { category, search, page, limit } = query;
  let items = [...STATIC_SERVICES_FALLBACK];

  if (category && category !== "all") {
    items = items.filter((s) => s.category === category);
  }

  if (search && search.trim().length > 0) {
    const q = search.trim().toLowerCase();
    items = items.filter(
      (s) => s.name.toLowerCase().includes(q) || s.tagline.toLowerCase().includes(q)
    );
  }

  const total = items.length;
  const paginated = items.slice((page - 1) * limit, page * limit);

  return {
    data: paginated,
    total,
    isFallback: true,
  };
}
