const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nnrzszujwhutbgghtjwc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucnpzenVqd2h1dGJnZ2h0andjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNTM0MDYsImV4cCI6MjA4NDcyOTQwNn0.Wm5Rt80-9_WyDCIxQVbreNSn9BTlqfgN8HmORGZcsO4';

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
