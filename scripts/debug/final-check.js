const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function finalActiveCheck() {
    const { data, error } = await supabase.from('home_content').select('section_key, is_active, content');
    if (error) {
        console.error(error);
        return;
    }
    console.log('All sections and their active status:');
    data.forEach(d => {
        const type = d.content?.type || 'No Type';
        console.log(`- ${d.section_key}: ${d.is_active} (${type})`);
    });
}

finalActiveCheck();
