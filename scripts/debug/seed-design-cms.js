const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedDesignCMS() {
    console.log('--- Seeding Design Page CMS Content ---');

    const sections = [
        {
            section_key: 'design_hero',
            content: {
                title: "Build Your Dream Home with Expert Designers",
                titleBn: "অভিজ্ঞ ডিজাইনারদের সাথে আপনার স্বপ্নের বাড়ি তৈরি করুন",
                subtitle: "Professional architectural and interior design solutions tailored to your lifestyle and budget in Bangladesh.",
                subtitleBn: "আপনার লাইফস্টাইল এবং বাজেটের সাথে সামঞ্জস্যপূর্ণ পেশাদার আর্কিটেকচারাল এবং ইন্টেরিয়র ডিজাইন সলিউশন।",
                items: [
                    {
                        id: 'structural',
                        title: "Structural & Architectural Design",
                        titleBn: "স্ট্রাকচারাল এবং আর্কিটেকচারাল ডিজাইন",
                        image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&fit=crop",
                        href: "/services/design/book?service=structural",
                        overlay_color: "#064e3b",
                        overlay_opacity: 90
                    },
                    {
                        id: 'interior',
                        title: "Interior Design",
                        titleBn: "ইন্টেরিয়র ডিজাইন",
                        image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&fit=crop",
                        href: "/services/design/book?service=interior",
                        overlay_color: "#172554",
                        overlay_opacity: 90
                    }
                ]
            }
        },
        {
            section_key: 'design_workflow',
            content: {
                title: "Designing to Move In",
                titleBn: "ডিজাইন থেকে ঘরে ফেরা",
                steps: [
                    {
                        id: 's1',
                        title: "Meet Your Designer",
                        titleBn: "আপনার ডিজাইনারের সাথে দেখা করুন",
                        description: "Share your vision, budget, and requirements with our top interior experts.",
                        descriptionBn: "আমাদের শীর্ষ ইন্টেরিয়র বিশেষজ্ঞদের সাথে আপনার চিন্তা, বাজেট এবং প্রয়োজনীয়তা ভাগ করুন।",
                        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800"
                    },
                    {
                        id: 's2',
                        title: "Personalized Design",
                        titleBn: "ব্যক্তিগত ডিজাইন",
                        description: "Get curated 3D designs and floor plans tailored specifically for your space.",
                        descriptionBn: "আপনার স্পেসের জন্য বিশেষভাবে তৈরি ৩ডি ডিজাইন এবং ফ্লোর প্ল্যান পান।",
                        image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800"
                    },
                    {
                        id: 's3',
                        title: "Execution & Build",
                        titleBn: "বাস্তবায়ন এবং নির্মাণ",
                        description: "Our engineers and craftsmen bring the design to life with high precision.",
                        descriptionBn: "আমাদের ইঞ্জিনিয়ার এবং কারিগররা উচ্চ নির্ভুলতার সাথে ডিজাইনটিকে বাস্তবে রূপ দেন।",
                        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800"
                    }
                ]
            }
        },
        {
            section_key: 'design_page_layout',
            content: [
                { id: '1', type: 'DesignHero', data_key: 'design_hero', hidden: false, title: 'Design Hero Banners' },
                { id: '2', type: 'DesignWorkflow', data_key: 'design_workflow', hidden: false, title: 'How it Works Slider' },
                { id: '3', type: 'DesignShowcase', data_key: 'design_display_config', hidden: false, title: 'Category Showcase' },
                { id: '4', type: 'UserReviews', data_key: 'user_reviews', hidden: false, title: 'Client Stories' }
            ]
        }
    ];

    for (const section of sections) {
        const { error } = await supabase
            .from('home_content')
            .upsert({
                ...section,
                is_active: true,
                updated_at: new Date().toISOString()
            }, { onConflict: 'section_key' });

        if (error) {
            console.error(`Error seeding ${section.section_key}:`, error);
        } else {
            console.log(`Successfully seeded ${section.section_key}`);
        }
    }

    console.log('--- Seeding Complete ---');
}

seedDesignCMS();
