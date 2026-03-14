const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function injectMoreIcons() {
    try {
        const whyGhorbariKey = 'custom_demo_whyghorbari';

        const { data: row } = await supabase.from('home_content').select('*').eq('section_key', whyGhorbariKey).single();

        if (row && row.content) {
            const currentItems = row.content.items || [];
            const newItems = [
                ...currentItems,
                { id: 7, title: '55000+ Homes Delivered', image: 'https://api.iconify.design/lucide:home.svg?color=%231e3a8a', link: '#' },
                { id: 8, title: '76 Studios', image: 'https://api.iconify.design/lucide:store.svg?color=%23dc2626', link: '#' },
                { id: 9, title: 'Expert Consultation', image: 'https://api.iconify.design/lucide:users.svg?color=%23059669', link: '#' },
            ];

            row.content.items = newItems;
            await supabase.from('home_content').update({ content: row.content }).eq('section_key', whyGhorbariKey);
            console.log('Successfully added 3 more icons!');
        }
    } catch (error) {
        console.error('Script Error:', error);
    }
}

injectMoreIcons();
