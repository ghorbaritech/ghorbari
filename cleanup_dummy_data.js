const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using Service Role Key
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
    console.log('--- Database Cleanup Started (Service Role) ---');

    // Obvious Dummy Sellers
    const dummySellers = [
        'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1',
        '886df843-ec20-4413-9654-9352bbc9ee41',
        'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', // Placeholder seller
        'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', // Placeholder seller
        'a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3'  // Placeholder seller
    ];

    console.log('Targeting dummy sellers:', dummySellers);

    // 1. Delete products associated with these sellers
    const { data: deletedProds, error: prodError } = await supabase
        .from('products')
        .delete()
        .in('seller_id', dummySellers)
        .select();

    if (prodError) {
        console.error('Error deleting products:', prodError);
    } else {
        console.log(`Deleted ${deletedProds ? deletedProds.length : 0} dummy products.`);
    }

    // 2. Delete the sellers themselves
    const { data: deletedSellers, error: sellerError } = await supabase
        .from('sellers')
        .delete()
        .in('id', dummySellers)
        .select();

    if (sellerError) {
        console.error('Error deleting sellers:', sellerError);
    } else {
        console.log(`Deleted ${deletedSellers ? deletedSellers.length : 0} dummy sellers.`);
    }

    console.log('--- Database Cleanup Completed ---');
}

cleanup();
