const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nnrzszujwhutbgghtjwc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedContactInfo() {
    const defaultContactInfo = {
        phone: '+8801900000000',
        email: 'support@ghorbari.tech'
    };

    const { error } = await supabase
        .from('home_content')
        .upsert({
            section_key: 'contact_info',
            content: defaultContactInfo,
            is_active: true
        }, { onConflict: 'section_key' });

    if (error) {
        console.error('Error seeding contact info:', error);
    } else {
        console.log('Successfully seeded contact_info');
    }
}

seedContactInfo();
