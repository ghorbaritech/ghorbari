const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nnrzszujwhutbgghtjwc.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function manageAdmin() {
    const email = 'admin@ghorbari.com';
    const password = 'password123';

    console.log(`Checking admin user: ${email}...`);

    // 1. List users to find if admin exists
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const adminUser = users.find(u => u.email === email);

    if (adminUser) {
        console.log(`Admin user found (ID: ${adminUser.id}). Updating password...`);
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            adminUser.id,
            { password: password, email_confirm: true }
        );

        if (updateError) {
            console.error('Error updating password:', updateError);
        } else {
            console.log('Password updated successfully to: ' + password);
            // Ensure role is admin? (If using custom claims or separate table)
            // Usually admin role is in 'profiles' table or metadata.
            // Let's check metadata
            if (adminUser.user_metadata?.role !== 'admin') {
                console.log('Updating user metadata role to admin...');
                await supabase.auth.admin.updateUserById(adminUser.id, { user_metadata: { role: 'admin' } });
            }
        }
    } else {
        console.log('Admin user not found. Creating...');
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { role: 'admin' }
        });

        if (createError) {
            console.error('Error creating user:', createError);
        } else {
            console.log('Admin user created successfully (ID: ' + newUser.user.id + ')');
        }
    }
}

manageAdmin();
