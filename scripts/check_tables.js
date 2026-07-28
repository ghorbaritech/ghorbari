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

async function main() {
    console.log("Checking service_items count...");
    const { data: items, error: err1 } = await supabase.from('service_items').select('id, name');
    if (err1) {
        console.error("Error fetching from service_items:", err1.message);
    } else {
        console.log(`service_items has ${items.length} records:`, items);
    }

    console.log("Checking level 2 product_categories of type 'service'...");
    const { data: cats, error: err2 } = await supabase.from('product_categories').select('id, name').eq('type', 'service').eq('level', 2);
    if (err2) {
        console.error("Error fetching from product_categories:", err2.message);
    } else {
        console.log(`product_categories (type=service, level=2) has ${cats.length} records:`, cats);
    }
}

main().catch(console.error);
