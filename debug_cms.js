
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Read .env.local manually
let supabaseUrl, supabaseKey;
try {
    const envFile = fs.readFileSync('.env.local', 'utf8');
    const lines = envFile.split('\n');
    lines.forEach(line => {
        const [key, val] = line.split('=');
        if (key && val) {
            const trimmedKey = key.trim();
            const trimmedVal = val.trim().replace(/^["']|["']$/g, ''); // Remove quotes
            if (trimmedKey === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = trimmedVal;
            if (trimmedKey === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') supabaseKey = trimmedVal;
        }
    });
} catch (e) {
    console.error('Error reading .env.local:', e.message);
}

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkContent() {
    console.log('Checking home_content table...');
    const { data, error } = await supabase
        .from('home_content')
        .select('*')
        .eq('section_key', 'featured_categories');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Found rows:', data.length);
        data.forEach(row => {
            console.log(`ID: ${row.id}, IsActive: ${row.is_active}, UpdatedAt: ${row.updated_at}`);
            const items = row.content?.items || [];
            console.log('Items Count:', items.length);
            if (items.length > 0) {
                console.log('First Item:', JSON.stringify(items[0]));
                console.log('Last Item:', JSON.stringify(items[items.length - 1]));
            }
        });
    }
}

checkContent();
