'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createServiceRequestAdmin(data: any) {
    const supabase = await createClient()

    // 1. Verify Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { error: 'Unauthorized: Admin only' }

    // 2. Generate Request Number
    const year = new Date().getFullYear()
    const { count } = await supabase.from('service_requests').select('*', { count: 'exact', head: true })
    const sequence = (count || 0) + 1
    const requestNumber = `SR-${year}-${sequence.toString().padStart(4, '0')}`

    // 3. Create Request
    const { data: request, error } = await supabase
        .from('service_requests')
        .insert({
            request_number: requestNumber,
            customer_id: data.customerId,
            service_type: data.serviceType,
            requirements: data.requirements, // JSONB
            status: 'confirmed', // Admin created, so it's confirmed
            quotation: {
                line_items: data.lineItems,
                total_amount: data.totalAmount,
                generated_at: new Date().toISOString(),
                generated_by: user.id
            },
            created_at: new Date().toISOString()
        })
        .select()
        .single()

    if (error) return { error: error.message }

    revalidatePath('/admin/concierge')
    return { success: true, request }
}
