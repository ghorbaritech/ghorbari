const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function injectDemoContent() {
    try {
        console.log('1. Uploading the brand banner to Supabase Storage CDN...');
        const localBannerPath = 'C:\\Users\\Ahmed Rakib\\.gemini\\antigravity\\brain\\67688a97-2d55-4e6d-b428-a4536d3cd658\\media__1773262810646.png';
        const fileBuffer = fs.readFileSync(localBannerPath);
        const fileName = `brand-banner-${Date.now()}.png`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, fileBuffer, {
                contentType: 'image/png',
                upsert: true
            });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);

        const bannerCdnUrl = publicUrlData.publicUrl;
        console.log('Successfully uploaded! CDN URL:', bannerCdnUrl);

        console.log('2. Updating Brand Banner in DB...');
        // Update Brand Banner
        const { data: bannerRow } = await supabase.from('home_content').select('*').eq('section_key', 'custom_1773258173226').single();
        if (bannerRow && bannerRow.content) {
            bannerRow.content.items[0].image = bannerCdnUrl;
            await supabase.from('home_content').update({ content: bannerRow.content }).eq('section_key', 'custom_1773258173226');
        }

        console.log('3. Injecting "Why Ghorbari" (MovingIconSlider)...');
        const whyGhorbariKey = 'custom_demo_whyghorbari';
        const whyGhorbariContent = {
            title: 'Why Choose Us',
            items: [
                { id: 1, title: '42 Cities', image: 'https://api.iconify.design/lucide:building-2.svg?color=%231e3a8a', link: '#' },
                { id: 2, title: 'Delivery in 45 days*', image: 'https://api.iconify.design/lucide:calendar-days.svg?color=%23dc2626', link: '#' },
                { id: 3, title: 'No Hidden Costs', image: 'https://api.iconify.design/lucide:eye.svg?color=%23059669', link: '#' },
                { id: 4, title: 'Flat 10 Year Warranty', image: 'https://api.iconify.design/lucide:award.svg?color=%23d97706', link: '#' },
                { id: 5, title: 'Easy EMIs', image: 'https://api.iconify.design/lucide:percent.svg?color=%234f46e5', link: '#' },
                { id: 6, title: '600+ In-House Designers', image: 'https://api.iconify.design/lucide:pen-tool.svg?color=%23db2777', link: '#' },
            ]
        };
        await supabase.from('home_content').upsert({ section_key: whyGhorbariKey, content: whyGhorbariContent, is_active: true });

        console.log('4. Injecting "How It Works" (InfoCardSlider)...');
        const howItWorksKey = 'custom_demo_howitworks';
        const howItWorksContent = {
            title: 'How It Works',
            items: [
                { id: 1, title: '01', subtitle: 'Fill out a short form and our team will call you within 20 minutes to begin.', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80', description: 'Fill out a short form and our team will call you within 20 minutes to begin.' },
                { id: 2, title: '02', subtitle: 'Meet our technical expert and architect to discuss your needs and receive an initial quotation.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80', description: 'Meet our technical expert and architect to discuss your needs and receive an initial quotation.' },
                { id: 3, title: '03', subtitle: 'Pay a small token to confirm your booking and start pre-construction work.', image: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=600&q=80', description: 'Pay a small token to confirm your booking and start pre-construction work.' }
            ]
        };
        await supabase.from('home_content').upsert({ section_key: howItWorksKey, content: howItWorksContent, is_active: true });

        console.log('5. Injecting "Blog Slider" (BlogSlider)...');
        const blogSliderKey = 'custom_demo_blog';
        const blogSliderContent = {
            title: 'ঘরবাড়ি ইন দিন নিউজ !',
            items: [
                { id: 1, title: 'ঘরবাড়ি: আপনার স্বপ্নের বাড়ির জন্য নির্ভরযোগ্য সমাধান', subtitle: 'The Economic Times', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80', description: 'Tech-enabled construction company Ghorbari introduces contactless construction for home builders', link: '#' },
                { id: 2, title: 'কেন ঘরবাড়ি বেছে নেবেন আপনার বাড়ি নির্মাণের জন্য?', subtitle: 'Construction Week', image: 'https://images.unsplash.com/photo-1541888081622-386055d72fdf?w=600&q=80', description: 'Ghorbari introduces contactless construction to deliver homes seamlessly', link: '#' },
                { id: 3, title: 'নির্মাণে আধুনিক প্রযুক্তির ছোঁয়া আনছে ঘরবাড়ি', subtitle: 'Bangalore Insider', image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&q=80', description: 'To clear your head from all these hassles, leave the construction to Ghorbari.', link: '#' },
                { id: 4, title: 'কীভাবে সহজে এবং কম খরচে বাড়ি তৈরি করবেন', subtitle: 'Construction Week', image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80', description: 'Ghorbari has a vision of bringing predictability and trust to a marketplace that lacks standardization.', link: '#' }
            ]
        };
        await supabase.from('home_content').upsert({ section_key: blogSliderKey, content: blogSliderContent, is_active: true });

        console.log('6. Adding new custom segments to Layout Order...');
        const { data: layoutRow } = await supabase.from('home_content').select('*').eq('section_key', 'page_layout').single();
        if (layoutRow && layoutRow.content) {
            let layoutMap = layoutRow.content;

            const exists = (key) => layoutMap.some(l => l.data_key === key);

            if (!exists(whyGhorbariKey)) {
                layoutMap.push({ id: whyGhorbariKey, type: 'MovingIconSlider', data_key: whyGhorbariKey, hidden: false, title: 'Why Choose Us' });
            }
            if (!exists(howItWorksKey)) {
                layoutMap.push({ id: howItWorksKey, type: 'InfoCardSlider', data_key: howItWorksKey, hidden: false, title: 'How It Works' });
            }
            if (!exists(blogSliderKey)) {
                layoutMap.push({ id: blogSliderKey, type: 'BlogSlider', data_key: blogSliderKey, hidden: false, title: 'Ghorbari Blog' });
            }

            await supabase.from('home_content').update({ content: layoutMap }).eq('section_key', 'page_layout');
            console.log('Layout Order Updated!');
        }

        console.log('All Done! ✅');
    } catch (error) {
        console.error('Script Error:', error);
    }
}

injectDemoContent();
