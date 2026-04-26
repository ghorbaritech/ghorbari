const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nnrzszujwhutbgghtjwc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role key

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
    console.log('--- Checking for users with "partner" role ---');
    const { data: partners, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'partner');

    if (pError) {
        console.error('Error fetching partners:', pError);
    } else {
        console.log(`Found ${partners.length} partners:`, partners.map(p => ({ id: p.id, email: p.email, full_name: p.full_name })));
    }

    const email = 'auspicious@gmail.com';
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

    if (profile) {
        console.log('\n--- Auspicious Check ---');
        console.log('Role:', profile.role);
    }
}

checkUser();
