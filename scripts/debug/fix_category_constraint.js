const fs = require('fs');
const https = require('https');

// Read .env.local manually
let supabaseUrl, serviceKey;
try {
    const envFile = fs.readFileSync('.env.local', 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, ...rest] = line.split('=');
        const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
        if (key.trim() === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = val;
        if (key.trim() === 'SUPABASE_SERVICE_ROLE_KEY') serviceKey = val;
    });
} catch (e) { console.error(e.message); process.exit(1); }

// Extract project ref from URL: https://nnrzszujwhutbgghtjwc.supabase.co
const projectRef = supabaseUrl.replace('https://', '').split('.')[0];
console.log('Project ref:', projectRef);

function httpPost(url, data, headers) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(data);
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), ...headers }
        };
        const req = https.request(url, options, (res) => {
            let raw = '';
            res.on('data', d => raw += d);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, data: JSON.parse(raw) }); }
                catch { resolve({ status: res.statusCode, data: raw }); }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function runSQL(sql) {
    // Use Supabase Management API to run SQL
    const url = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
    const res = await httpPost(url, { query: sql }, {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey
    });
    return res;
}

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(supabaseUrl, serviceKey);

function toSlug(name) {
    return name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
}

const SUFFIXES = [
    ' - Drawing Room',
    ' - Regular Bedroom',
    ' - Master bedroom',
    ' - Baby Homecoming',
    " - Children's Room",
];

async function main() {
    // Step 1: Drop old constraint via Management API
    console.log('Step 1: Dropping UNIQUE(name, type) via Management API...');
    let r1 = await runSQL('ALTER TABLE product_categories DROP CONSTRAINT IF EXISTS product_categories_name_type_key');
    console.log('Response:', r1.status, JSON.stringify(r1.data));

    if (r1.status !== 200 && r1.status !== 201) {
        // Try via REST endpoint
        console.log('Management API failed. Trying /rest/v1/rpc...');
        const restUrl = `${supabaseUrl}/rest/v1/rpc/exec_sql`;
        r1 = await httpPost(restUrl, { query: 'ALTER TABLE product_categories DROP CONSTRAINT IF EXISTS product_categories_name_type_key' }, {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey
        });
        console.log('REST response:', r1.status, JSON.stringify(r1.data));
    }

    // Step 2: Add new constraint
    console.log('\nStep 2: Adding UNIQUE(name, type, parent_id)...');
    const r2 = await runSQL('ALTER TABLE product_categories ADD CONSTRAINT product_categories_name_type_parent_key UNIQUE NULLS NOT DISTINCT (name, type, parent_id)');
    console.log('Response:', r2.status, JSON.stringify(r2.data));

    // Step 3: Rename suffixed entries
    console.log('\nStep 3: Cleaning up names...');
    const { data: allCats } = await supabase.from('product_categories').select('*');
    const toRename = allCats.filter(c => SUFFIXES.some(s => c.name.endsWith(s)));
    console.log(`Found ${toRename.length} entries to rename`);

    for (const cat of toRename) {
        const suffix = SUFFIXES.find(s => cat.name.endsWith(s));
        const cleanName = cat.name.slice(0, cat.name.length - suffix.length);
        const { error } = await supabase.from('product_categories')
            .update({ name: cleanName, slug: toSlug(cleanName) })
            .eq('id', cat.id);
        if (error) console.error(`❌ "${cat.name}": ${error.message}`);
        else console.log(`✅ "${cat.name}" → "${cleanName}"`);
    }

    console.log('\n✅ All done!');
}

main().catch(console.error);
