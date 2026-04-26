const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = 'https://nnrzszujwhutbgghtjwc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectCMSKeys() {
    console.log('Fetching home_content keys...');
    const { data, error } = await supabase
        .from('home_content')
        .select('id, section_key, is_active');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.table(data);
}

inspectCMSKeys();
