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

export async function createPartner(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Verify Admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single()

    if (profile?.role !== 'admin') {
        throw new Error('Unauthorized')
    }

    const adminClient = createAdminClient()

    // 1. Create Auth User (Role: Partner)
    // Note: We're using 'partner' role, or fallback to 'seller' if enum not updated yet, 
    // but the migration added 'partner' so we should use it.
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
        email: data.email,
        password: data.temporaryPassword,
        user_metadata: {
            role: 'partner',
            full_name: data.businessName,
            roles: data.roles // Store capabilities in metadata too
        },
        email_confirm: true
    })

    if (authError) return { error: authError.message }

    const userId = authUser.user.id

    // 2. Create Profile Entry (if not auto-created by trigger, but we update it just in case)
    // The trigger 'on_auth_user_created' usually creates the profile. 
    // We update it to ensure role is correct.
    await adminClient
        .from('profiles')
        .update({ role: 'partner', full_name: data.businessName })
        .eq('id', userId)

    // 3. Insert into respective tables based on roles
    const errors = []

    // SELLER
    if (data.roles.seller && data.seller_data) {
        const { error } = await adminClient
            .from('sellers')
            .insert({
                user_id: userId,
                business_name: data.businessName,
                primary_categories: data.seller_data.primaryCategories,
                commission_rate: data.seller_data.commissionRate || 10,
                business_type: data.seller_data.businessType,
                verification_status: 'pending',
                is_active: true
            })
        if (error) errors.push(`Seller creation failed: ${error.message}`)
    }

    // DESIGNER
    if (data.roles.designer && data.designer_data) {
        const { error } = await adminClient
            .from('designers')
            .insert({
                user_id: userId,
                company_name: data.businessName,
                specializations: data.designer_data.specializations,
                portfolio_url: data.designer_data.portfolioUrl,
                experience_years: data.designer_data.experienceYears,
                verification_status: 'pending',
                is_active: true
            })
        if (error) errors.push(`Designer creation failed: ${error.message}`)
    }

    // SERVICE PROVIDER
    if (data.roles.service_provider && data.service_data) {
        const { error } = await adminClient
            .from('service_providers')
            .insert({
                user_id: userId,
                business_name: data.businessName,
                service_types: data.service_data.serviceTypes,
                experience_years: data.service_data.experienceYears,
                verification_status: 'pending',
                is_active: true
            })
        if (error) errors.push(`Service Provider creation failed: ${error.message}`)
    }

    if (errors.length > 0) {
        // Cleanup if critical failures? Or just report partial success?
        // For now, logging errors and returning them.
        return { error: errors.join(', ') }
    }

    return { success: true, userId }
}

export async function generateDemoPartners() {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    // Check if admin
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
    if (profile?.role !== 'admin') throw new Error('Unauthorized')

    const demoPartners = [
        {
            email: "global@ghorbari.com",
            password: "password123",
            businessName: "Global Construction & Co",
            roles: { seller: true, designer: true, service_provider: true },
            seller_data: { primaryCategories: ["Cement", "Steel"], commissionRate: 12 },
            designer_data: { specializations: ["Architectural Design", "Urban Planning"], portfolioUrl: "https://global.com", experienceYears: 20 },
            service_data: { serviceTypes: ["Construction Work", "HVAC Installation"], experienceYears: 15 }
        },
        {
            email: "creative@ghorbari.com",
            password: "password123",
            businessName: "Creative Builders",
            roles: { seller: false, designer: true, service_provider: true },
            designer_data: { specializations: ["Interior Design", "3D Visualization"], portfolioUrl: "https://creative.com", experienceYears: 8 },
            service_data: { serviceTypes: ["Painting Service", "Carpentry"], experienceYears: 10 }
        },
        {
            email: "studiox@ghorbari.com",
            password: "password123",
            businessName: "Studio X",
            roles: { seller: false, designer: true, service_provider: false },
            designer_data: { specializations: ["Architectural Design", "Landscape Design"], portfolioUrl: "https://studiox.com", experienceYears: 5 }
        },
        {
            email: "sevenrings@ghorbari.com",
            password: "password123",
            businessName: "Seven Rings Ltd",
            roles: { seller: true, designer: false, service_provider: false },
            seller_data: { primaryCategories: ["Cement"], commissionRate: 5 }
        },
        {
            email: "bsrm@ghorbari.com",
            password: "password123",
            businessName: "BSRM Official",
            roles: { seller: true, designer: false, service_provider: false },
            seller_data: { primaryCategories: ["Steel"], commissionRate: 5 }
        },
        // Attempt to upgrade existing sellers if they exist by email, or create new ones
        // "Seven Rings Ltd" and "BSRM Official" are likely existing sellers. 
        // We will skip creating them here to avoid duplicates, but we could upgrade them if we knew their emails.
        // Instead, let's create a "Mega Mart" as a pure seller demo.
        {
            email: "megamart@ghorbari.com",
            password: "password123",
            businessName: "Mega Materials Mart",
            roles: { seller: true, designer: false, service_provider: false },
            seller_data: { primaryCategories: ["Tiles", "Sanitary"], commissionRate: 8 }
        }
    ]

    const results = []

    for (const partner of demoPartners) {
        // cleanup existing
        // Check if user exists by email
        const { data: { users } } = await adminClient.auth.admin.listUsers()
        const existing = users.find((u: any) => u.email === partner.email)

        if (existing) {
            // Delete to recreate (SAFE FOR DEMO ONLY)
            await adminClient.auth.admin.deleteUser(existing.id)
        }

        const res = await createPartner({
            ...partner,
            temporaryPassword: partner.password
        })
        results.push({ name: partner.businessName, ...res })
    }

    return results
}
