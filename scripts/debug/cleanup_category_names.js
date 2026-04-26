const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Read .env.local manually
let supabaseUrl, supabaseKey;
try {
    const envFile = fs.readFileSync('.env.local', 'utf8');
    const lines = envFile.split('\n');
    lines.forEach(line => {
        const [key, ...rest] = line.split('=');
        const val = rest.join('=');
        if (key && val) {
            const trimmedKey = key.trim();
            const trimmedVal = val.trim().replace(/^["']|["']$/g, '');
            if (trimmedKey === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = trimmedVal;
            if (trimmedKey === 'SUPABASE_SERVICE_ROLE_KEY') supabaseKey = trimmedVal;
            if (trimmedKey === 'NEXT_PUBLIC_SUPABASE_ANON_KEY' && !supabaseKey) supabaseKey = trimmedVal;
        }
    });
} catch (e) {
    console.error('Error reading .env.local:', e.message);
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function toSlug(name) {
    return name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
}

// Strip suffixes appended during the last clone run
// Patterns like " - Drawing Room", " - Regular Bedroom", " - Master bedroom", etc.
const SUFFIXES = [
    ' - Drawing Room',
    ' - Regular Bedroom',
    " - Master bedroom",
    ' - Baby Homecoming',
    " - Children's Room",
];

async function main() {
    console.log('Fetching all categories...');
    const { data: allCats, error } = await supabase
        .from('product_categories')
        .select('*');

    if (error) { console.error(error); process.exit(1); }

    console.log(`Loaded ${allCats.length} categories\n`);

    const toRename = allCats.filter(c =>
        SUFFIXES.some(s => c.name.endsWith(s))
    );

    console.log(`Found ${toRename.length} categories with suffixes to clean up\n`);

    for (const cat of toRename) {
        const suffix = SUFFIXES.find(s => cat.name.endsWith(s));
        const cleanName = cat.name.slice(0, cat.name.length - suffix.length);
        const cleanSlug = toSlug(cleanName);

        const { error: updateErr } = await supabase
            .from('product_categories')
            .update({ name: cleanName, slug: cleanSlug })
            .eq('id', cat.id);

        if (updateErr) {
            console.error(`❌ Failed to rename "${cat.name}" → "${cleanName}": ${updateErr.message}`);
        } else {
            console.log(`✅ "${cat.name}" → "${cleanName}"`);
        }
    }

    console.log('\n✅ Cleanup done!');
}

main().catch(console.error);
