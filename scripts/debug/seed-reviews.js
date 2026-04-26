
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for backend updates

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const demoReviews = {
    title: 'আমাদের গ্রাহকদের মতামত',
    items: [
        {
            id: 1,
            title: 'আহমেদ কবির',
            subtitle: 'উত্তরা, ঢাকা',
            description: 'ঘরবাড়ির কাজের মান সত্যিই অপূর্ব। আমার বাড়ির ডিজাইন নিয়ে আমি খুবই সন্তুষ্ট। তাদের সাপোর্ট টিম খুবই হেল্পফুল।',
            image: 'https://ui-avatars.com/api/?name=Ahmed+Kabir&background=020b1c&color=fff'
        },
        {
            id: 2,
            title: 'সাবরিনা আক্তার',
            subtitle: 'আম্বরখানা, সিলেট',
            description: 'খুবই পেশাদার সার্ভিস। সময়মতো ডিজাইন এবং প্ল্যানিং ডেলিভারি পেয়েছি। ধন্যবাদ ঘরবাড়িকে তাদের এই চমৎকার উদ্যোগের জন্য।',
            image: 'https://ui-avatars.com/api/?name=Sabrina+Akter&background=020b1c&color=fff'
        },
        {
            id: 3,
            title: 'মো: রফিকুল ইসলাম',
            subtitle: 'খুলশী, চট্টগ্রাম',
            description: 'নির্ভরযোগ্য এবং স্বচ্ছ একটি প্ল্যাটফর্ম। এখান থেকে আমি কনস্ট্রাকশন মেটেরিয়ালও কিনেছি, যা খুবই ভালো মানের ছিল।',
            image: 'https://ui-avatars.com/api/?name=Rafiqul+Islam&background=020b1c&color=fff'
        }
    ]
};

async function seedReviews() {
    try {
        console.log('Seeding User Reviews...');
        // 1. Seed the content
        const { error: contentError } = await supabase
            .from('home_content')
            .upsert({
                section_key: 'user_reviews',
                content: demoReviews,
                is_active: true,
                updated_at: new Date().toISOString()
            }, { onConflict: 'section_key' });

        if (contentError) throw contentError;
        console.log('User Reviews section created/updated.');

        // 2. Update page_layout to include it
        const { data: layoutData } = await supabase
            .from('home_content')
            .select('content')
            .eq('section_key', 'page_layout')
            .single();

        let layout = layoutData?.content || [];

        // Remove existing user_reviews if any to avoid duplicates
        layout = layout.filter(item => item.data_key !== 'user_reviews');

        // Add user_reviews before Footer (at the end)
        layout.push({
            id: 'reviews_' + Date.now(),
            type: 'TestimonialSlider',
            data_key: 'user_reviews',
            hidden: false,
            title: 'User Reviews'
        });

        const { error: layoutError } = await supabase
            .from('home_content')
            .upsert({
                section_key: 'page_layout',
                content: layout,
                is_active: true,
                updated_at: new Date().toISOString()
            }, { onConflict: 'section_key' });

        if (layoutError) throw layoutError;
        console.log('Page layout updated with User Reviews.');

    } catch (err) {
        console.error('Error seeding data:', err);
    }
}

seedReviews();
