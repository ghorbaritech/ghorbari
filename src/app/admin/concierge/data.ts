'use server'

import { createClient } from '@/utils/supabase/server'

export async function getConciergeData() {
    const supabase = await createClient()

    const { data: servicePackages } = await supabase
        .from('service_packages')
        .select(`
            *,
            service_providers (
                id,
                business_name,
                contact_person
            )
        `)
        .eq('is_active', true)

    // Fetch service providers from service_providers joined with profiles
    const { data: serviceProviders } = await supabase
        .from('service_providers')
        .select(`
            id,
            user_id,
            business_name,
            profiles:user_id (
                full_name,
                phone_number,
                email
            )
        `)
        .eq('is_active', true)

    const formattedProviders = (serviceProviders || []).map(sp => ({
        id: sp.id,
        userId: sp.user_id,
        business_name: sp.business_name,
        contact_person: (sp.profiles as any)?.full_name || 'No Name',
        phone_number: (sp.profiles as any)?.phone_number || '',
        email: (sp.profiles as any)?.email || '',
        role: 'service_provider'
    }))

    // Fetch designers from designers joined with profiles
    const { data: designersData } = await supabase
        .from('designers')
        .select(`
            id,
            user_id,
            company_name,
            profiles:user_id (
                full_name,
                phone_number,
                email
            )
        `)
        .eq('is_active', true)

    const formattedDesigners = (designersData || []).map(d => ({
        id: d.id,
        userId: d.user_id,
        business_name: d.company_name,
        contact_person: (d.profiles as any)?.full_name || 'No Name',
        phone_number: (d.profiles as any)?.phone_number || '',
        email: (d.profiles as any)?.email || '',
        role: 'designer'
    }))

    const { data: categories } = await supabase
        .from('product_categories')
        .select('*')

    return {
        servicePackages: servicePackages || [],
        providers: formattedProviders,
        designers: formattedDesigners,
        categories: categories || []
    }
}
