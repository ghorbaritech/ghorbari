import { createClient } from '@/utils/supabase/client'

export interface Product {
    id: string;
    title: string;
    description?: string;
    base_price: number;
    discount_price?: number;
    sku: string;
    stock_quantity: number;
    images: string[];
    category_id: string;
    seller_id: string;
    status: 'active' | 'inactive';
    created_at: string;
    category?: {
        id: string;
        name: string;
        name_bn?: string;
    };
    seller?: {
        business_name: string;
    };
}

export async function getProducts(options: {
    query?: string,
    categoryId?: string,
    categoryName?: string,
    recursiveCategoryId?: string, // New option for recursive search
    minPrice?: number,
    maxPrice?: number,
    limit?: number
} = {}) {
    const supabase = createClient()

    let categoryIds: string[] = [];

    // If recursive search is requested, find all descendant category IDs
    if (options.recursiveCategoryId) {
        const { data: allCategories, error: catError } = await supabase
            .from('product_categories')
            .select('id, parent_id');

        if (!catError && allCategories) {
            const children_ids = [options.recursiveCategoryId];
            let search_ids = [options.recursiveCategoryId];
            while (search_ids.length > 0) {
                const next_ids = allCategories
                    .filter(c => c.parent_id && search_ids.includes(c.parent_id))
                    .map(c => c.id);
                children_ids.push(...next_ids);
                search_ids = next_ids;
            }
            categoryIds = children_ids;
        }
    } else if (options.categoryId) {
        categoryIds = [options.categoryId];
    }

    // Use !inner if filtering by category name to ensure we only get products with that category
    const categoryJoin = options.categoryName ? 'category:product_categories!inner(id, name, name_bn, parent_id, level)' : 'category:product_categories(id, name, name_bn, parent_id, level)'

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

    if (categoryIds.length > 0) {
        q = q.in('category_id', categoryIds)
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

export async function getCategories(type: 'product' | 'service' | 'design' = 'product') {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('product_categories')
        .select('*, parent:parent_id(id, name, level)')
        .eq('type', type)
        .order('name')

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

export async function createProduct(productData: Partial<Product>) {
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
