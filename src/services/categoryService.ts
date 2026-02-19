import { createClient } from '@/utils/supabase/client';

export type CategoryType = 'product' | 'service' | 'design';

export interface Category {
    id: string;
    parent_id?: string | null;
    name: string;
    name_bn?: string | null;
    slug: string;
    type: CategoryType; // acts as 'section'
    level: number; // 0=Root, 1=Sub, 2=Item
    metadata?: {
        unit?: string;
        price?: string | number;
        frequency?: string;
        brands?: string[];
    } | null;
    icon?: string | null; // Lucide icon name
    icon_url?: string | null; // Backwards compatibility for image URLs
    created_at?: string;
    parent?: {
        id: string;
        name: string;
        level: number;
    } | null;
}

export async function getCategories(type?: CategoryType) {
    const supabase = createClient();
    let q = supabase
        .from('product_categories')
        .select(`
            *,
            parent:product_categories!product_categories_parent_id_fkey(id, name, level)
        `);

    if (type) {
        q = q.eq('type', type);
    }

    const { data, error } = await q.order('name');

    if (error) {
        // Log primitives to ensure they appear in console
        console.warn('Initial fetch failed. Code:', error.code, 'Message:', error.message);
        console.warn('Hint:', error.hint, 'Details:', error.details);

        // Fallback: Try simple fetch without parent embedding
        console.log('Attempting fallback fetch (no parent data)...');
        const fallbackQ = supabase
            .from('product_categories')
            .select('*');

        if (type) {
            fallbackQ.eq('type', type);
        }

        const { data: fallbackData, error: fallbackError } = await fallbackQ.order('name');

        if (fallbackError) {
            console.error('Fallback fetch also failed:', fallbackError);
            throw fallbackError;
        }

        console.log('Fallback fetch succeeded.');
        return fallbackData as Category[];
    }

    return data as Category[];
}

export async function createCategory(category: Partial<Category>) {
    const supabase = createClient();
    // Auto-generate slug if not provided
    if (!category.slug && category.name) {
        category.slug = category.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }

    const { data, error } = await supabase
        .from('product_categories')
        .insert([category])
        .select()
        .single();

    if (error) {
        console.error('Error creating category:', error);
        throw error;
    }

    return data;
}

export async function updateCategory(id: string, updates: Partial<Category>) {
    const supabase = createClient();

    // Auto-update slug if name changes and slug isn't explicitly set (optional logic, keeping simple for now)
    if (updates.name && !updates.slug) {
        updates.slug = updates.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }

    const { data, error } = await supabase
        .from('product_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating category:', error);
        throw error;
    }

    return data;
}

export async function deleteCategory(id: string) {
    const supabase = createClient();
    const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting category:', error);
        throw error;
    }

    return true;
}
