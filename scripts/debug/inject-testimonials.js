const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function injectFinalUpdates() {
    try {
        console.log('--- Starting Final Data Injection ---');

        // 1. Upload Banner
        const bannerPath = 'C:\\Users\\Ahmed Rakib\\.gemini\\antigravity\\brain\\67688a97-2d55-4e6d-b428-a4536d3cd658\\ghorbari_bengali_banner_v3_low_profile_1773313350194.png';
        const bannerBuffer = fs.readFileSync(bannerPath);
        const fileName = `banner_bengali_${Date.now()}.png`;

        // Try to use product-images since it exists
        const bucketName = 'product-images';

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(fileName, bannerBuffer, { contentType: 'image/png', upsert: true });

        if (uploadError) throw uploadError;
        const bannerUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${fileName}`;
        console.log('Banner uploaded:', bannerUrl);

        // 2. Update Single Banner Row
        // We need to find the section_key for the single slider. Previous research suggested 'custom_1773258173226'
        const bannerKey = 'custom_1773258173226';
        await supabase.from('home_content').update({
            content: { items: [{ id: 1, title: 'Brand Banner', image: bannerUrl, link: '#' }] }
        }).eq('section_key', bannerKey);

        // 3. Create Testimonials Section
        const testimonialKey = 'custom_demo_testimonials';
        const testimonialContent = {
            title: 'ক্লায়েন্টদের গল্প',
            items: [
                {
                    id: 1,
                    title: 'রহিম আহমেদ',
                    subtitle: 'বাড়ির মালিক',
                    description: 'স্ট্রাকচারাল সেফটি অ্যাসেসমেন্ট আমাদের মানসিক শান্তি দিয়েছে। অত্যন্ত পেশাদার দল।',
                    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
                },
                {
                    id: 2,
                    title: 'ফাতিন বেগম',
                    subtitle: 'ইন্টেরিয়র ক্লায়েন্ট',
                    description: 'আমাদের অ্যাপার্টমেন্টকে একটি আধুনিক অভয়ারণ্যে রূপান্তর করেছে। ডিজাইন প্রক্রিয়া ছিল নির্বিঘ্ন।',
                    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
                },
                {
                    id: 3,
                    title: 'তানভীর হাসান',
                    subtitle: 'ডেভেলপার',
                    description: 'উদ্ভাবনী আর্কিটেকচারাল ডিজাইন যা সহজে সমাদৃত হয়। আমরা এখন পর্যন্ত তাদের সাথে ৩টি প্রকল্পে কাজ করেছি।',
                    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
                }
            ]
        };

        await supabase.from('home_content').upsert({
            section_key: testimonialKey,
            type: 'TestimonialSlider',
            content: testimonialContent
        });

        // 4. Update Page Layout to include Testimonials at the bottom
        const { data: layoutRow } = await supabase.from('home_content').select('*').eq('section_key', 'page_layout').single();
        if (layoutRow) {
            const currentLayout = layoutRow.content || [];
            // Remove any existing testimonial entry to avoid duplicates
            const filteredLayout = currentLayout.filter(l => l.data_key !== testimonialKey);
            filteredLayout.push({
                id: 'layout_' + Date.now(),
                type: 'TestimonialSlider',
                data_key: testimonialKey,
                hidden: false
            });
            await supabase.from('home_content').update({ content: filteredLayout }).eq('section_key', 'page_layout');
        }

        console.log('--- Successfully Injected Banner and Testimonials ---');

    } catch (error) {
        console.error('Injection Error:', error);
    }
}

injectFinalUpdates();
