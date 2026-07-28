const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read credentials from .env.local in workspace root
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

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Supabase credentials not found. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local.");
    process.exit(1);
}

console.log("Connecting to Supabase URL:", supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function main() {
    console.log("Initializing cleanup...");

    // 1. Delete all bookings and orders in progress status
    const designActiveStatuses = ['verified', 'assigned', 'in_progress', 'quotation'];
    const orderActiveStatuses = ['confirmed', 'processing', 'ready_to_ship', 'shipped', 'out_for_delivery', 'pending'];
    
    console.log("Deleting in-progress design bookings...");
    const { error: dbErr } = await supabase
        .from('design_bookings')
        .delete()
        .in('status', designActiveStatuses);
    if (dbErr) {
        console.error("Error deleting design bookings:", dbErr.message);
    } else {
        console.log("Completed design bookings cleanup.");
    }

    console.log("Deleting in-progress product orders...");
    const { error: oErr } = await supabase
        .from('orders')
        .delete()
        .in('status', orderActiveStatuses);
    if (oErr) {
        console.error("Error deleting product orders:", oErr.message);
    } else {
        console.log("Completed product orders cleanup.");
    }

    // 2. Fetch all auth users
    console.log("Listing auth users...");
    const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
    if (listErr) {
        console.error("Error listing users:", listErr.message);
        return;
    }

    const allowedEmails = [
        'afrinsaima278@gmail.com',
        'admin@ghorbari.com',
        'rakibsustbd@gmail.com'
    ].map(e => e.toLowerCase().trim());

    // Separate users to keep vs delete
    const keepUsers = users.filter(u => u.email && allowedEmails.includes(u.email.toLowerCase().trim()));
    const deleteUsers = users.filter(u => !u.email || !allowedEmails.includes(u.email.toLowerCase().trim()));

    console.log(`Allowed Users: ${keepUsers.map(u => u.email).join(', ')}`);
    console.log(`Users to delete: ${deleteUsers.map(u => u.email || 'No Email').join(', ')}`);

    const keepIds = keepUsers.map(u => u.id);

    if (keepIds.length > 0) {
        console.log("Cleaning up dependent user data first to avoid constraint issues...");
        const keepIdsFilter = `(${keepIds.join(',')})`;

        // Delete reviews
        console.log("Deleting reviews of deleted users...");
        const { error: errRev } = await supabase.from('reviews').delete().not('reviewer_id', 'in', keepIdsFilter);
        if (errRev) console.error("Error deleting reviews:", errRev.message);

        // Delete messages
        console.log("Deleting messages of deleted users...");
        const { error: errMsg } = await supabase.from('messages').delete().not('sender_id', 'in', keepIdsFilter);
        if (errMsg) console.error("Error deleting messages:", errMsg.message);

        // Delete conversations
        console.log("Deleting conversations of deleted users...");
        const { error: errConv1 } = await supabase.from('conversations').delete().not('participant_1_id', 'in', keepIdsFilter);
        if (errConv1) console.error("Error deleting conversations (p1):", errConv1.message);
        
        const { error: errConv2 } = await supabase.from('conversations').delete().not('participant_2_id', 'in', keepIdsFilter);
        if (errConv2) console.error("Error deleting conversations (p2):", errConv2.message);

        // Delete support tickets
        console.log("Deleting support tickets of deleted users...");
        const { error: errTktCreator } = await supabase.from('support_tickets').delete().not('user_id', 'in', keepIdsFilter);
        if (errTktCreator) console.error("Error deleting support tickets by creator:", errTktCreator.message);
        
        const { error: errTktAssignee } = await supabase.from('support_tickets').delete().not('assigned_to', 'in', keepIdsFilter);
        if (errTktAssignee) console.error("Error deleting support tickets by assignee:", errTktAssignee.message);

        // Delete transactions
        console.log("Deleting transactions of deleted users...");
        const { error: errTx } = await supabase.from('transactions').delete().not('user_id', 'in', keepIdsFilter);
        if (errTx) console.error("Error deleting transactions:", errTx.message);

        // Delete notifications
        console.log("Deleting notifications of deleted users...");
        const { error: errNotif } = await supabase.from('notifications').delete().not('user_id', 'in', keepIdsFilter);
        if (errNotif) console.error("Error deleting notifications:", errNotif.message);

        // Delete cart items
        console.log("Deleting cart items of deleted users...");
        const { error: errCart } = await supabase.from('cart_items').delete().not('user_id', 'in', keepIdsFilter);
        if (errCart) console.error("Error deleting cart items:", errCart.message);

        // Delete all design bookings of deleted users
        console.log("Deleting design bookings of deleted users...");
        const { error: errBk } = await supabase.from('design_bookings').delete().not('user_id', 'in', keepIdsFilter);
        if (errBk) console.error("Error deleting design bookings:", errBk.message);

        // Delete product orders of deleted users
        console.log("Deleting product orders of deleted users...");
        const { error: errOrd } = await supabase.from('orders').delete().not('customer_id', 'in', keepIdsFilter);
        if (errOrd) console.error("Error deleting product orders by customer:", errOrd.message);
        
        const { error: errOrdConf } = await supabase.from('orders').delete().not('confirmed_by', 'in', keepIdsFilter);
        if (errOrdConf) console.error("Error deleting product orders by confirmer:", errOrdConf.message);

        // Delete service requests of deleted users (request_id in service_request_items cascades delete)
        console.log("Deleting service requests of deleted users...");
        const { error: errReq } = await supabase
            .from('service_requests')
            .delete()
            .not('customer_id', 'in', keepIdsFilter);
        if (errReq) console.error("Error deleting service requests:", errReq.message);

        // Delete sellers, designers, service_providers of deleted users
        console.log("Deleting sellers of deleted users...");
        const { data: sellers, error: errSelSelect } = await supabase
            .from('sellers')
            .select('id')
            .not('user_id', 'in', keepIdsFilter);
            
        if (errSelSelect) {
            console.error("Error selecting sellers:", errSelSelect.message);
        } else if (sellers && sellers.length > 0) {
            const sIds = sellers.map(s => s.id);
            
            // Delete reviews targeting these sellers
            await supabase.from('reviews').delete().in('target_id', sIds);
            
            // Delete product orders referencing deleted sellers to avoid foreign key violations
            console.log("Deleting product orders referencing deleted sellers...");
            const { error: errOrdSeller } = await supabase.from('orders').delete().in('seller_id', sIds);
            if (errOrdSeller) console.error("Error deleting seller orders:", errOrdSeller.message);

            const { error: errProd } = await supabase.from('products').delete().in('seller_id', sIds);
            if (errProd) console.error("Error deleting products:", errProd.message);
            
            const { error: errSel } = await supabase.from('sellers').delete().in('id', sIds);
            if (errSel) console.error("Error deleting sellers:", errSel.message);
        }

        console.log("Deleting designers of deleted users...");
        const { data: designers, error: errDesSelect } = await supabase
            .from('designers')
            .select('id')
            .not('user_id', 'in', keepIdsFilter);
            
        if (errDesSelect) {
            console.error("Error selecting designers:", errDesSelect.message);
        } else if (designers && designers.length > 0) {
            const dIds = designers.map(d => d.id);
            
            // Delete reviews targeting these designers
            await supabase.from('reviews').delete().in('target_id', dIds);
            
            // Delete design bookings assigned to deleted designers/sellers if any
            console.log("Deleting design bookings referencing deleted partners...");
            const { error: errBkPartner } = await supabase.from('design_bookings').delete().in('assigned_seller_id', dIds);
            if (errBkPartner) console.error("Error deleting design bookings of designers:", errBkPartner.message);

            const { error: errPack } = await supabase.from('design_packages').delete().in('designer_id', dIds);
            if (errPack) console.error("Error deleting design packages:", errPack.message);
            
            const { error: errDes } = await supabase.from('designers').delete().in('id', dIds);
            if (errDes) console.error("Error deleting designers:", errDes.message);
        }

        console.log("Deleting service providers of deleted users...");
        const { data: providers, error: errProvSelect } = await supabase
            .from('service_providers')
            .select('id')
            .not('user_id', 'in', keepIdsFilter);
            
        if (errProvSelect) {
            console.error("Error selecting service providers:", errProvSelect.message);
        } else if (providers && providers.length > 0) {
            const pIds = providers.map(p => p.id);
            
            // Delete reviews targeting these providers
            await supabase.from('reviews').delete().in('target_id', pIds);
            
            // Delete service requests assigned to these service providers
            await supabase.from('service_requests').delete().in('assigned_designer_id', pIds);

            const { error: errProv } = await supabase.from('service_providers').delete().in('id', pIds);
            if (errProv) console.error("Error deleting service providers:", errProv.message);
        }
    }

    // 3. Delete auth users
    let deletedCount = 0;
    for (const u of deleteUsers) {
        console.log(`Deleting Auth user: ${u.email || u.id}...`);
        const { error: delErr } = await supabase.auth.admin.deleteUser(u.id);
        if (delErr) {
            console.error(`Error deleting user ${u.email || u.id}:`, delErr.message);
        } else {
            console.log(`Successfully deleted ${u.email || u.id}`);
            deletedCount++;
        }
    }
    console.log(`Deleted ${deletedCount} users.`);

    // 4. Update role of admin@ghorbari.com to 'admin'
    const adminUser = keepUsers.find(u => u.email && u.email.toLowerCase() === 'admin@ghorbari.com');
    if (adminUser) {
        console.log("Correcting admin@ghorbari.com role...");
        // Update auth metadata
        const { error: metaErr } = await supabase.auth.admin.updateUserById(adminUser.id, {
            user_metadata: { ...adminUser.user_metadata, role: 'admin' }
        });
        if (metaErr) {
            console.error("Error updating admin auth metadata:", metaErr.message);
        } else {
            console.log("Admin auth metadata updated successfully.");
        }

        // Update profiles table
        const { error: profErr } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', adminUser.id);
        if (profErr) {
            console.error("Error updating admin database profile role:", profErr.message);
        } else {
            console.log("Admin database profile role set to 'admin' successfully.");
        }
    } else {
        console.warn("admin@ghorbari.com not found among active users.");
    }

    console.log("Cleanup script completed successfully.");
}

main().catch(err => {
    console.error("Fatal error:", err);
});
