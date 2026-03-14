const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectContent() {
    const { data: allContent, error: contentError } = await supabase.from('home_content').select('*');
    if (contentError) {
        console.error('Error fetching content:', contentError);
        return;
    }

    console.log('--- Database Content Inspection ---');

    const testimonials = allContent.find(c => c.section_key === 'custom_demo_testimonials');
    console.log('Testimonials section exists:', !!testimonials);
    if (testimonials) {
        console.log('Testimonials type:', testimonials.type);
        console.log('Testimonials content structure:', JSON.stringify(testimonials.content, null, 2));
    }

    const layout = allContent.find(c => c.section_key === 'page_layout');
    if (layout) {
        console.log('Page Layout contains testimonials:', layout.content.some(l => l.data_key === 'custom_demo_testimonials'));
        console.log('Full Layout:', JSON.stringify(layout.content, null, 2));
    }
}

inspectContent();
