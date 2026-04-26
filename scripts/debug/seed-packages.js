// seed-packages.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load env vars
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedPackages() {
    console.log("Seeding packages for designer...");

    const { data: designerData } = await supabase
        .from('designers')
        .select('id')
        .eq('user_id', '587df3ad-a373-4266-b796-9258cef8934c')
        .single();

    const designerId = designerData.id;
    console.log("Designer ID:", designerId);

    // Fetch categories to use
    const { data: categories } = await supabase.from('product_categories').select('id, name');

    if (!categories || categories.length < 2) {
        console.error("Not enough categories to map packages to. Please add product_categories.");
        console.log(categories);
        return;
    }

    const mockPackages = [
        {
            designer_id: designerId,
            category_id: categories[0].id,
            title: 'Complete Architectural Blueprint',
            description: 'A full end-to-end structural blueprint tailored to your land dimensions, ensuring safety and compliance.',
            price: 50000,
            unit: 'project',
            is_active: true,
            images: ['https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800']
        },
        {
            designer_id: designerId,
            category_id: categories[0].id,
            title: 'Rajuk Building Approval Service',
            description: 'We handle all bureaucratic operations to get your structural design approved by Rajuk and relevant authorities.',
            price: 30000,
            unit: 'approval',
            is_active: true,
            images: ['https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800']
        },
        {
            designer_id: designerId,
            category_id: categories[1].id,
            title: 'Premium Full Apartment Interior',
            description: 'A complete interior design overhaul for apartments up to 2500 sq ft, including 3D renders, material sourcing, and lighting layouts.',
            price: 120000,
            unit: 'sq ft',
            is_active: true,
            images: ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800']
        },
        {
            designer_id: designerId,
            category_id: categories[1].id,
            title: 'Master Bedroom Aesthetic Layout',
            description: 'Specialized layout planning for master bedrooms to maximize space, luxury, and comfort.',
            price: 25000,
            unit: 'room',
            is_active: true,
            images: ['https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800']
        }
    ];

    const { data, error } = await supabase.from('design_packages').insert(mockPackages).select();
    console.log("Inserted:", data?.length, "packages.");
    if (error) console.error("Error inserting:", error);
}

seedPackages();
