const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

let supabaseUrl, supabaseServiceKey;
try {
    const envPath = path.resolve(__dirname, '../.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    for (const line of envLines) {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const val = parts.slice(1).join('=').trim();
            if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = val;
            if (key === 'SUPABASE_SERVICE_ROLE_KEY') supabaseServiceKey = val;
        }
    }
} catch (e) {
    console.error("Error reading .env.local:", e.message);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
    const email = 'auspicious@gmail.com';
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email && u.email.toLowerCase() === email);
    if (!user) {
        console.log(`User ${email} not found in Auth.`);
        return;
    }
    const userId = user.id;
    console.log(`User ID: ${userId}`);

    console.log(`Attempting to delete profile ${userId} from public.profiles table...`);
    const { data, error } = await supabase.from('profiles').delete().eq('id', userId).select();
    if (error) {
        console.error("DELETE PROFILE ERROR DETAILS:");
        console.error("Message:", error.message);
        console.error("Details:", error.details);
        console.error("Hint:", error.hint);
        console.error("Code:", error.code);
    } else {
        console.log("Successfully deleted profile from profiles table! Data:", data);
        
        console.log("Now trying to delete auth user...");
        const { error: authErr } = await supabase.auth.admin.deleteUser(userId);
        if (authErr) {
            console.error("Error deleting auth user:", authErr.message);
        } else {
            console.log("Successfully deleted auth user!");
        }
    }
}

main().catch(console.error);
