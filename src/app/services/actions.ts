'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

// Helper to generate request number (SR-YYYY-XXXX)
async function generateRequestNumber() {
    const supabase = await createClient()
    const year = new Date().getFullYear()
    const { count } = await supabase
        .from('service_requests')
        .select('*', { count: 'exact', head: true })

    const sequence = (count || 0) + 1
    return `SR-${year}-${sequence.toString().padStart(4, '0')}`
}

export async function submitServiceRequest(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Must be logged in')

    const requestNumber = await generateRequestNumber()

    const { data: request, error } = await supabase
        .from('service_requests')
        .insert({
            request_number: requestNumber,
            customer_id: user.id,
            service_type: data.serviceType,
            project_type: data.projectType,
            requirements: data.requirements,
            status: 'pending_assignment'
        })
        .select()
        .single()

    if (error) return { error: error.message }

    // Create notification for admin
    await supabase.from('notifications').insert({
        user_id: user.id, // In a real app, this would be for admin users
        type: 'service_request_submitted',
        title: 'New Service Request',
        message: `New request ${requestNumber} submitted.`,
        related_type: 'service_request',
        related_id: request.id
    })

    return { success: true, request }
}

export async function assignDesigner(requestId: string, designerId: string, adminNote?: string) {
    const supabase = await createClient()

    const { data: request, error } = await supabase
        .from('service_requests')
        .update({
            assigned_designer_id: designerId,
            status: 'assigned',
            updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single()

    if (error) return { error: error.message }

    // Notify Designer
    const { data: designer } = await supabase.from('designers').select('user_id').eq('id', designerId).single()

    if (designer) {
        await supabase.from('notifications').insert({
            user_id: designer.user_id,
            type: 'new_assignment',
            title: 'New Project Assignment',
            message: `You have been assigned to ${request.request_number}`,
            related_type: 'service_request',
            related_id: requestId
        })
    }

    // Notify Customer
    await supabase.from('notifications').insert({
        user_id: request.customer_id,
        type: 'designer_assigned',
        title: 'Designer Assigned',
        message: `A designer has been assigned to your project ${request.request_number}`,
        related_type: 'service_request',
        related_id: requestId
    })

    return { success: true }
}

export async function scheduleConsultation(requestId: string, consultationData: any) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('service_requests')
        .update({
            status: 'consultation_scheduled',
            consultation_link: consultationData.meetingLink,
            consultation_scheduled_at: consultationData.scheduledAt,
            updated_at: new Date().toISOString()
        })
        .eq('id', requestId)

    if (error) return { error: error.message }

    return { success: true }
}

export async function sendQuotation(requestId: string, quotation: any) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('service_requests')
        .update({
            quotation: quotation,
            quotation_sent_at: new Date().toISOString(),
            status: 'draft_submitted', // or a custom status like 'quotation_sent'
            updated_at: new Date().toISOString()
        })
        .eq('id', requestId)

    if (error) return { error: error.message }

    return { success: true }
}

export async function acceptQuotation(requestId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('service_requests')
        .update({
            quotation_accepted_at: new Date().toISOString(),
            status: 'in_progress',
            advance_payment_status: 'paid', // Assuming payment is handled elsewhere and this is called after
            updated_at: new Date().toISOString()
        })
        .eq('id', requestId)

    if (error) return { error: error.message }

    return { success: true }
}

export async function submitDesignBooking(data: { serviceType: string, details: any }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'You must be logged in to submit a request.' }
    }

    const { data: booking, error } = await supabase
        .from('design_bookings')
        .insert({
            user_id: user.id,
            service_type: data.serviceType,
            status: 'pending',
            details: data.details
        })
        .select()
        .single()

    if (error) {
        console.error('Booking Error:', error)
        return { error: error.message }
    }

    return { success: true, bookingId: booking.id }
}
