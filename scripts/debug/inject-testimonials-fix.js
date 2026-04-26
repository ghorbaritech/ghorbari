const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function injectTestimonialsFixed() {
    try {
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

        console.log('Inserting Testimonials...');
        const { data, error } = await supabase.from('home_content').insert({
            section_key: testimonialKey,
            type: 'TestimonialSlider',
            content: testimonialContent
        });

        if (error) {
            console.error('Insert Error:', error);
            // Try update if insert fails due to unique constraint
            console.log('Retrying with Update...');
            const { error: updateError } = await supabase.from('home_content').update({
                content: testimonialContent,
                type: 'TestimonialSlider'
            }).eq('section_key', testimonialKey);
            if (updateError) console.error('Update Error:', updateError);
            else console.log('Update Successful');
        } else {
            console.log('Insert Successful');
        }

    } catch (error) {
        console.error('Script Error:', error);
    }
}

injectTestimonialsFixed();
