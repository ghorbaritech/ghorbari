const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nnrzszujwhutbgghtjwc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
