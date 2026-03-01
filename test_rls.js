const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nnrzszujwhutbgghtjwc.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucnpzenVqd2h1dGJnZ2h0andjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNTM0MDYsImV4cCI6MjA4NDcyOTQwNn0.Wm5Rt80-9_WyDCIxQVbreNSn9BTlqfgN8HmORGZcsO4';

const adminId = 'a201c8c5-8ede-4ab8-aa90-36ff5e1432c4';
const orderId = 'a47c728e-59ee-4f3b-8531-bc6e5894b9f0'; // ID for GB-1772290891276-125

async function testRLS() {
    console.log("Testing RLS with ANON key (this should fail unless the user is logged in)...");
    const supabaseAnon = createClient(supabaseUrl, anonKey);

    const { data: orders, error: fetchError } = await supabaseAnon
        .from('orders')
        .select('id, status')
        .eq('id', orderId);

    console.log("Fetch result (no auth):", { count: orders?.length, error: fetchError?.message });

    console.log("\nTrying with SERVICE ROLE to check current state...");
    const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucnpzenVqd2h1dGJnZ2h0andjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE1MzQwNiwiZXhwIjoyMDg0NzI5NDA2fQ.FIELkWJzaSclk8u5u6TyUuSf5EQ3kR5rYUs3rMeNWzQ';
    const supabaseService = createClient(supabaseUrl, serviceKey);

    // Reset to pending first
    await supabaseService.from('orders').update({ status: 'pending', confirmed_at: null, confirmed_by: null }).eq('id', orderId);
    console.log("Reset order to pending.");

    // Note: We can't easily sign in as admin@ghorbari.com without the password.
    // However, the error message in the screenshot says "Failed to confirm order" 
    // which comes from the catch block in page.tsx after alert().
    // If the RLS policy says "FOR ALL", it should cover UPDATE.

    // Let's check if there are any other policies on the orders table that might conflict.
    // We can't do that easily from JS. 

    // Wait, I noticed something in orderService.ts:
    // export async function confirmOrder(orderId: string, adminId: string, notes?: string) {
    //   const supabase = createClient()
    //   const { data, error } = await supabase
    //     .from('orders')
    //     .update({ ... })
    //     .eq('id', orderId)
    //     .select()
    //     .single()

    // If the UPDATE succeeds but .single() fails because of RLS on SELECT, it might throw an error.
    // But the Admin policy is FOR ALL.
}

testRLS();
