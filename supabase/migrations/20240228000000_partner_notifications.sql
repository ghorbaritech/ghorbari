-- PARTNER NOTIFICATION SYSTEM
-- Trigger notifications when a new order is assigned to a seller

CREATE OR REPLACE FUNCTION public.notify_partner_on_order_assignment()
RETURNS TRIGGER AS $$
DECLARE
    seller_user_id UUID;
BEGIN
    -- Get the user_id associated with the seller
    SELECT user_id INTO seller_user_id 
    FROM public.sellers 
    WHERE id = NEW.seller_id;

    IF seller_user_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, title, message, link)
        VALUES (
            seller_user_id,
            'New Order Assigned!',
            'You have a new order #' || NEW.order_number || '. Total: ৳' || NEW.total_amount,
            '/orders/' || NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on INSERT to orders table
DROP TRIGGER IF EXISTS tr_notify_partner_on_order ON public.orders;
CREATE TRIGGER tr_notify_partner_on_order
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_partner_on_order_assignment();

-- Note: In the future, we could add a trigger for status changes if needed.
