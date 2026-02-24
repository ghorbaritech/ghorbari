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

export async function getServiceItemById(id: string) {
    const supabase = createClient();
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
