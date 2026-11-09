-- Create an order and all of its items atomically.
CREATE OR REPLACE FUNCTION public.create_order_with_items(
    p_order_number VARCHAR(50),
    p_outlet_id UUID,
    p_total_price DECIMAL(12,2),
    p_pickup_address TEXT,
    p_pickup_date VARCHAR(50),
    p_pickup_slot VARCHAR(50),
    p_order_notes TEXT,
    p_items JSONB
)
RETURNS public.orders
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    created_order public.orders;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication is required';
    END IF;

    INSERT INTO public.orders (
        order_number,
        user_id,
        outlet_id,
        status,
        total_price,
        pickup_address,
        pickup_date,
        pickup_slot,
        order_notes
    )
    VALUES (
        p_order_number,
        auth.uid(),
        p_outlet_id,
        'confirmed',
        p_total_price,
        p_pickup_address,
        p_pickup_date,
        p_pickup_slot,
        p_order_notes
    )
    RETURNING * INTO created_order;

    INSERT INTO public.order_items (
        order_id,
        service_id,
        quantity,
        unit_price,
        subtotal,
        notes
    )
    SELECT
        created_order.id,
        item.service_id,
        item.quantity,
        item.unit_price,
        item.subtotal,
        item.notes
    FROM jsonb_to_recordset(p_items) AS item(
        service_id VARCHAR(50),
        quantity DECIMAL(10,2),
        unit_price DECIMAL(12,2),
        subtotal DECIMAL(12,2),
        notes TEXT
    );

    RETURN created_order;
END;
$$;

REVOKE ALL ON FUNCTION public.create_order_with_items(
    VARCHAR(50), UUID, DECIMAL(12,2), TEXT, VARCHAR(50), VARCHAR(50), TEXT, JSONB
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order_with_items(
    VARCHAR(50), UUID, DECIMAL(12,2), TEXT, VARCHAR(50), VARCHAR(50), TEXT, JSONB
) TO authenticated;
