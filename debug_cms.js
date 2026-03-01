const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCMSContent() {
    console.log('Fetching home_content...');
    const { data, error } = await supabase
        .from('home_content')
        .select('*')
        .eq('is_active', true);

    if (error) {
        console.error('Error fetching home_content:', error);
        return;
    }

    console.log('Found', data.length, 'active sections.');
    data.forEach(item => {
        console.log(`\n--- Section: ${item.section_key} ---`);
        console.log(JSON.stringify(item.content, null, 2));
    });
}

checkCMSContent();
