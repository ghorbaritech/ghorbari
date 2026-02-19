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

    const { data: providers } = await supabase
        .from('profiles')
        .select('id, business_name, contact_person, phone_number')
        .eq('role', 'service_provider')

    // For now, we might not have 'design' specific categories in product_categories
    // So we'll fetch all and let the UI filter or just return hardcoded design types if table is empty
    const { data: categories } = await supabase
        .from('product_categories')
        .select('*')

    return {
        servicePackages: servicePackages || [],
        categories: categories || []
    }
}
