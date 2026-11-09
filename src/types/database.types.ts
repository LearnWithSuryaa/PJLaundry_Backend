export interface ServiceRow {
  id: string;
  name: string;
  category: "kiloan" | "satuan" | "special";
  price: number;
  unit: string;
  min_order: number;
  max_order: number;
  duration: string;
  icon: string;
  is_express: boolean;
  tagline: string;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PromoRow {
  id: string;
  code: string;
  title: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_discount: number | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OutletRow {
  id: string;
  name: string;
  address: string;
  phone: string;
  opening_hours: string;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderRow {
  id: string;
  order_number: string;
  user_id: string;
  outlet_id: string | null;
  status: "pending" | "confirmed" | "pickup_scheduled" | "processing" | "completed" | "cancelled";
  total_price: number;
  pickup_address: string;
  pickup_date: string;
  pickup_slot: string;
  order_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  service_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes: string | null;
  created_at: string;
}

export interface ReviewRow {
  id: string;
  user_id: string;
  order_id: string | null;
  rating: number;
  comment: string;
  user_display_name: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

