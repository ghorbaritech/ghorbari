const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nnrzszujwhutbgghtjwc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
    console.log("Testing getCategories query...");
    const { data, error } = await supabase
        .from('product_categories')
        .select(`
            *,
            parent:product_categories!parent_id(id, name, level)
        `)
        .limit(5);

    if (error) {
        console.error("Error detected:", JSON.stringify(error, null, 2));
    } else {
        console.log("Success! Data sample:", data[0]);
    }
}

testQuery();
