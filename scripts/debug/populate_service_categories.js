require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function populateServices() {
    console.log("Fetching all service categories...");
    const { data: categories, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('type', 'service');

    if (error) {
        console.error("Failed to fetch categories:", error);
        return;
    }

    console.log(`Found ${categories.length} service categories/subcategories/items.`);

    for (const cat of categories) {
        let meta = cat.metadata || {};
        let updated = false;

        // Add a default price if missing
        if (!meta.price || meta.price === "") {
            // Random price between 500 and 5000, rounded to 100
            meta.price = Math.floor(Math.random() * (5000 - 500) + 500);
            meta.price = Math.round(meta.price / 100) * 100;
            updated = true;
        }

        // Add a default unit if missing
        if (!meta.unit || meta.unit === "") {
            meta.unit = "Per Item/Hour";
            updated = true;
        }

        // Add a placeholder image if missing
        let icon_url = cat.icon_url;
        if (!icon_url || icon_url === "") {
            icon_url = `https://placehold.co/400x400/10b981/ffffff?text=${encodeURIComponent(cat.name)}`;
            updated = true;
        }

        if (updated) {
            console.log(`Updating ${cat.name}...`);
            const { error: updateError } = await supabase
                .from('product_categories')
                .update({ metadata: meta, icon_url })
                .eq('id', cat.id);

            if (updateError) {
                console.error(`Failed to update ${cat.name}:`, updateError);
            }
        }
    }

    console.log("Finished populating service categories!");
}

populateServices();
