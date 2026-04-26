const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = 'https://nnrzszujwhutbgghtjwc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectData() {
    console.log('Fetching products...');
    const { data: products, error: pError } = await supabase
        .from('products')
        .select('id, title, category_id')
        .limit(20);

    if (pError) console.error('Products Error:', pError);
    else {
        console.log('\n--- Products Sample ---');
        products.forEach(p => console.log(`${p.id} | ${p.title} | ${p.category_id}`));
    }

    console.log('\nFetching categories...');
    const { data: categories, error: cError } = await supabase
        .from('product_categories')
        .select('id, name, slug');

    if (cError) console.error('Categories Error:', cError);
    else {
        console.log('\n--- Categories ---');
        categories.forEach(c => console.log(`${c.id} | ${c.name} | ${c.slug}`));
    }
}

inspectData();
