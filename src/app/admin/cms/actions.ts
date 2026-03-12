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

        return {
            categories: categories || [],
            allDesignCategories: allDesignCategories || [],
            designPackages: [], // kept for backward compat
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
