import { createClient } from '@/utils/supabase/server'

export async function getSellerProfile(sellerId: string) {
    const supabase = await createClient()

    // 1. Resolve seller — accept either seller.id OR profiles.id
    let sellerData: any = null

    const { data: directSeller } = await supabase
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

    if (!sellerData) return null

    // 2. Fetch products, reviews, and order stats in parallel
    const [productsRes, reviewsRes, ordersRes] = await Promise.all([
        supabase
            .from('products')
            .select('id, title, base_price, images, category_id, status, sku')
            .eq('seller_id', sellerData.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(8),

        supabase
            .from('reviews')
            .select('id, rating, comment, created_at, reviewer_id, reviewer:profiles(full_name)')
            .eq('target_id', sellerData.id)
            .eq('target_type', 'seller')
            .order('created_at', { ascending: false })
            .limit(10),

        supabase
            .from('orders')
            .select('id, total_amount, status')
            .eq('seller_id', sellerData.id)
            .eq('status', 'delivered')
    ])

    const products = productsRes.data || []
    const reviews = reviewsRes.data || []
    const orders = ordersRes.data || []

    // 3. Compute stats
    const totalOrders = sellerData.total_orders || orders.length
    const totalOrderValue = sellerData.total_order_value ||
        orders.reduce((sum: number, o: any) => sum + (parseFloat(o.total_amount) || 0), 0)

    const avgRating = reviews.length > 0
        ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
        : sellerData.rating || 0

    const ratingBreakdown = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter((r: any) => r.rating === star).length
    }))

    return {
        id: sellerData.id,
        userId: sellerData.user_id,
        businessName: sellerData.business_name,
        businessType: sellerData.business_type || 'Retailer',
        bio: sellerData.bio || 'Verified supplier on the Ghorbari platform.',
        shopPhotoUrl: sellerData.shop_photo_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&q=80',
        galleryUrls: sellerData.gallery_urls?.length > 0
            ? sellerData.gallery_urls
            : [
                'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80',
                'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80',
                'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80',
                'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80',
                'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
                'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=600&q=80',
            ],
        termsAndConditions: sellerData.terms_and_conditions || null,
        location: sellerData.location || sellerData.warehouse_address || 'Bangladesh',
        phone: sellerData.phone || null,
        email: sellerData.email || null,
        website: sellerData.website || null,
        foundedYear: sellerData.founded_year || null,
        primaryCategories: sellerData.primary_categories || [],
        verificationStatus: sellerData.verification_status,
        stats: {
            totalOrders,
            totalOrderValue,
            productsListed: products.length,
            avgRating: Math.round(avgRating * 10) / 10
        },
        products,
        reviews,
        ratingBreakdown
    }
}
