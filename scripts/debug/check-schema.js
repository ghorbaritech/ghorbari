const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    const { data, error } = await supabase.from('home_content').select('*').limit(1);
    if (error) {
        console.error('Error fetching sample:', error);
        return;
    }
    if (data && data.length > 0) {
        console.log('Columns in home_content:', Object.keys(data[0]));
        console.log('Sample row:', data[0]);
    } else {
        console.log('No data in home_content');
    }
}

checkSchema();
