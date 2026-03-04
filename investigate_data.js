const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function investigate() {
    console.log('--- Investigating Categories ---');
    const { data: categories, error: catError } = await supabase
        .from('product_categories')
        .select('id, name, parent_id, level, type')
        .order('level');

    if (catError) console.error(catError);
    else {
        // Find "Cement & Concrete"
        const cement = categories.find(c => c.name === 'Cement & Concrete' || c.name.includes('Cement'));
        console.log('Target Category:', cement);

        if (cement) {
            const subcats = categories.filter(c => c.parent_id === cement.id);
            console.log('Immediate Subcategories:', subcats);

            // Recursive find
            const children_ids = [cement.id];
            let search_ids = [cement.id];
            while (search_ids.length > 0) {
                const next_ids = categories
                    .filter(c => search_ids.includes(c.parent_id))
                    .map(c => c.id);
                children_ids.push(...next_ids);
                search_ids = next_ids;
            }
            console.log('All descendant IDs count:', children_ids.length);
        }
    }

    console.log('\n--- Investigating Products & Sellers ---');
    const { data: products, error: prodError } = await supabase
        .from('products')
        .select('id, title, seller_id, category_id, sku, created_at')
        .limit(20);

    if (prodError) console.error(prodError);
    else {
        console.log('Sample Products (first 20):');
        products.forEach(p => console.log(`${p.sku} | ${p.title} | Seller: ${p.seller_id}`));
    }

    const { data: sellers, error: sellerError } = await supabase
        .from('sellers')
        .select('id, business_name, email');

    if (sellerError) console.error(sellerError);
    else {
        console.log('\nSellers:');
        sellers.forEach(s => console.log(`${s.id} | ${s.business_name} | ${s.email}`));
    }
}

investigate();
