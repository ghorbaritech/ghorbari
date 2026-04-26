const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nnrzszujwhutbgghtjwc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // SERVICE ROLE

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    const adminId = 'a201c8c5-8ede-4ab8-aa90-36ff5e1432c4';
    const orderNumber = 'GB-1772290891276-125';

    console.log(`Checking order ${orderNumber} for admin ${adminId}...`);

    // First, let's see if the order is already confirmed (it might be from my previous test)
    const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .single();

    if (fetchError) {
        console.error("Order fetch error:", fetchError);
        return;
    }

    console.log("Current order status:", order.status);

    // If it was confirmed by me, let's reset it to pending to test again
    if (order.status === 'confirmed') {
        console.log("Resetting order to pending for testing...");
        await supabase.from('orders').update({ status: 'pending', confirmed_at: null, confirmed_by: null }).eq('id', order.id);
    }

    console.log("Attempting to confirm order as admin@ghorbari.com...");
    // We update using service role but we simulate the payload the client would send
    const { data: updated, error: updateError } = await supabase
        .from('orders')
        .update({
            status: 'confirmed',
            confirmed_at: new Date().toISOString(),
            confirmed_by: adminId
        })
        .eq('id', order.id)
        .select()
        .single();

    if (updateError) {
        console.error("CONFIRMATION FAILED (even with service role?):");
        console.error(JSON.stringify(updateError, null, 2));
    } else {
        console.log("SUCCESS! Order confirmed as admin.");
        console.log("Routing info:", {
            confirmed_by: updated.confirmed_by,
            status: updated.status
        });
    }
}

debug();
