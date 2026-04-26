const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data } = await supabase.from('home_content').select('*').eq('section_key', 'custom_1773258173226').single();
    const c = data.content;
    if (c && c.items && c.items[0]) {
        c.items[0].image = '/images/ghorbari-brand-banner.png';
        console.log('Update content: ', c);
        const { error } = await supabase.from('home_content').update({ content: c }).eq('section_key', 'custom_1773258173226');
        if (error) console.error(error);
        else console.log('Successfully updated!');
    }
}
check();
