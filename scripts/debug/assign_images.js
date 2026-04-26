require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const brainDir = 'C:\\Users\\Ahmed Rakib\\.gemini\\antigravity\\brain\\df773ddf-9835-4a60-90db-aca1642a8eba';
const targetDir = path.join(__dirname, 'public', 'images', 'services');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// Copy images and get clean names
const files = fs.readdirSync(brainDir);
const imageMap = {};

for (const file of files) {
    if (file.endsWith('.png') && file.includes('_177')) {
        const baseName = file.split('_177')[0];
        const sourcePath = path.join(brainDir, file);
        const destName = `${baseName}.png`;
        const destPath = path.join(targetDir, destName);
        fs.copyFileSync(sourcePath, destPath);
        imageMap[baseName] = `/images/services/${destName}`;
    }
}

// Ensure all expected images are present based on base names
const mapping = {
    'interior_paint': ['Interior Paint', 'Plastic Paint', 'Distemper Paint', 'Luxury Silk Paint', 'Breath Easy/Easy Clean', 'Enamel Paint', 'New Surface', 'Re-Paint Old Surface', 'Paint'],
    'damp_repair': ['Damp Repair', 'Damp Wall Repair Permanent', 'Damp wall Treatment Temporary'],
    'roof_leakage': ['Roof Water Leakage Repair'],
    'wood_paint': ['Wood & Furniture Paint', 'Lacquar Varnish', 'Hand Polish (Varnish Paint)'],
    'spray_paint': ['Spray or Deco paint'],
    'furniture_repair': ['Furniture Repair & Fixes', 'Chair Cover & Foam', 'Furniture Cover & Foam Repair', 'Up to 2 Hour', '3 Hour to 5 Hour', '6 Hour to 8 Hour'],
    'cabinet_design': ['Cabinet Design', 'New Furniture', 'Customized Design', 'Catalog Design', 'Furniture Assemble & Fitting', 'Regular Furniture', 'Fixed and Wall Mounted Furniture'],
    'sofa_repair': ['Fixed Foam/Leather/Velvet Sofa', 'Non-Fixed Regular Sofa'],
    'thai_glass': ['Thai Glass', 'Door', 'Window', 'Fixed Partition', 'Installation & Repair', 'Aluminium, Glass & Grill', 'Glass Works', 'Tempered Glass (Processed)', 'Non-Tempered Glass (Processed)', 'Beveled Glass', 'Glass Paper Pasting'],
    'mosquito_net': ['Mosquito Net', 'Fixed Fiber Net', 'Sliding Fiber Net', 'Fixing and Replacing Net'],
    'lock_repair': ['Thai Lock & wheel Service', 'Lock Installation', 'Lock Repair', 'Wheel Installation & Repair'],
    'tiles_fitting': ['Tiles Fitting & Pasting', 'Tiles Fitting', 'Tiles Re-Fitting', 'Mosaic Cutting', 'Construction and Tile'],
    'wall_construction': ['Construction', 'Wall Construction', 'Plaster Work', 'Construction Consultancy'],
    'false_ceiling': ['False Ceiling Design', 'White Board Ceiling', 'Gypsum Ceiling', 'Panel Design Ceiling']
};

async function assignImages() {
    console.log("Assigning locally copied images to the categories...");

    const { data: categories, error } = await supabase
        .from('product_categories')
        .select('id, name')
        .eq('type', 'service');

    if (error) {
        console.error("Failed to fetch categories:", error);
        return;
    }

    // Mapping backwards: Category Name -> Image File
    const nameToImage = {};
    for (const [imgKey, catNames] of Object.entries(mapping)) {
        if (imageMap[imgKey]) {
            for (const name of catNames) {
                nameToImage[name] = imageMap[imgKey];
            }
        } else {
            console.log(`Warning: Image for ${imgKey} not found in brain directory`);
        }
    }

    let updatedCount = 0;
    for (const cat of categories) {
        const imageUrl = nameToImage[cat.name];
        if (imageUrl) {
            const { error: updateError } = await supabase
                .from('product_categories')
                .update({ icon_url: imageUrl })
                .eq('id', cat.id);

            if (updateError) {
                console.error(`Failed to update ${cat.name}:`, updateError);
            } else {
                updatedCount++;
            }
        }
    }

    console.log(`Finished updating ${updatedCount} categories exactly as requested!`);
}

assignImages();
