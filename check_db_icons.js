const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nnrzszujwhutbgghtjwc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucnpzenVqd2h1dGJnZ2h0andjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNTM0MDYsImV4cCI6MjA4NDcyOTQwNn0.Wm5Rt80-9_WyDCIxQVbreNSn9BTlqfgN8HmORGZcsO4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkIcons() {
    console.log('Checking icons...');
    const { data, error } = await supabase
        .from('product_categories')
        .select('name, icon')
        .not('icon', 'is', null)
        .limit(10);

    if (error) {
        console.error('Error fetching categories:', error);
    } else {
        console.log('Categories with icons:', data);

        const { count, error: countError } = await supabase
            .from('product_categories')
            .select('*', { count: 'exact', head: true })
            .is('icon', null);

        console.log('Count of categories with NULL icon:', count);
    }
}

checkIcons();
