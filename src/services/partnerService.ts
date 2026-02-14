import { createClient } from '@/utils/supabase/client'

export async function getPartnerById(id: string) {
    const supabase = createClient()

    // 1. Resolve User ID (Handle case where ID might be a seller_id, designer_id, etc.)
    let userId = id

    // Check if UUID exists in profiles (fastest check if it's already a user_id)
    const { data: profileCheck } = await supabase.from('profiles').select('id').eq('id', id).single()

    if (!profileCheck) {
        // Not a profile ID, try finding it in sellers/designers
        const { data: seller } = await supabase.from('sellers').select('user_id').eq('id', id).single()
        if (seller) userId = seller.user_id
        else {
            const { data: designer } = await supabase.from('designers').select('user_id').eq('id', id).single()
            if (designer) userId = designer.user_id
            else {
                const { data: sp } = await supabase.from('service_providers').select('user_id').eq('id', id).single()
                if (sp) userId = sp.user_id
                // If still null, return null (invalid ID)
                else return null
            }
        }
    }

    // 2. Fetch Profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (profileError || !profile) return null

    // 3. Fetch Role Data in parallel (using userId)
    const [sellerRes, designerRes, serviceRes] = await Promise.all([
        supabase.from('sellers').select('*').eq('user_id', userId).single(),
        supabase.from('designers').select('*').eq('user_id', userId).single(),
        supabase.from('service_providers').select('*').eq('user_id', userId).single()
    ])

    const seller = sellerRes.data
    const designer = designerRes.data
    const serviceProvider = serviceRes.data

    // 3. Aggregate Roles
    const roles = []
    if (seller) roles.push('seller')
    if (designer) roles.push('designer')
    if (serviceProvider) roles.push('service_provider')

    // 4. Construct Unified Partner Object
    // Prioritize business name from roles, fallback to profile name
    const businessName = seller?.business_name || designer?.company_name || serviceProvider?.business_name || profile.full_name

    // Aggregate Tags/Capabilities
    const tags = [
        ...(seller?.primary_categories || []),
        ...(designer?.specializations || []),
        ...(serviceProvider?.service_types || [])
    ]

    return {
        id: profile.id,
        name: businessName,
        location: seller?.warehouse_address || designer?.business_address || serviceProvider?.location || "Bangladesh",
        roles,
        rating: Math.max(seller?.rating || 0, designer?.rating || 0, serviceProvider?.rating || 0) || 5.0, // Default/Max
        reviews: 0, // TODO: Implement reviews aggregation
        bio: designer?.bio || serviceProvider?.bio || "Verified Ghorbari Partner",
        tags: Array.from(new Set(tags)).slice(0, 8), // Unique tags, max 8
        details: {
            seller,
            designer,
            serviceProvider
        },
        stats: {
            projects: (designer?.experience_years || 0) * 5 + (serviceProvider?.experience_years || 0) * 10, // Mock calculation
            products: 0, // Would count actual products
            happyClients: 100 // Mock
        }
    }
}
