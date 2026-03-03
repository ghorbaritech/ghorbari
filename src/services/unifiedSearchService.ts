import { createClient } from '@/utils/supabase/client';

export type SearchResultType = 'product' | 'service_item' | 'service_category' | 'design_category' | 'subcategory';

export interface UnifiedSearchResult {
    id: string;
    name: string;
    type: SearchResultType;
    price?: number;
    image?: string;
    category_name?: string;
    metadata?: any;
    originalType?: string; // from DB
}

export async function searchUnified(query: string, limit: number = 20): Promise<UnifiedSearchResult[]> {
    const supabase = createClient();
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    const results: UnifiedSearchResult[] = [];

    // 1. Search Products
    const { data: products } = await supabase
        .from('products')
        .select('id, title, title_bn, base_price, images, category:product_categories(name, name_bn)')
        .or(`title.ilike.%${cleanQuery}%,title_bn.ilike.%${cleanQuery}%`)
        .eq('status', 'active')
        .limit(limit);

    if (products) {
        products.forEach(p => {
            results.push({
                id: p.id,
                name: p.title,
                type: 'product',
                price: p.base_price,
                image: (p.images && p.images.length > 0) ? p.images[0] : undefined,
                category_name: (p.category as any)?.name,
                metadata: { section: 'product', name_bn: p.title_bn }
            });
        });
    }

    // 2. Search Service Items
    const { data: serviceItems } = await supabase
        .from('service_items')
        .select('id, name, name_bn, unit_price, image_url, category:product_categories(name, name_bn)')
        .or(`name.ilike.%${cleanQuery}%,name_bn.ilike.%${cleanQuery}%`)
        .eq('is_active', true)
        .limit(limit);

    if (serviceItems) {
        serviceItems.forEach(s => {
            results.push({
                id: s.id,
                name: s.name,
                type: 'service_item',
                price: s.unit_price,
                image: s.image_url,
                category_name: (s.category as any)?.name,
                metadata: { section: 'service', name_bn: s.name_bn }
            });
        });
    }

    // 3. Search Categories (Subcategories, Service Categories, Design Categories)
    const { data: categories } = await supabase
        .from('product_categories')
        .select('id, name, name_bn, type, level, icon_url, parent:parent_id(name, name_bn)')
        .or(`name.ilike.%${cleanQuery}%,name_bn.ilike.%${cleanQuery}%`)
        .limit(limit);

    if (categories) {
        categories.forEach(c => {
            let resultType: SearchResultType = 'subcategory';
            if (c.level === 0) {
                if (c.type === 'service') resultType = 'service_category';
                else if (c.type === 'design') resultType = 'design_category';
            }

            results.push({
                id: c.id,
                name: c.name,
                type: resultType,
                image: c.icon_url,
                category_name: (c.parent as any)?.name,
                metadata: { section: c.type, level: c.level, name_bn: c.name_bn }
            });
        });
    }

    // Deduplicate and Sort (Self-sort by relevance: exact match first)
    return results.sort((a, b) => {
        const aExact = a.name.toLowerCase() === cleanQuery.toLowerCase();
        const bExact = b.name.toLowerCase() === cleanQuery.toLowerCase();
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return 0;
    }).slice(0, limit);
}
