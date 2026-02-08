'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createDesigner(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Verify if current user is admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single()

    if (profile?.role !== 'admin') {
        throw new Error('Unauthorized')
    }

    const adminClient = createAdminClient()

    // 1. Create Auth User
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
        email: data.email,
        password: data.temporaryPassword,
        user_metadata: { role: 'designer', full_name: data.contactPersonName },
        email_confirm: true
    })

    if (authError) return { error: authError.message }

    // 2. Create Designer Entry
    const { error: designerError } = await adminClient
        .from('designers')
        .insert({
            user_id: authUser.user.id,
            company_name: data.companyName,
            contact_person_name: data.contactPersonName,
            specializations: data.specializations,
            years_of_experience: data.yearsOfExperience,
            business_registration_number: data.businessRegistrationNumber,
            professional_license_number: data.professionalLicenseNumber,
            hourly_rate: data.hourlyRate,
            flat_rates: data.flatRates,
            minimum_project_size: data.minimumProjectSize,
            business_address: data.businessAddress,
            service_areas: data.serviceAreas,
            website_url: data.websiteUrl,
            social_media_links: data.socialMediaLinks,
            bank_details: data.bankDetails,
            verification_status: 'pending'
        })

    if (designerError) return { error: designerError.message }

    // 3. Send Email logic would go here (e.g., via Resend or Supabase)

    return { success: true, userId: authUser.user.id }
}

export async function createSeller(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single()

    if (profile?.role !== 'admin') {
        throw new Error('Unauthorized')
    }

    const adminClient = createAdminClient()

    // 1. Create Auth User
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
        email: data.email,
        password: data.temporaryPassword,
        user_metadata: { role: 'seller', full_name: data.contactPersonName },
        email_confirm: true
    })

    if (authError) return { error: authError.message }

    // 2. Create Seller Entry
    const { error: sellerError } = await adminClient
        .from('sellers')
        .insert({
            user_id: authUser.user.id,
            business_name: data.businessName,
            contact_person_name: data.contactPersonName,
            business_type: data.businessType,
            primary_categories: data.primaryCategories,
            warehouse_address: data.warehouseAddress,
            service_areas: data.serviceAreas,
            business_hours: data.businessHours,
            minimum_order_value: data.minimumOrderValue,
            delivery_capabilities: data.deliveryCapabilities,
            bank_details: data.bankDetails,
            commission_rate: data.commissionRate,
            payment_terms: data.paymentTerms,
            verification_status: 'pending'
        })

    if (sellerError) return { error: sellerError.message }

    return { success: true, userId: authUser.user.id }
}
