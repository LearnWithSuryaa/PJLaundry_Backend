import { supabasePublic } from "../../config/supabase";
import { OutletRow } from "../../types/database.types";
import { GetOutletsQuery } from "./outlet.schema";

export const STATIC_OUTLETS_FALLBACK: OutletRow[] = [
  {
    id: "a1111111-2222-3333-4444-555555555555",
    name: "PJLaundry Kebayoran Baru (Pusat)",
    address: "Jl. Melati No. 18, Kebayoran Baru, Jakarta Selatan",
    phone: "+62 812-3456-7890",
    opening_hours: "07:00 - 21:00",
    latitude: -6.241586,
    longitude: 106.800583,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "b2222222-3333-4444-5555-666666666666",
    name: "PJLaundry Tebet Timur",
    address: "Jl. Tebet Timur Dalam Raya No. 42, Tebet, Jakarta Selatan",
    phone: "+62 812-9876-5432",
    opening_hours: "07:30 - 21:30",
    latitude: -6.23412,
    longitude: 106.8523,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function fetchAllOutlets(query: GetOutletsQuery): Promise<{
  data: OutletRow[];
  total: number;
  isFallback?: boolean;
}> {
  const { search } = query;

  try {
    let dbQuery = supabasePublic
      .from("outlets")
      .select("*", { count: "exact" })
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (search && search.trim().length > 0) {
      dbQuery = dbQuery.or(
        `name.ilike.%${search.trim()}%,address.ilike.%${search.trim()}%`
      );
    }

    const { data, count, error } = await dbQuery;

    if (error || !data) {
      return filterFallbackOutlets(search);
    }

    return {
      data: data as OutletRow[],
      total: count ?? data.length,
      isFallback: false,
    };
  } catch {
    return filterFallbackOutlets(search);
  }
}

function filterFallbackOutlets(search?: string) {
  let list = [...STATIC_OUTLETS_FALLBACK];
  if (search && search.trim().length > 0) {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (o) =>
        o.name.toLowerCase().includes(q) || o.address.toLowerCase().includes(q)
    );
  }
  return {
    data: list,
    total: list.length,
    isFallback: true,
  };
}
