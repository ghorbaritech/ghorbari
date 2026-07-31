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
    console.log("Checking categories for specializations...");
    const uuids = [
        '0e2c6167-01d4-46c2-8128-5b8bad2a73a7',
        '26a6d78c-57da-4cf6-9f36-405c3765d48f'
    ];
    const { data: categories, error } = await supabase
        .from('product_categories')
        .select('id, name, slug')
        .in('id', uuids);
    
    if (error) {
        console.error("Error:", error.message);
    } else {
        console.log("Specializations categories:", categories);
    }
}

main().catch(console.error);
