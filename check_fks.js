const { createClient } = require('@supabase/supabase-js');

const url = 'https://nnrzszujwhutbgghtjwc.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucnpzenVqd2h1dGJnZ2h0andjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNTM0MDYsImV4cCI6MjA4NDcyOTQwNn0.Wm5Rt80-9_WyDCIxQVbreNSn9BTlqfgN8HmORGZcsO4'

const supabase = createClient(url, key);

async function checkBN() {
    const { error } = await supabase.from('service_providers').select('business_name_bn').limit(1);
    console.log("business_name_bn exists:", !error);
}

checkBN();
