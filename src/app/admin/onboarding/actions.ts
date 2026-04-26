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

async function logVerificationAction(profileId: string, action: string, notes?: string, adminId?: string) {
    const adminClient = createAdminClient()
    await adminClient
        .from('verification_logs')
        .insert({
            profile_id: profileId,
            admin_id: adminId,
            action,
            notes
        })
}

export async function createPartner(data: any) {
    console.log("createPartner action started", { email: data.email, roles: data.roles });
    try {
        const supabase = await createClient()
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            console.error("createPartner: No authenticated user", userError);
            throw new Error('Unauthorized: No user session')
        }

        // Verify Admin
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profileError || profile?.role !== 'admin') {
            console.error("createPartner: User is not admin", profile?.role, profileError);
            throw new Error('Unauthorized: Not an admin')
        }

        const adminClient = createAdminClient()

        // 1. Create Auth User (Role: Partner)
        console.log("createPartner: Creating auth user...");
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

        if (authError) {
            console.error("createPartner: Auth user creation failed", authError);
            return { error: authError.message }
        }

        const userId = authUser.user.id
        console.log("createPartner: Auth user created", userId);

        // Determine valid DB role (enum constraint: customer, designer, seller, admin)
        let dbRole = 'customer'
        if (data.roles.seller) dbRole = 'seller'
        else if (data.roles.designer) dbRole = 'designer'
        else if (data.roles.service_provider) dbRole = 'seller' // Map service provider to seller

        // 2. Create Profile Entry (Upsert to handle missing trigger execution)
        const { error: profileUpdateError } = await adminClient
            .from('profiles')
            .upsert({
                id: userId,
                email: data.email,
                role: dbRole,
                full_name: data.businessName,
                phone_number: data.phoneNumber,
                // Verification Data
                nid_number: data.nidNumber,
                nid_front_url: data.nidFrontUrl,
                nid_back_url: data.nidBackUrl,
                trade_license_url: data.tradeLicenseUrl,
                onboarding_step: data.onboardingStep || 1,
                phone_verified: data.phoneVerified || false,
                updated_at: new Date().toISOString(),
            })

        if (profileUpdateError) {
            console.error("createPartner: Profile upsert failed", profileUpdateError);
        } else {
            // Log the initial account provisioning
            await logVerificationAction(userId, 'PROVISIONED', 'Account created by Admin', user.id)
        }

        // 3. Insert into respective tables based on roles
        const errors = []

        // SELLER
        if (data.roles.seller && data.seller_data) {
            console.log("createPartner: Inserting Seller data...");
            const { error } = await adminClient
                .from('sellers')
                .insert({
                    user_id: userId,
                    business_name: data.businessName,
                    current_address: data.seller_data.warehouseAddress, // Note: Schema check needed? The action has 'warehouse_address' in createSeller but 'current_address' here? 
                    // Wait, createSeller used 'warehouse_address'. createPartner uses 'primary_categories' etc. 
                    // Let's check the 'sellers' schema. The action previously had:
                    // primary_categories: data.seller_data.primaryCategories,
                    // commission_rate: data.seller_data.commissionRate || 10,
                    // business_type: data.seller_data.businessType,

                    // REVERTING TO PREVIOUS FIELDS for consistency, but adding explicit type conversion
                    primary_categories: data.seller_data.primaryCategories,
                    commission_rate: Number(data.seller_data.commissionRate || 10),
                    business_type: data.seller_data.businessType,
                    verification_status: 'pending',
                    is_active: true
                })
            if (error) {
                console.error("createPartner: Seller insert failed", error);
                errors.push(`Seller creation failed: ${error.message}`)
            }
        }

        // DESIGNER
        if (data.roles.designer && data.designer_data) {
            console.log("createPartner: Inserting Designer data...");
            const { error } = await adminClient
                .from('designers')
                .insert({
                    user_id: userId,
                    company_name: data.businessName,
                    specializations: data.designer_data.specializations,
                    portfolio_url: data.designer_data.portfolioUrl,
                    experience_years: Number(data.designer_data.experienceYears || 0),
                    verification_status: 'pending',
                    is_active: true
                })
            if (error) {
                console.error("createPartner: Designer insert failed", error);
                errors.push(`Designer creation failed: ${error.message}`)
            }
        }

        // SERVICE PROVIDER
        if (data.roles.service_provider && data.service_data) {
            console.log("createPartner: Inserting Service Provider data...");
            const { error } = await adminClient
                .from('service_providers')
                .insert({
                    user_id: userId,
                    business_name: data.businessName,
                    service_types: data.service_data.serviceTypes,
                    experience_years: Number(data.service_data.experienceYears || 0),
                    verification_status: 'pending',
                    is_active: true
                })
            if (error) {
                console.error("createPartner: Service Provider insert failed", error);
                errors.push(`Service Provider creation failed: ${error.message}`)
            }
        }

        if (errors.length > 0) {
            console.error("createPartner: Partial failures", errors);
            return { error: errors.join(', ') }
        }

        console.log("createPartner: Success");
        return { success: true, userId }

    } catch (e: any) {
        console.error("createPartner: Critical Exception", e);
        return { error: e.message || "Internal Server Error" }
    }
}

// generateDemoPartners has been removed to ensure production security
export async function getUsers() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching users:', error)
        return []
    }
    return data
}

export async function getPartners() {
    const supabase = await createClient()

    // Fetch from all partner-related tables
    const [sellers, designers, serviceProviders] = await Promise.all([
        supabase.from('sellers').select('*, profile:profiles(*)'),
        supabase.from('designers').select('*, profile:profiles(*)'),
        supabase.from('service_providers').select('*, profile:profiles(*)')
    ])

    // Combine and deduplicate by user_id
    const partnersMap = new Map()

    sellers.data?.forEach(s => {
        partnersMap.set(s.user_id, {
            id: s.user_id,
            email: s.profile?.email,
            businessName: s.business_name,
            role: s.profile?.role,
            roles: { seller: true },
            seller_data: s,
            profile: s.profile
        })
    })

    designers.data?.forEach(d => {
        const existing = partnersMap.get(d.user_id) || { id: d.user_id, email: d.profile?.email, businessName: d.company_name, role: d.profile?.role, roles: {}, profile: d.profile }
        partnersMap.set(d.user_id, {
            ...existing,
            roles: { ...existing.roles, designer: true },
            designer_data: d
        })
    })

    serviceProviders.data?.forEach(sp => {
        const existing = partnersMap.get(sp.user_id) || { id: sp.user_id, email: sp.profile?.email, businessName: sp.business_name, role: sp.profile?.role, roles: {}, profile: sp.profile }
        partnersMap.set(sp.user_id, {
            ...existing,
            roles: { ...existing.roles, service_provider: true },
            service_data: sp
        })
    })

    return Array.from(partnersMap.values())
}

export async function getCategories() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('product_categories')
        .select('id, name, name_bn, type')
        .is('parent_id', null)

        .order('name')

    if (error) {
        console.error('Error fetching categories:', error)
        return []
    }
    return data || []
}

export async function updatePartner(userId: string, data: any) {
    console.log("updatePartner action started", { userId, roles: data.roles });
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // Verify if current user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user?.id)
            .single()

        if (profile?.role !== 'admin' && user?.id !== userId) {
            throw new Error('Unauthorized')
        }

        
        const adminClient = createAdminClient()

        let dbRole = 'customer'
        if (data.roles?.seller) dbRole = 'seller'
        else if (data.roles?.designer) dbRole = 'designer'
        else if (data.roles?.service_provider) dbRole = 'seller'
        
        console.log(`[updatePartner] Updating profile for user: ${userId}`, {
            role: dbRole,
            step: data.onboardingStep,
            businessName: data.businessName
        });

        // 1. Update Profile Entry
        const { error: profileError } = await adminClient
            .from('profiles')
            .update({
                full_name: data.businessName,
                phone_number: data.phoneNumber,
                nid_number: data.nidNumber,
                nid_front_url: data.nidFrontUrl,
                nid_back_url: data.nidBackUrl,
                trade_license_url: data.tradeLicenseUrl,
                onboarding_step: data.onboardingStep,
                phone_verified: data.phoneVerified,
                role: dbRole,
                updated_at: new Date().toISOString(),
            })
            .eq('id', userId)

        if (profileError) {
            console.error("[updatePartner] Profile update FAILED:", profileError);
            return { error: profileError.message }
        } else {
            console.log("[updatePartner] Profile update SUCCESSFUL");
            // Log update if significant fields changed (optional, but good for audit)
            await logVerificationAction(userId, 'PROFILE_UPDATED', 'Admin updated profile details', user.id)
        }

        // 2. Update respective tables
        const errors = []

        // SELLER
        if (data.roles.seller && data.seller_data) {
            const { error } = await adminClient
                .from('sellers')
                .upsert({
                    user_id: userId,
                    business_name: data.businessName,
                    primary_categories: data.seller_data.primaryCategories,
                    commission_rate: Number(data.seller_data.commissionRate || 10),
                    business_type: data.seller_data.businessType,
                    updated_at: new Date().toISOString()
                })
            if (error) errors.push(`Seller update failed: ${error.message}`)
        } else {
            // Role removed or not present: Delete entry if it exists
            const { error } = await adminClient.from('sellers').delete().eq('user_id', userId)
            if (error) console.error("Error removing seller role:", error)
        }

        // DESIGNER
        if (data.roles.designer && data.designer_data) {
            const { error } = await adminClient
                .from('designers')
                .upsert({
                    user_id: userId,
                    company_name: data.businessName,
                    specializations: data.designer_data.specializations,
                    portfolio_url: data.designer_data.portfolioUrl,
                    experience_years: Number(data.designer_data.experienceYears || 0),
                    updated_at: new Date().toISOString()
                })
            if (error) errors.push(`Designer update failed: ${error.message}`)
        } else {
            // Role removed or not present: Delete entry
            const { error } = await adminClient.from('designers').delete().eq('user_id', userId)
            if (error) console.error("Error removing designer role:", error)
        }

        // SERVICE PROVIDER
        if (data.roles.service_provider && data.service_data) {
            const { error } = await adminClient
                .from('service_providers')
                .upsert({
                    user_id: userId,
                    business_name: data.businessName,
                    service_types: data.service_data.serviceTypes,
                    experience_years: Number(data.service_data.experienceYears || 0),
                    updated_at: new Date().toISOString()
                })
            if (error) errors.push(`Service Provider update failed: ${error.message}`)
        } else {
            // Role removed or not present: Delete entry
            const { error } = await adminClient.from('service_providers').delete().eq('user_id', userId)
            if (error) console.error("Error removing service provider role:", error)
        }

        if (errors.length > 0) return { error: errors.join(', ') }

        return { success: true }
    } catch (e: any) {
        console.error("updatePartner: Critical Exception", e);
        return { error: e.message || "Internal Server Error" }
    }
}

export async function updateUserProfile(userId: string, data: any) {
    console.log("updateUserProfile action started", { userId });
    try {
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
        const { error } = await adminClient
            .from('profiles')
            .update({
                full_name: data.fullName,
                phone: data.phone,
                address: data.address,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)

        if (error) {
            console.error("updateUserProfile failed", error);
            return { error: error.message }
        }

        return { success: true }
    } catch (e: any) {
        console.error("updateUserProfile exception", e);
        return { error: e.message || "Internal Server Error" }
    }
}

export async function updateOnboardingStep(userId: string, step: number) {
    try {
        const supabase = await createClient()
        const adminClient = createAdminClient()
        
        const { error } = await adminClient
            .from('profiles')
            .update({ onboarding_step: step })
            .eq('id', userId)

        if (error) throw error
        return { success: true }
    } catch (err: any) {
        console.error("updateOnboardingStep failed:", err)
        return { error: err.message }
    }
}

export async function verifyPartner(userId: string, adminId: string) {
    try {
        const adminClient = createAdminClient()
        
        // 1. Update Profile Status
        const { error: profileError } = await adminClient
            .from('profiles')
            .update({ 
                onboarding_status: 'verified',
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)

        if (profileError) throw profileError

        // 2. Update status in role-specific tables
        const tables = ['sellers', 'designers', 'service_providers']
        for (const table of tables) {
            await adminClient
                .from(table)
                .update({ verification_status: 'approved' })
                .eq('user_id', userId)
        }

        // 3. Log Action
        await logVerificationAction(userId, 'APPROVED', 'Partner identity and business verified by admin', adminId)

        return { success: true }
    } catch (err: any) {
        console.error("verifyPartner failed:", err)
        return { error: err.message }
    }
}

export async function rejectPartner(userId: string, adminId: string, reason: string) {
    try {
        const adminClient = createAdminClient()
        
        // 1. Reset Status and Update Step for correction
        const { error: profileError } = await adminClient
            .from('profiles')
            .update({ 
                onboarding_status: 'rejected',
                onboarding_step: 1, // Send back to start or specific step
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)

        if (profileError) throw profileError

        // 2. Log Action
        await logVerificationAction(userId, 'REJECTED', reason, adminId)

        return { success: true }
    } catch (err: any) {
        console.error("rejectPartner failed:", err)
        return { error: err.message }
    }
}
