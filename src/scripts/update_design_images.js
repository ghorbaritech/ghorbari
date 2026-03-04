require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const mapping = {
    'Interior Design': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80',
    'Structural & Architectural Design': 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80',
    'Bed Room': 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80',
    'Master bedroom design': 'https://images.unsplash.com/photo-1616594868515-394996994c42?w=800&q=80',
    'Regular Bedroom Design': 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80',
    'Baby Homecoming Bedroom': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
    'Living Room Design': 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80',
    'Drawing Room Design': 'https://images.unsplash.com/photo-1567016432779-094069958ad5?w=800&q=80',
    'Children\'s Room': 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80',
    'Full Apartment Design': 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    'Full House Design': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    'Wall Design': 'https://images.unsplash.com/photo-1558603668-6570496b66f8?w=800&q=80',
    'Ceiling': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80',
    'Tiles & Fittings': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80',
    'Furniture Remodeling': 'https://images.unsplash.com/photo-1538688593397-32034f787a41?w=800&q=80',
    'Furniture Remodelling': 'https://images.unsplash.com/photo-1538688593397-32034f787a41?w=800&q=80',
    'Furniture Repair': 'https://images.unsplash.com/photo-1503594384566-461fe158e797?w=800&q=80',
    'Building Approval': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
    'Building Permit': 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
    'Land Usasge Permit': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
    'New Building Design': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    'Building Design': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    'Full Remodeling': 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=800&q=80',
    'Full Remodelling': 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=800&q=80',
    'Specific Area': 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&q=80',
    'Full Apartment': 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    'Full House': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'
};

async function updateDesignImages() {
    console.log("Updating design category images...");

    const { data: categories, error } = await supabase
        .from('product_categories')
        .select('id, name')
        .eq('type', 'design');

    if (error) {
        console.error("Failed to fetch categories:", error);
        return;
    }

    let updatedCount = 0;
    for (const cat of categories) {
        const imageUrl = mapping[cat.name];
        if (imageUrl) {
            const { error: updateError } = await supabase
                .from('product_categories')
                .update({ icon_url: imageUrl })
                .eq('id', cat.id);

            if (updateError) {
                console.error(`Failed to update ${cat.name}:`, updateError);
            } else {
                console.log(`Updated: ${cat.name}`);
                updatedCount++;
            }
        }
    }

    console.log(`Successfully updated ${updatedCount} design categories with new images!`);
}

updateDesignImages();
