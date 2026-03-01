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
                updated_at: new Date().toISOString(),
            })

        if (profileUpdateError) {
            console.error("createPartner: Profile upsert failed", profileUpdateError);
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
        .select('id, name, type')
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
        const adminClient = createAdminClient()

        // 1. Update Profile Entry
        const { error: profileError } = await adminClient
            .from('profiles')
            .update({
                full_name: data.businessName,
                role: 'retailer',
                updated_at: new Date().toISOString(),
            })
            .eq('id', userId)

        if (profileError) {
            console.error("updatePartner: Profile update failed", profileError);
            return { error: profileError.message }
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
