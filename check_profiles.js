const { createClient } = require('@supabase/supabase-js');

async function checkUsers() {
    const url = 'https://nnrzszujwhutbgghtjwc.supabase.co';
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucnpzenVqd2h1dGJnZ2h0andjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNTM0MDYsImV4cCI6MjA4NDcyOTQwNn0.Wm5Rt80-9_WyDCIxQVbreNSn9BTlqfgN8HmORGZcsO4';

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
