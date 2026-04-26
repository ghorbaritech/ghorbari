'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getHomeContent() {
    console.log('--- getHomeContent START ---');
    try {
        const supabase = await createClient()

        // Fetch all active content sections
        const { data: content, error } = await supabase
            .from('home_content')
            .select('*')
            .eq('is_active', true)

        if (error) {
            console.error('Error fetching home content:', error)
            return {}
        }

        // Transform into a key-value map for easier consumption
        const contentMap: Record<string, any> = {}
        content?.forEach((item: any) => {
            contentMap[item.section_key] = item.content
        })
        console.log('Fetched sections:', Object.keys(contentMap));
        console.log('Raw featured items count:', contentMap['featured_categories']?.items?.length);

        // Enrich featured_categories with live data (names, icons) from product_categories
        const rawFeatured = contentMap['featured_categories'];
        let itemsToEnrich: any[] = [];

        if (Array.isArray(rawFeatured)) {
            itemsToEnrich = rawFeatured;
        } else if (rawFeatured?.items && Array.isArray(rawFeatured.items)) {
            itemsToEnrich = rawFeatured.items;
        }

        if (itemsToEnrich.length > 0) {
            const { data: categories } = await supabase
                .from('product_categories')
                .select('id, name, name_bn, icon, type')
                .in('id', itemsToEnrich.map((i: any) => i.id))

            if (categories) {
                const enrichedItems = itemsToEnrich.map((item: any) => {
                    const freshCat = categories.find((c: any) => c.id === item.id)
                    return freshCat ? {
                        ...item,
                        name: freshCat.name,
                        name_bn: freshCat.name_bn,
                        icon: freshCat.icon || item.icon,
                        type: freshCat.type
                    } : item
                });

                // Update the map with the enriched structure
                if (Array.isArray(rawFeatured)) {
                    contentMap['featured_categories'] = enrichedItems;
                } else {
                    contentMap['featured_categories'].items = enrichedItems;
                }
            }
        }

        // Enrichment: design_display_config (NEW)
        const designConfig = contentMap['design_display_config'];
        if (designConfig?.selected_ids && Array.isArray(designConfig.selected_ids) && designConfig.selected_ids.length > 0) {
            // Fetch all categories to build the lineage tree
            const { data: allCats } = await supabase
                .from('product_categories')
                .select('id, name, name_bn, icon, icon_url, metadata, parent_id')

            if (allCats) {
                // Helper to determine root service type
                const getServiceType = (id: string): 'interior' | 'structural' => {
                    let currentId = id;
                    while (currentId) {
                        const node = allCats.find((c: any) => c.id === currentId);
                        if (!node) break;

                        const nameLower = node.name.toLowerCase();
                        if (nameLower.includes('interior')) return 'interior';
                        if (nameLower.includes('structural') || nameLower.includes('architectural')) return 'structural';

                        currentId = node.parent_id;
                    }
                    return 'structural'; // default fallback
                };

                // Map back to maintain order if needed, but for now just provide the full objects
                const enrichedDesignItems = designConfig.selected_ids.map((id: string) => {
                    const fresh = allCats.find((c: any) => c.id === id)
                    if (!fresh) return null
                    return {
                        id: fresh.id,
                        title: fresh.name,
                        titleBn: fresh.name_bn,
                        image: fresh.icon_url || fresh.icon || '/images/placeholders/design.jpg',
                        description: fresh.metadata?.description || 'Professional architectural and interior design solutions',
                        descriptionBn: fresh.metadata?.description_bn || 'পেশাদার আর্কিটেকচারাল এবং ইন্টেরিয়র ডিজাইন সলিউশন',
                        rating: fresh.metadata?.rating || 4.8,
                        price: fresh.metadata?.starting_price || 1600,
                        serviceType: getServiceType(fresh.id)
                    }
                }).filter(Boolean);

                contentMap['design_display_config'].enriched_items = enrichedDesignItems;
            }
        }

        // --- NEW: Generate default page_layout if missing ---
        if (!contentMap['page_layout']) {
            contentMap['page_layout'] = [
                { id: '1', type: 'HeroSlider', data_key: 'hero_section', hidden: false, title: 'Main Hero Banner' },
                { id: '2', type: 'IconSlider', data_key: 'featured_categories', hidden: false, title: 'Category Quick Menu' },
                { id: '3', type: 'DesignServices', data_key: 'design_display_config', hidden: false, title: 'Design & Planning Services' },
                { id: '4', type: 'PromoBanners', data_key: 'promo_banners', hidden: false, title: 'Promotional Banners' }
            ];

            // Append product/service sections generically
            const pSections = contentMap['product_sections'] || [];
            pSections.forEach((s: any, i: number) => {
                contentMap['page_layout'].push({
                    id: `p_${s.id || i}`, type: 'CategoryShowcase', data_key: `product_sections[${i}]`, hidden: false, title: s.title || 'Product Showcase'
                })
            });

            const sSections = contentMap['service_sections'] || [];
            if (sSections.length > 0) {
                sSections.forEach((s: any, i: number) => {
                    contentMap['page_layout'].push({
                        id: `s_${s.id || i}`, type: 'ServiceShowcase', data_key: `service_sections[${i}]`, hidden: false, title: s.title || 'Service Showcase'
                    })
                });
            } else if (contentMap['service_showcase']) {
                contentMap['page_layout'].push({
                    id: 's_main', type: 'ServiceShowcaseOld', data_key: 'service_showcase', hidden: false, title: contentMap['service_showcase'].title || 'Service Showcase'
                })
            }
        }

        // --- NEW: Default Home Hero Content (Synced with live site EXACTLY) ---
        const defaultHeroItems = [
            {
                id: 'main',
                title: "Construction Marketplace",
                titleBn: "নির্মাণ মার্কেটপ্লেস",
                subtitle: "Marketplace",
                subtitleBn: "মার্কেটপ্লেস",
                description: "Get premium supplies delivered to your site.",
                descriptionBn: "আপনার সাইটে প্রিমিয়াম সাপ্লাই ডেলিভারি নিন।",
                image: "/hero-materials.png",
                link: "/products",
                overlay_color: "#EB6841",
                overlay_opacity: 100
            },
            {
                id: 'top_right',
                title: "Architectural & Building Design",
                titleBn: "স্থাপত্য ও ভবন ডিজাইন",
                subtitle: "Design Studio",
                subtitleBn: "ডিজাইন স্টুডিও",
                description: "",
                descriptionBn: "",
                image: "/hero-design.png",
                link: "/services/design",
                overlay_color: "#15803d",
                overlay_opacity: 100
            },
            {
                id: 'bottom_right',
                title: "Verified Construction Pros",
                titleBn: "যাচাইকৃত প্রোকর্মী",
                subtitle: "Renovations",
                subtitleBn: "রেনোভেশন",
                description: "",
                descriptionBn: "",
                image: "/hero-services.png",
                link: "/services",
                overlay_color: "#00356B",
                overlay_opacity: 100
            }
        ];

        // HARD SYNC: Force hero section to match live site exactly for now
        contentMap['hero_section'] = { items: defaultHeroItems };
        console.log("FORCED HERO SYNC APPLIED:", JSON.stringify(contentMap['hero_section'].items.map((i:any) => i.title), null, 2));

        // FORCE CORRECT LAYOUT ORDER (Standardizing with live site)
        const standardizedLayout = [
            { id: '1', type: 'HeroSlider', data_key: 'hero_section', hidden: false, title: 'Main Hero Banner' },
            { id: '2', type: 'IconSlider', data_key: 'featured_categories', hidden: false, title: 'Category Quick Menu' },
            { id: '3', type: 'DesignServices', data_key: 'design_display_config', hidden: false, title: 'Design & Planning Services' },
            { id: '4', type: 'PromoBanners', data_key: 'promo_banners', hidden: false, title: 'Promotional Banners' }
        ];

        let currentLayout = contentMap['page_layout'] || [];
        if (!Array.isArray(currentLayout)) currentLayout = [];

        // Combine standardized items with any existing extra sections from database
        const extraSections = currentLayout.filter((s: any) => 
            !['hero_section', 'featured_categories', 'design_display_config', 'promo_banners'].includes(s.data_key)
        );

        contentMap['page_layout'] = [...standardizedLayout, ...extraSections];
        console.log("FINAL PAGE LAYOUT ORDER:", JSON.stringify(contentMap['page_layout'].map((s:any) => s.data_key)));

        // --- NEW: Default Design Landing Content ---
        if (!contentMap['design_hero']) {
            contentMap['design_hero'] = {
                title: "Build Your Dream Home with Expert Designers",
                titleBn: "অভিজ্ঞ ডিজাইনারদের সাথে আপনার স্বপ্নের বাড়ি তৈরি করুন",
                subtitle: "Professional architectural and interior design solutions tailored to your lifestyle and budget.",
                subtitleBn: "আপনার লাইফস্টাইল এবং বাজেটের সাথে সামঞ্জস্যপূর্ণ পেশাদার আর্কিটেকচারাল এবং ইন্টেরিয়র ডিজাইন সলিউশন",
                items: [
                    {
                        id: 'structural',
                        title: "Structural & Architectural Design",
                        titleBn: "স্ট্রাকচারাল ও আর্কিটেকচারাল",
                        image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800",
                        href: "/services/design/book?service=structural",
                        overlay_color: "#064e3b",
                        overlay_opacity: 90
                    },
                    {
                        id: 'interior',
                        title: "Interior Design",
                        titleBn: "ইন্টেরিয়র ডিজাইন",
                        image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800",
                        href: "/services/design/book?service=interior",
                        overlay_color: "#172554",
                        overlay_opacity: 90
                    }
                ]
            };
        }

        if (!contentMap['design_workflow']) {
            contentMap['design_workflow'] = {
                title: "Designing to Move In",
                titleBn: "ভাবনা থেকে বাড়ি",
                steps: [
                    { id: '1', title: "Meet Your Designer", titleBn: "ডিজাইনরের সাথে সাক্ষাৎ", description: "Share your vision, budget, and requirements with our top interior experts.", image: "https://images.unsplash.com/photo-1503174971373-b1f69850b0c5?q=80&w=800" },
                    { id: '2', title: "Personalized Design", titleBn: "ব্যক্তিগতকৃত ডিজাইন", description: "Get curated 3D designs and floor plans tailored specifically for your space.", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800" }
                ]
            };
        }

        if (!contentMap['design_wizard_structural']) {
            contentMap['design_wizard_structural'] = {
                step1: {
                    title: "একজন ডিজাইনার খুঁজুন",
                    titleEn: "Find a Designer",
                    descriptionEn: "Pick how you'd like to find your structural expert.",
                    descriptionBn: "আপনার কি ধরনের ডিজাইনার পরিষেবা প্রয়োজন?",
                    options: [
                        { id: 'approval', label: "বিল্ডিং অনুমোদন", labelEn: "Building Approval", descriptionEn: "Get necessary approvals from authorities.", descriptionBn: "কর্তৃপক্ষের কাছ থেকে প্রয়োজনীয় অনুমোদন পান।", icon: "FileText", image: "" },
                        { id: 'design', label: "বিল্ডিং ডিজাইন", labelEn: "Building Design", descriptionEn: "Floor plans, elevations, and structural modeling.", descriptionBn: "ফ্লোর প্ল্যান, এলিভেশন এবং স্ট্রাকচারাল মডেলিং।", icon: "Building2", image: "" },
                        { id: 'both', label: "বিল্ডিং অনুমোদন এবং ডিজাইন", labelEn: "Building Approval & Design", descriptionEn: "Comprehensive design and approval package.", descriptionBn: "ব্যাপক ডিজাইন এবং অনুমোদন প্যাকেজ।", icon: "CheckSquare", image: "" }
                    ]
                },
                step2: {
                    title: "নথির চেকলিস্ট",
                    titleEn: "Document Checklist",
                    descriptionEn: "Let us know what documents you already have ready.",
                    descriptionBn: "আপনার কাছে ইতিমধ্যে কী কী নথি প্রস্তুত আছে তা আমাদের জানান।",
                    approvalDocs: [
                        { id: 'hasDeed', label: "দলিল", labelEn: "Deed Document", descriptionEn: "Lease, Purchase, Ownership, Heba, or Power of Attorney", descriptionBn: "ইজারা, ক্রয়, মালিকানা, হেবা, বা পাওয়ার অফ অ্যাটর্নি" },
                        { id: 'hasSurveyMap', label: "ডিজিটাল সার্ভে ম্যাপ", labelEn: "Digital Survey Map", descriptionEn: "With Geo-Coordinates at corners", descriptionBn: "কোণায় জিও-কোঅর্ডিনেট সহ" },
                        { id: 'hasMutation', label: "খতিয়ান / মিউটেশন", labelEn: "Khatian / Mutation", descriptionEn: "Latest mutation copy", descriptionBn: "সর্বশেষ মিউটেশন কপি" },
                        { id: 'hasTax', label: "ভূমি উন্নয়ন কর", labelEn: "Land Development Tax", descriptionEn: "Up to date clear tax receipt", descriptionBn: "আপ টু ডেট ট্যাক্স রসিদ" },
                        { id: 'hasNID', label: "এনআইডি / পাসপোর্ট", labelEn: "NID / Passport", descriptionEn: "Owner's identification", descriptionBn: "মালিকের পরিচয়পত্র" }
                    ],
                    designDocs: [
                        { id: 'hasLandPermit', label: "ল্যান্ড পারমিট", labelEn: "Land Permit", descriptionEn: "Current land use permit", descriptionBn: "বর্তমান ভূমি ব্যবহারের অনুমতি" },
                        { id: 'hasBuildingApproval', label: "বিল্ডিং অনুমোদন", labelEn: "Building Approval", descriptionEn: "Previous or existing approval copies", descriptionBn: "পূর্ববর্তী বা বিদ্যমান অনুমোদনের কপি" }
                    ]
                },
                step4: {
                    title: "ডিজাইনার রুট চয়ন করুন",
                    titleEn: "Choose Designer Route",
                    descriptionEn: "How would you like to proceed with your designer?",
                    descriptionBn: "আপনি কিভাবে আপনার ডিজাইনারের সাথে এগিয়ে যেতে চান?",
                    options: [
                        { id: 'Dalankotha', label: "ঘরবাড়ি দ্বারা প্রস্তাবিত", labelEn: "Suggested by Dalankotha", descriptionEn: "We will assign the best verified expert for your needs automatically.", descriptionBn: "আমরা অটোমেটিক আপনার প্রয়োজনের জন্য সেরা যাচাইকৃত বিশেষজ্ঞ নিয়োগ করব।", icon: "CheckCircle2" },
                        { id: 'list', label: "প্রোফাইল থেকে চয়ন করুন", labelEn: "Choose from Profiles", descriptionEn: "Browse eligible designer profiles and select one yourself.", descriptionBn: "যোগ্য ডিজাইনার প্রোফাইল ব্রাউজ করুন এবং নিজেই একটি নির্বাচন করুন।", icon: "UserCircle" }
                    ]
                }
            };
        }

        if (!contentMap['user_reviews']) {
            contentMap['user_reviews'] = {
                title: "Client Stories",
                items: [
                    { id: '1', title: "আহমেদ কবির", subtitle: "উত্তরা, ঢাকা", description: "ঘরবাড়ির কাজের মান সত্যিই অপূর্ব। আমার বাড়ির ডিজাইন নিয়ে আমি খুবই সন্তুষ্ট।", image: "https://ui-avatars.com/api/?name=Ahmed+Kabir&background=020b1c&color=fff" },
                    { id: '2', title: "সাবরিনা আক্তার", subtitle: "আম্বোরখানা, সিলেট", description: "খুবই পেশাদার সার্ভিস। সময়মতো ডিজাইন এবং প্ল্যানিং ডেলিভারি পেয়েছি। ধন্যবাদ।", image: "https://ui-avatars.com/api/?name=Sabrina+Akter&background=020b1c&color=fff" }
                ]
            };
        }

        if (!contentMap['design_page_layout']) {
            contentMap['design_page_layout'] = [
                { id: '1', type: 'DesignHero', data_key: 'design_hero', hidden: false, title: 'DESIGN HERO BANNERS' },
                { id: '2', type: 'DesignWorkflow', data_key: 'design_workflow', hidden: false, title: 'HOW IT WORKS SLIDER' },
                { id: '3', type: 'DesignShowcase', data_key: 'design_display_config', hidden: false, title: 'CATEGORY SHOWCASE' },
                { id: '4', type: 'UserReviews', data_key: 'user_reviews', hidden: false, title: 'CLIENT STORIES' }
            ];
        }

        return contentMap
    } catch (error) {
        console.error('Critical Error in getHomeContent:', error)
        return {}
    }
}

export async function updateHomeSection(sectionKey: string, content: any) {
    const supabase = await createClient()

    // Check admin
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        console.error('CMS Update Error: No active session', userError)
        return { success: false, message: 'Unauthorized: No active session found. Please log in.' }
    }

    const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single()

    if (profileError || !profile) {
        console.error('CMS Update Error: Profile fetch failed', profileError)
        return { success: false, message: 'Unauthorized: User profile not found.' }
    }

    if (profile.role !== 'admin') {
        console.error(`CMS Update Error: User ${user.id} has role ${profile.role}, expected admin`)
        return { success: false, message: `Forbidden: User role is '${profile.role}', but 'admin' is required.` }
    }

    const { error } = await supabase
        .from('home_content')
        .upsert({
            section_key: sectionKey,
            content: content,
            is_active: true,
            updated_at: new Date().toISOString()
        }, { onConflict: 'section_key' })

    if (error) {
        console.error(`Error updating section ${sectionKey}:`, error)
        return { success: false, message: 'Failed to update section' }
    }

    revalidatePath('/') // Revalidate home page
    revalidatePath('/admin/cms')
    return { success: true, message: 'Section updated successfully' }
}

export async function getCMSDependencies() {
    try {
        const supabase = await createClient()

        // 1. Product/Service Categories (Level 0/1 only for featured categories feature)
        const { data: categories, error: catError } = await supabase
            .from('product_categories')
            .select('id, name, name_bn, icon, type, level, parent_id')
            .in('type', ['product', 'service', 'design'])
            .lt('level', 2)
            .order('level')
            .order('name')
        if (catError) console.error('Error fetching categories:', catError)

        // 2. ALL Design Categories (all levels: ROOT, SUB, ITEM, SUB-ITEM) for the Design display config tree
        const { data: allDesignCategories, error: designCatError } = await supabase
            .from('product_categories')
            .select('id, name, name_bn, icon, icon_url, type, level, parent_id, metadata')
            .eq('type', 'design')
            .order('level')
            .order('name')
        if (designCatError) console.error('Error fetching design categories:', designCatError)

        // 3. Initial Service Packages (for selection)
        const { data: servicePackages, error: serviceError } = await supabase.from('service_packages').select('id, title, images').limit(50)
        if (serviceError) console.error('Error fetching service packages:', serviceError)

        // Build a tree for design categories
        const designTree: any[] = []
        if (allDesignCategories) {
            const catMap = new Map()
            allDesignCategories.forEach((c: any) => catMap.set(c.id, { ...c, subcategories: [] }))
            allDesignCategories.forEach((c: any) => {
                if (c.parent_id && catMap.has(c.parent_id)) {
                    catMap.get(c.parent_id).subcategories.push(catMap.get(c.id))
                } else if (c.level === 0) {
                    designTree.push(catMap.get(c.id))
                }
            })
        }

        return {
            categories: categories || [],
            allDesignCategories: allDesignCategories || [],
            designPackages: designTree,
            servicePackages: servicePackages || []
        }
    } catch (error) {
        console.error('Critical Error in getCMSDependencies:', error)
        return {
            categories: [],
            allDesignCategories: [],
            designPackages: [],
            servicePackages: []
        }
    }
}
