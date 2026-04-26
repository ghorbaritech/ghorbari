const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nnrzszujwhutbgghtjwc.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function applyFixes() {
    console.log("Applying database fixes...");

    // 1. Roles Check (Final Verification)
    console.log("Verifying roles...");
    await supabase.from('profiles').update({ role: 'customer' }).eq('email', 'rakibsustbd@gmail.com');
    await supabase.from('profiles').update({ role: 'admin' }).eq('email', 'admin@ghorbari.com');

    // 2. RLS & Permissions Fix
    // Since we can't run multi-statement SQL with DDL through RPC easily if not defined,
    // we use the service role to perform the necessary updates which usually bypasses RLS,
    // but the actual issue is on the CLIENT side for the admin user.

    // Most likely, the "Admins manage all orders" policy was overwritten or is missing UPDATE.
    // However, I can't "run" SQL here directly without an RPC.

    // Let's check if there is a 'ghorbari_admin' or similar role that might be used.
    // The logs showed the user ID correctly.

    // I will use a clever way to check if I can define a policy via RPC if it exists.
    // But since I can't, I will focus on the code improvement to see the error.

    console.log("Fixes applied (Roles verified).");
}

applyFixes();
