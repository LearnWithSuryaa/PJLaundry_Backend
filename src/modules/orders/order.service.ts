import { createScopedSupabaseClient, supabasePublic } from "../../config/supabase";
import { OrderItemRow, OrderRow, ServiceRow } from "../../types/database.types";
import { fetchServiceById } from "../services/service.service";
import { CreateOrderBody, GetMyOrdersQuery } from "./order.schema";

export interface OrderWithItems extends OrderRow {
  items: Array<
    OrderItemRow & {
      service?: Pick<ServiceRow, "name" | "unit" | "category">;
    }
  >;
}

export function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `PJL-${dateStr}-${randomSuffix}`;
}

export async function createOrder(
  token: string,
  payload: CreateOrderBody
): Promise<OrderWithItems> {
  const client = createScopedSupabaseClient(token);

  // 1. Fetch official price for each item to prevent client price tampering
  let calculatedTotal = 0;
  const verifiedItems: Array<{
    service_id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    notes?: string;
  }> = [];

  for (const item of payload.items) {
    const service = await fetchServiceById(item.service_id);
    if (!service) {
      throw new Error(`Layanan '${item.service_id}' tidak valid atau tidak aktif.`);
    }

    if (item.quantity < service.min_order) {
      throw new Error(
        `Jumlah minimum untuk layanan '${service.name}' adalah ${service.min_order} ${service.unit}.`
      );
    }

    if (item.quantity > service.max_order) {
      throw new Error(
        `Jumlah maksimum untuk layanan '${service.name}' adalah ${service.max_order} ${service.unit}.`
      );
    }

    const subtotal = service.price * item.quantity;
    calculatedTotal += subtotal;

    verifiedItems.push({
      service_id: item.service_id,
      quantity: item.quantity,
      unit_price: service.price,
      subtotal,
      notes: item.notes,
    });
  }

  const orderNumber = generateOrderNumber();

  // Insert the header and items in one database transaction.
  const { data: orderData, error: orderError } = await client.rpc(
    "create_order_with_items",
    {
      p_order_number: orderNumber,
      p_outlet_id: payload.outlet_id || null,
      p_total_price: calculatedTotal,
      p_pickup_address: payload.pickup_address,
      p_pickup_date: payload.pickup_date,
      p_pickup_slot: payload.pickup_slot,
      p_order_notes: payload.order_notes || null,
      p_items: verifiedItems,
    }
  );

  if (orderError || !orderData) {
    throw new Error(
      orderError?.message || "Gagal membuat pesanan di database."
    );
  }

  const orderId = orderData.id;

  const { data: itemsData, error: itemsError } = await client
    .from("order_items")
    .select("*, service:services(name, unit, category)")
    .eq("order_id", orderId);

  if (itemsError) {
    throw new Error("Pesanan dibuat, tetapi detail layanan gagal diambil.");
  }

  return {
    ...orderData,
    items: itemsData || [],
  };
}

export async function fetchUserOrders(
  token: string,
  userId: string,
  query: GetMyOrdersQuery
): Promise<{ data: OrderWithItems[]; total: number }> {
  const client = createScopedSupabaseClient(token);
  const { status, page, limit } = query;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let dbQuery = client
    .from("orders")
    .select("*, items:order_items(*, service:services(name, unit, category))", {
      count: "exact",
    })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status && status !== "all") {
    dbQuery = dbQuery.eq("status", status);
  }

  const { data, count, error } = await dbQuery;

  if (error) {
    throw new Error(error.message);
  }

  return {
    data: (data as OrderWithItems[]) || [],
    total: count ?? (data?.length || 0),
  };
}

export async function fetchUserOrderById(
  token: string,
  userId: string,
  orderId: string
): Promise<OrderWithItems | null> {
  const client = createScopedSupabaseClient(token);

  const { data, error } = await client
    .from("orders")
    .select("*, items:order_items(*, service:services(name, unit, category))")
    .eq("id", orderId)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as OrderWithItems;
}
