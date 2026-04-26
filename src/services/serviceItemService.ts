import { createClient } from '@/utils/supabase/client';

export interface ServiceItem {
    id: string;
    category_id: string;
    name: string;
    name_bn: string;
    description: string;
    description_bn: string;
    unit_price: number;
    unit_type: string;
    image_url: string;
    is_active: boolean;
    category?: {
        name: string;
        name_bn: string;
        parent_id?: string;
    };
}

export async function getServiceItems(categoryId?: string) {
    const supabase = createClient();
    let query = supabase
        .from('service_items')
        .select('*, category:product_categories(id, name, name_bn, parent_id)')
        .eq('is_active', true);

    if (categoryId) {
        query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query.order('name');
    if (error) {
        console.error("Error fetching service items:", error);
        return [];
    }
    return data as ServiceItem[];
}

export async function getServiceItemsByCategories(categoryIds: string[]) {
    if (!categoryIds || categoryIds.length === 0) return [];

    // In Dalankotha, specific service items are stored as level 2 product_categories of type 'service'
    const supabase = createClient();
    const { data: catData, error } = await supabase
        .from('product_categories')
        .select(`
            id, name, name_bn, type, level, metadata, icon, icon_url, parent_id,
            parent:parent_id(id, name, name_bn)
        `)
        .in('parent_id', categoryIds)
        .eq('type', 'service')
        .order('name');

    if (error) {
        console.error("Error fetching service items by categories:", error);
        return [];
    }

    return catData.map((cat: any) => ({
        id: cat.id,
        category_id: cat.parent_id,
        name: cat.name,
        name_bn: cat.name_bn || "",
        description: "",
        description_bn: "",
        unit_price: cat.metadata?.price || 0,
        unit_type: cat.metadata?.unit || "hr",
        image_url: cat.icon_url || cat.icon || "",
        is_active: true,
        category: cat.parent ? {
            name: cat.parent.name,
            name_bn: cat.parent.name_bn || "",
            parent_id: cat.parent.id // fallback for UI mapped id
        } : undefined
    })) as ServiceItem[];
}

export async function getServiceItemById(id: string, supabaseClient?: any) {
    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) return null;

    const supabase = supabaseClient || createClient();
    const { data, error } = await supabase
        .from('service_items')
        .select('*, category:product_categories(id, name, name_bn, parent_id)')
        .eq('id', id)
        .single();

    if (error) {
        console.error("Error fetching service item:", error);
        return null;
    }
    return data as ServiceItem;
}
