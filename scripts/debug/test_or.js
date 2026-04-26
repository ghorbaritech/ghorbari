require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
    const name = 'Aluminium, Glass & Grill';
    console.log("Testing OR string:", `name.eq."${name}",name_bn.eq."${name}"`);

    const { data, error } = await supabase
        .from('product_categories')
        .select('id, name')
        .or(`name.eq."${name}",name_bn.eq."${name}"`)
        .eq('type', 'service');

    console.log('Result Data:', data);
    console.log('Result Error:', error);
}

test();
