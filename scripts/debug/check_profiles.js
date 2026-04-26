const { createClient } = require('@supabase/supabase-js');

async function checkUsers() {
    const url = 'https://nnrzszujwhutbgghtjwc.supabase.co';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const supabase = createClient(url, key);

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, role');

    if (error) {
        console.error('Error fetching profiles:', error);
        return;
    }

    console.log('--- Current User Profiles ---');
    profiles.forEach(p => {
        console.log(`Email: ${p.email}, Role: ${p.role}, ID: ${p.id}`);
    });
}

checkUsers();
