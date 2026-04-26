require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function updateServiceImages() {
    console.log("Updating names and images to perfectly match user request...");

    const updates = [
        { oldName: 'Paint', newName: 'Painting Services', url: '/images/services/paint.png' },
        { oldName: 'Carpentry', newName: 'Carpentry Services', url: '/images/services/carpentry.png' },
        { oldName: 'Construction and Tile', newName: 'Renovation, Construction & Tile Work', url: '/images/services/construction.png' },
    ];

    for (const item of updates) {
        // Try to update by old name first or current name if already renamed
        let { error1 } = await supabase
            .from('product_categories')
            .update({ name: item.newName, icon_url: item.url })
            .eq('type', 'service')
            .eq('name', item.oldName);

        let { error2 } = await supabase
            .from('product_categories')
            .update({ icon_url: item.url })
            .eq('type', 'service')
            .eq('name', item.newName);

        console.log(`Updated ${item.newName} category with specific generated image.`);
    }

    console.log("Database update complete.");
}

updateServiceImages();
