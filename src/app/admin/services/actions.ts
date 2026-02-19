'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getServiceFactoryData() {
    const supabase = await createClient()

    // 1. Fetch all Service Providers
    const { data: providers, error: provError } = await supabase
        .from('service_providers')
        .select('id, business_name, contact_person, service_types, verification_status')
        .order('business_name')

    if (provError) console.error('Error fetching providers:', provError)

    // 2. Fetch all Categories (assuming we use product_categories for services too, or just a hardcoded list if none exist)
    // Ideally, we'd filter by type='service' if that column existed, but we'll fetch all and let UI filter or show all.
    const { data: categories, error: catError } = await supabase
        .from('product_categories')
        .select('*')
        .order('name')

    if (catError) console.error('Error fetching categories:', catError)

    return {
        providers: providers || [],
        categories: categories || []
    }
}

export async function updateProviderServices(providerId: string, serviceTypes: string[]) {
    const supabase = await createClient()

    // Check if admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { success: false, message: 'Admin access required' }

    const { error } = await supabase
        .from('service_providers')
        .update({
            service_types: serviceTypes,
            updated_at: new Date().toISOString()
        })
        .eq('id', providerId)

    if (error) {
        console.error('Error updating provider services:', error)
        return { success: false, message: 'Failed to update services' }
    }

    revalidatePath('/admin/services')
    return { success: true, message: 'Services updated successfully' }
}
