const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listSections() {
    console.log('--- Home Content Sections ---');
    const { data: homeContent, error: homeError } = await supabase
        .from('home_content')
        .select('*');

    if (homeError) console.error(homeError);
    else {
        homeContent.forEach(item => {
            console.log(`Key: ${item.section_key}`);
            if (item.section_key === 'product_sections') {
                console.log('Product Sections Detail:');
                console.log(JSON.stringify(item.content, null, 2));
            }
        });
    }
}

listSections();
