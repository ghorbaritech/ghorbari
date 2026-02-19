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

        // 1. Categories (Filtered: Product/Service/Design, Level 0/1 only)
        const { data: categories, error: catError } = await supabase
            .from('product_categories')
            .select('*')
            .in('type', ['product', 'service', 'design'])
            .lt('level', 2) // Exclude items (level 2)
            .order('name')
        if (catError) console.error('Error fetching categories:', catError)

        // 2. Initial Design Packages (for selection)
        const { data: designPackages, error: designError } = await supabase.from('design_packages').select('id, title, images').limit(50)
        if (designError) console.error('Error fetching design packages:', designError)

        // 3. Initial Service Packages (for selection)
        const { data: servicePackages, error: serviceError } = await supabase.from('service_packages').select('id, title, images').limit(50)
        if (serviceError) console.error('Error fetching service packages:', serviceError)

        return {
            categories: categories || [],
            designPackages: designPackages || [],
            servicePackages: servicePackages || []
        }
    } catch (error) {
        console.error('Critical Error in getCMSDependencies:', error)
        return {
            categories: [],
            designPackages: [],
            servicePackages: []
        }
    }
}
