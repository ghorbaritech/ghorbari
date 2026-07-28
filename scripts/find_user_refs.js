const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

let supabaseUrl, supabaseServiceKey;
try {
    const envPath = path.resolve(__dirname, '../.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    for (const line of envLines) {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const val = parts.slice(1).join('=').trim();
            if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = val;
            if (key === 'SUPABASE_SERVICE_ROLE_KEY') supabaseServiceKey = val;
        }
    }
} catch (e) {
    console.error("Error reading .env.local:", e.message);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRef(tableName, columnName, value, isArray = false) {
    let query = supabase.from(tableName).select('id');
    if (isArray) {
        query = query.contains(columnName, [value]);
    } else {
        query = query.eq(columnName, value);
    }
    const { data, error } = await query;
    if (error) {
        // console.error(`Error querying ${tableName}.${columnName}:`, error.message);
    } else if (data && data.length > 0) {
        console.log(`FOUND REFERENCE: Table [${tableName}], Column [${columnName}], Records:`, data.map(r => r.id));
    }
}

async function main() {
    const email = 'auspicious@gmail.com';
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email && u.email.toLowerCase() === email);
    if (!user) {
        console.log(`User ${email} not found in Auth.`);
        return;
    }
    const userId = user.id;
    console.log(`User ID for ${email} is: ${userId}`);

    // Check profiles
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    console.log("Profile details:", profile);

    console.log("Scanning tables for references...");
    await checkRef('profiles', 'id', userId);
    await checkRef('sellers', 'user_id', userId);
    await checkRef('designers', 'user_id', userId);
    await checkRef('service_providers', 'user_id', userId);
    await checkRef('orders', 'customer_id', userId);
    await checkRef('orders', 'confirmed_by', userId);
    await checkRef('transactions', 'user_id', userId);
    await checkRef('service_requests', 'customer_id', userId);
    await checkRef('service_requests', 'assigned_designer_id', userId);
    await checkRef('conversations', 'participants', userId, true);
    await checkRef('messages', 'sender_id', userId);
    await checkRef('reviews', 'reviewer_id', userId);
    await checkRef('reviews', 'target_id', userId);
    await checkRef('notifications', 'user_id', userId);
    await checkRef('cart_items', 'user_id', userId);
    await checkRef('design_bookings', 'user_id', userId);
    await checkRef('design_bookings', 'assigned_seller_id', userId);

    console.log("Scan complete.");
}

main().catch(console.error);
