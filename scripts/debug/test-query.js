// test-query.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load env vars
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPackages() {
    console.log("Fetching packages for designer '587df3ad-a373-4266-b796-9258cef8934c'...");

    const { data: designerData } = await supabase
        .from('designers')
        .select('*')
        .eq('user_id', '587df3ad-a373-4266-b796-9258cef8934c')
        .single();

    console.log("Designer ID mapping:", designerData?.id);

    const { data, error } = await supabase
        .from('design_packages')
        .select('*')
        .eq('designer_id', designerData?.id || 'none');

    console.log("Packages:", data);
    console.log("Error:", error);
}

checkPackages();
