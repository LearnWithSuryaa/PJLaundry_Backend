import { supabasePublic } from "../../config/supabase";
import { PromoRow } from "../../types/database.types";
import { GetPromosQuery } from "./promo.schema";

export const STATIC_PROMOS_FALLBACK: PromoRow[] = [
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    code: "PJNEW20",
    title: "Diskon Pelanggan Baru 20%",
    description:
      "Nikmati potongan harga 20% untuk pesanan pertama layanan Kiloan maupun Satuan di PJLaundry.",
    discount_type: "percentage",
    discount_value: 20,
    min_order_amount: 25000,
    max_discount: 15000,
    start_date: new Date(Date.now() - 86400000).toISOString(),
    end_date: new Date(Date.now() + 86400000 * 90).toISOString(),
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "c9bf9e57-1685-4c89-bafb-ff5af830be8a",
    code: "KILATHEMAT",
    title: "Potongan Rp 10.000 Kilat 24 Jam",
    description:
      "Cucian kilat express lebih hemat dengan potongan langsung Rp 10.000.",
    discount_type: "fixed",
    discount_value: 10000,
    min_order_amount: 50000,
    max_discount: 10000,
    start_date: new Date(Date.now() - 86400000).toISOString(),
    end_date: new Date(Date.now() + 86400000 * 60).toISOString(),
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function fetchAllPromos(query: GetPromosQuery): Promise<{
  data: PromoRow[];
  total: number;
  isFallback?: boolean;
}> {
  try {
    let dbQuery = supabasePublic
      .from("promos")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (query.activeOnly) {
      const now = new Date().toISOString();
      dbQuery = dbQuery
        .eq("is_active", true)
        .lte("start_date", now)
        .gte("end_date", now);
    }

    const { data, count, error } = await dbQuery;

    if (error || !data) {
      return {
        data: STATIC_PROMOS_FALLBACK,
        total: STATIC_PROMOS_FALLBACK.length,
        isFallback: true,
      };
    }

    return {
      data: data as PromoRow[],
      total: count ?? data.length,
      isFallback: false,
    };
  } catch {
    return {
      data: STATIC_PROMOS_FALLBACK,
      total: STATIC_PROMOS_FALLBACK.length,
      isFallback: true,
    };
  }
}
