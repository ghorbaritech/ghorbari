import { createClient } from '@/utils/supabase/server'

export async function getSellerProfile(sellerId: string) {
    const supabase = await createClient()

    // 1. Resolve seller & base user — accept either seller.id OR profiles.id
    let sellerData: any = null

    // First try finding directly by seller ID
    let { data: directSeller } = await supabase
        .from('sellers')
        .select('*')
        .eq('id', sellerId)
        .single()

    if (directSeller) {
        sellerData = directSeller
    } else {
        // Try by user_id (profile id)
        const { data: byUser } = await supabase
            .from('sellers')
            .select('*')
            .eq('user_id', sellerId)
            .single()
        sellerData = byUser
    }

    // 2. Try fetching Designer Profile (if any) linked to this user
    let designerData: any = null
    let targetUserId = sellerData?.user_id || sellerId; // fallback to sellerId if it might be a user_id without a seller profile

    // Some partners might ONLY be designers and not have a row in `sellers`.
    // Let's ensure we fetch their designer row either way.
    if (targetUserId) {
        const { data: dData } = await supabase
            .from('designers')
            .select('*')
            .eq('user_id', targetUserId)
            .single()
        if (dData) designerData = dData;
    }

    if (!sellerData && !designerData) return null

    // 3. Fetch products, reviews, and order stats in parallel
    // We base these off the targetUserId mapping to the seller ID or designer target types
    const fetchSellerId = sellerData?.id || 'none'; // so we don't query null
    const [productsRes, reviewsRes, ordersRes, packagesRes] = await Promise.all([
        supabase
            .from('products')
            .select('id, title, base_price, images, category_id, status, sku')
            .eq('seller_id', fetchSellerId)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(8),

        supabase
            .from('reviews')
            .select('id, rating, comment, created_at, reviewer_id, reviewer:profiles(full_name)')
            .or(`target_id.eq.${fetchSellerId},target_id.eq.${designerData?.id || 'none'}`)
            .order('created_at', { ascending: false })
            .limit(10),

        supabase
            .from('orders')
            .select('id, total_amount, status')
            .eq('seller_id', fetchSellerId)
            .eq('status', 'delivered'),

        supabase
            .from('design_packages')
            .select('*, category:product_categories(name)')
            .eq('designer_id', designerData?.id || 'none')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
    ])

    const products = productsRes.data || []
    const reviews = reviewsRes.data || []
    const orders = ordersRes.data || []
    const designPackages = packagesRes.data || []

    // 4. Compute stats
    const totalOrders = (sellerData?.total_orders || orders.length) + (designerData?.completed_projects || 0)
    const totalOrderValue = sellerData?.total_order_value ||
        orders.reduce((sum: number, o: any) => sum + (parseFloat(o.total_amount) || 0), 0)

    let avgRating = 0;
    if (reviews.length > 0) {
        avgRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
    } else {
        avgRating = designerData?.rating || sellerData?.rating || 0;
    }

    const ratingBreakdown = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter((r: any) => r.rating === star).length
    }))

    // Choose primary display metadata (prefer seller, fallback to designer)
    const businessName = sellerData?.business_name || designerData?.company_name || 'Partner Profile';
    const businessType = sellerData?.business_type || (designerData ? 'Design Studio' : 'Retailer');
    const bio = sellerData?.bio || designerData?.bio || 'Verified partner on the Ghorbari platform.';
    const shopPhotoUrl = sellerData?.shop_photo_url || designerData?.portfolio_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&q=80';
    const galleryUrls = sellerData?.gallery_urls?.length > 0
        ? sellerData.gallery_urls
        : [
            'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80',
            'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80',
            'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80',
            'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80',
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
            'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=600&q=80',
        ];

    return {
        // Core Profile Identifiers
        id: sellerData?.id || targetUserId,
        userId: targetUserId,

        // Display Info
        businessName,
        businessType,
        bio,
        shopPhotoUrl,
        galleryUrls,

        // Contact & Misc
        termsAndConditions: sellerData?.terms_and_conditions || null,
        location: sellerData?.location || sellerData?.warehouse_address || 'Bangladesh',
        phone: sellerData?.phone || null,
        email: sellerData?.email || null,
        website: sellerData?.website || designerData?.portfolio_url || null,
        foundedYear: sellerData?.founded_year || null,
        primaryCategories: sellerData?.primary_categories || [],
        verificationStatus: sellerData?.verification_status || 'verified',

        // Modules included for this partner
        hasProducts: products.length > 0 || !!sellerData,
        hasDesignServices: !!designerData,

        // Designer Specific Data
        designerDetails: designerData ? {
            id: designerData.id,
            experienceYears: designerData.experience_years,
            specializations: designerData.specializations || [],
            portfolioUrl: designerData.portfolio_url
        } : null,

        // Apprended Entities
        stats: {
            totalOrders,
            totalOrderValue,
            productsListed: products.length,
            avgRating: Math.round(avgRating * 10) / 10
        },
        products,
        designPackages,
        reviews,
        ratingBreakdown
    }
}
