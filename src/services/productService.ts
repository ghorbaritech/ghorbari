import { createClient } from '@/utils/supabase/client'

export async function getProducts(options: {
    query?: string,
    categoryId?: string,
    categoryName?: string,
    minPrice?: number,
    maxPrice?: number,
    limit?: number
} = {}) {
    const supabase = createClient()

    // Use !inner if filtering by category name to ensure we only get products with that category
    const categoryJoin = options.categoryName ? 'category:product_categories!inner(name)' : 'category:product_categories(name)'

    let q = supabase.from('products').select(`
    *,
    seller:sellers(business_name),
    ${categoryJoin}
  `).eq('status', 'active')

    if (options.query) {
        q = q.textSearch('title', options.query, {
            config: 'english',
            type: 'phrase'
        })
    }

    if (options.categoryId) {
        q = q.eq('category_id', options.categoryId)
    }

    if (options.categoryName) {
        q = q.eq('category.name', options.categoryName)
    }

    if (options.minPrice) {
        q = q.gte('base_price', options.minPrice)
    }

    if (options.maxPrice) {
        q = q.lte('base_price', options.maxPrice)
    }

    if (options.limit) {
        q = q.limit(options.limit)
    }

    const { data, error } = await q.order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching products:', error)
        return []
    }

    return data
}

export async function getCategories(type?: 'product' | 'service' | 'design') {
    const supabase = createClient()
    let q = supabase
        .from('product_categories')
        .select('*')

    if (type) {
        q = q.eq('type', type)
    }

    const { data, error } = await q.order('name')

    if (error) {
        console.error('Error fetching categories:', error)
        return []
    }

    return data
}

export async function getProductBySku(sku: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('products')
        .select('*, seller:sellers(*), category:product_categories(*)')
        .eq('sku', sku)
        .single()

    if (error) {
        console.error('Error fetching product:', error)
        return null
    }

    return data
}

export async function getProductById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            seller:sellers(*),
            category:product_categories(*)
        `)
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching product:', error)
        return null
    }

    return data
}

export async function getBrands() {
    // Mock brands since column missing in DB
    return [
        "Seven Rings",
        "Bashundhara",
        "KSRM",
        "BSRM",
        "Berger",
        "Asian Paints",
        "Scan Cement",
        "Metrocem"
    ];
}
export async function getFlashDeals(limit: number = 5) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            category:product_categories(name)
        `)
        .not('discount_price', 'is', null)
        .eq('status', 'active')
        .limit(limit)

    if (error) {
        console.error('Error fetching flash deals:', error)
        return []
    }

    return data
}

export async function createProduct(productData: any) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single()

    if (error) {
        console.error('Error creating product:', error)
        throw error
    }

    return data
}
