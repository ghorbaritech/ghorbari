const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nnrzszujwhutbgghtjwc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('--- PRODUCT CATEGORIES ---');
    const { data: categories } = await supabase.from('product_categories').select('id, name, parent_id, level, type');
    const catMap = {};
    categories.forEach(c => {
        catMap[c.id] = c;
        console.log(`[${c.id}] ${c.name} (Parent: ${c.parent_id}, Level: ${c.level}, Type: ${c.type})`);
    });

    console.log('\n--- PRODUCTS ---');
    const { data: products } = await supabase.from('products').select('id, title, category_id, status');
    products.forEach(p => {
        const cat = catMap[p.category_id];
        console.log(`[${p.id}] ${p.title} (CatID: ${p.category_id}, CatName: ${cat ? cat.name : 'UNKNOWN'}, Status: ${p.status})`);
    });

    console.log('\n--- HOME CONTENT ---');
    const { data: home, error } = await supabase.from('home_content').select('*').eq('is_active', true);
    if (error) {
        console.error('Home content error:', error);
    } else {
        console.log('Home content records:', home.length);
        home.forEach(item => {
            console.log(`Section Key: ${item.section_key}`);
            if (item.content) {
                if (item.section_key === 'product_sections') {
                    console.log('Product Sections Content:');
                    console.log(JSON.stringify(item.content, null, 2));
                } else {
                    // console.log('Other Content (hidden)');
                }
            } else {
                console.log('Content is NULL/Undefined');
            }
        });
    }

    process.exit(0);
}

checkData();
