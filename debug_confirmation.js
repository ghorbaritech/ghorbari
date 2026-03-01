const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nnrzszujwhutbgghtjwc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucnpzenVqd2h1dGJnZ2h0andjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE1MzQwNiwiZXhwIjoyMDg0NzI5NDA2fQ.FIELkWJzaSclk8u5u6TyUuSf5EQ3kR5rYUs3rMeNWzQ'; // SERVICE ROLE

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    console.log("Finding admin user...");
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'admin')
        .limit(1);

    if (profileError) {
        console.error("Error fetching profiles:", profileError);
        return;
    }

    if (!profiles || profiles.length === 0) {
        console.error("No admin profile found!");
        return;
    }

    const admin = profiles[0];
    console.log("Found admin:", admin.email, "(ID:", admin.id, ")");

    const orderNumber = 'GB-1772290891276-125';
    console.log(`Finding order ${orderNumber}...`);
    const { data: orders, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .limit(1);

    if (orderError) {
        console.error("Error fetching order:", orderError);
        return;
    }

    if (!orders || orders.length === 0) {
        console.error("Order not found!");
        // List some pending orders instead
        const { data: pendingOrders } = await supabase
            .from('orders')
            .select('*')
            .eq('status', 'pending')
            .limit(5);
        console.log("Pending orders available:", pendingOrders.map(o => o.order_number));
        return;
    }

    const order = orders[0];
    console.log("Found order ID:", order.id, "Status:", order.status);

    console.log("Attempting to confirm order...");
    const { data: updated, error: updateError } = await supabase
        .from('orders')
        .update({
            status: 'confirmed',
            confirmed_at: new Date().toISOString(),
            confirmed_by: admin.id
        })
        .eq('id', order.id)
        .select()
        .single();

    if (updateError) {
        console.error("CONFIRMATION FAILED:");
        console.error(JSON.stringify(updateError, null, 2));
    } else {
        console.log("SUCCESS! Order confirmed.");
        console.log(updated);
    }
}

debug();
