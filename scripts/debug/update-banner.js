const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateBanner() {
    try {
        const imagePath = 'C:\\Users\\Ahmed Rakib\\.gemini\\antigravity\\brain\\67688a97-2d55-4e6d-b428-a4536d3cd658\\media__1773320796286.png';
        const imageBuffer = fs.readFileSync(imagePath);
        const fileName = `banner_verified_${Date.now()}.png`;

        // 1. Upload to Supabase
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, imageBuffer, { contentType: 'image/png' });

        if (uploadError) throw uploadError;

        const publicUrl = `https://nnrzszujwhutbgghtjwc.supabase.co/storage/v1/object/public/product-images/${fileName}`;
        console.log('Image uploaded:', publicUrl);

        // 2. Fetch the current SingleSlider (Brand Banner)
        // Looking for the section with SingleSlider type in custom keys
        const { data: segments } = await supabase.from('home_content').select('section_key, content');
        const brandBannerKey = segments.find(s => s.section_key.startsWith('custom_') && s.content?.items?.[0]?.image?.includes('banner'))?.section_key;

        if (!brandBannerKey) {
            console.log('Could not find brand banner key automatically, trying hardcoded from layout...');
            // Fallback to searching the layout
        }

        // Let's just find the one that has SingleSlider type in the content if possible, or just the custom_1773258173226 we saw earlier
        const targetKey = 'custom_1773258173226';

        console.log('Updating banner section:', targetKey);
        const { data: currentData } = await supabase.from('home_content').select('content').eq('section_key', targetKey).single();

        const newContent = {
            ...currentData.content,
            items: [
                {
                    ...currentData.content.items[0],
                    image: publicUrl
                }
            ]
        };

        const { error: updateError } = await supabase.from('home_content').update({
            content: newContent
        }).eq('section_key', targetKey);

        if (updateError) throw updateError;
        console.log('Banner updated successfully in database');

    } catch (error) {
        console.error('Error updating banner:', error);
    }
}

updateBanner();
