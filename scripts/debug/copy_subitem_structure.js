const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Read .env.local manually
let supabaseUrl, supabaseKey;
try {
    const envFile = fs.readFileSync('.env.local', 'utf8');
    const lines = envFile.split('\n');
    lines.forEach(line => {
        const [key, ...rest] = line.split('=');
        const val = rest.join('='); // handle = signs in value
        if (key && val) {
            const trimmedKey = key.trim();
            const trimmedVal = val.trim().replace(/^["']|["']$/g, '');
            if (trimmedKey === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = trimmedVal;
            // Prefer service role key to bypass RLS
            if (trimmedKey === 'SUPABASE_SERVICE_ROLE_KEY') supabaseKey = trimmedVal;
            if (trimmedKey === 'NEXT_PUBLIC_SUPABASE_ANON_KEY' && !supabaseKey) supabaseKey = trimmedVal;
        }
    });
} catch (e) {
    console.error('Error reading .env.local:', e.message);
    process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper: generate slug from name
function toSlug(name) {
    return name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
}

// Recursively copy children from sourceParentId to destParentId
async function copyChildren(sourceParentId, destParentId, destParentName, allCats, type, depth = 0) {
    const children = allCats.filter(c => c.parent_id === sourceParentId);
    console.log(`  ${'  '.repeat(depth)}Copying ${children.length} children from ${sourceParentId} → ${destParentId} (${destParentName})`);
    for (const child of children) {
        // Append short suffix from parent name to keep (name, type) unique
        const suffix = destParentName.split(' ').slice(0, 2).join(' ');
        const uniqueName = `${child.name} - ${suffix}`;
        const newCat = {
            name: uniqueName,
            name_bn: child.name_bn ? `${child.name_bn} - ${suffix}` : null,
            slug: toSlug(uniqueName),
            type: type,
            parent_id: destParentId,
            level: child.level,
            icon: child.icon || null,
            icon_url: child.icon_url || null,
            metadata: child.metadata || null,
        };
        const { data: inserted, error } = await supabase
            .from('product_categories')
            .insert([newCat])
            .select()
            .single();
        if (error) {
            console.error(`  ${'  '.repeat(depth)}❌ Failed to insert "${uniqueName}":`, error.message);
        } else {
            console.log(`  ${'  '.repeat(depth)}✅ Created "${inserted.name}" (level ${inserted.level})`);
            // Recursively copy grandchildren
            await copyChildren(child.id, inserted.id, destParentName, allCats, type, depth + 1);
        }
    }
}

async function main() {
    console.log('Fetching all categories...');
    const { data: allCats, error: fetchErr } = await supabase
        .from('product_categories')
        .select('*');

    if (fetchErr) {
        console.error('Failed to fetch categories:', fetchErr.message);
        process.exit(1);
    }

    console.log(`Loaded ${allCats.length} categories`);

    // Find source: "Living Room Design"
    const source = allCats.find(c => c.name.toLowerCase().includes('living room design'));
    if (!source) {
        console.error('❌ Could not find "Living Room Design" in categories');
        console.log('Available names:', allCats.map(c => c.name).join(', '));
        process.exit(1);
    }
    console.log(`\n📋 Source: "${source.name}" (id: ${source.id}, level: ${source.level})`);

    // Count source children recursively
    const sourceChildren = allCats.filter(c => c.parent_id === source.id);
    console.log(`   Has ${sourceChildren.length} immediate children: ${sourceChildren.map(c => c.name).join(', ')}`);

    // Target sub-item names to copy structure into
    const targetNames = [
        'Drawing Room Design',
        'Regular Bedroom Design',
        'Master bedroom Design',
        'Baby Homecoming Bedroom',
        "Children's room",
    ];

    for (const targetName of targetNames) {
        const target = allCats.find(c => c.name.toLowerCase().includes(targetName.toLowerCase()));
        if (!target) {
            console.warn(`\n⚠️  Could not find "${targetName}" — skipping`);
            continue;
        }
        // Check if already has children (avoid duplicating)
        const existingChildren = allCats.filter(c => c.parent_id === target.id);
        if (existingChildren.length > 0) {
            console.log(`\n⏭️  "${target.name}" already has ${existingChildren.length} children — skipping to avoid duplicates`);
            continue;
        }
        console.log(`\n🔁 Copying structure into "${target.name}" (id: ${target.id}, level: ${target.level})`);
        await copyChildren(source.id, target.id, target.name, allCats, target.type);
    }

    console.log('\n✅ Done!');
}

main().catch(console.error);
