const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Manual env parsing
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim().replace(/"/g, '');
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Check if we have service role key, otherwise anon key might not have permission to update public tables depending on RLS. 
// Assuming we are admin or RLS allows it. If not, we might need service role key.
// Let's check if there is a SUPABASE_SERVICE_ROLE_KEY in env file content manually if not found.

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateCategory(name, iconPath) {
    console.log(`Updating ${name} to ${iconPath}...`);
    const { data, error } = await supabase
        .from('product_categories')
        .update({ icon: iconPath })
        .eq('name', name)
        .select();

    if (error) {
        console.error(`Error updating ${name}:`, error);
    } else {
        console.log(`Success:`, data);
    }
}

async function runUpdates() {
    await updateCategory('Carpentry', '/categories/carpentry.svg');
    await updateCategory('Tiles & Sanitary', '/categories/tiles.svg');
    await updateCategory('Construction', '/categories/tools.svg');
    await updateCategory('Structural', '/categories/steel.svg');

    // Safety updates for others to ensure they are consistent
    await updateCategory('Cement', '/categories/cement.svg');
    await updateCategory('Sand', '/categories/sand.svg');
    await updateCategory('Brick', '/categories/brick.svg');
    await updateCategory('Cables', '/categories/cables.svg');
    await updateCategory('Stone', '/categories/stone.svg');
    await updateCategory('Pipes', '/categories/pipe.svg');
    await updateCategory('MS Rod', '/categories/steel.svg');
    await updateCategory('Painting', '/categories/paint.svg');
}

runUpdates();
