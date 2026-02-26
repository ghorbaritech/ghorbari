import { createClient } from '@/utils/supabase/client';

/**
 * Common join fragments for consistent data fetching
 */
export const CATEGORY_JOIN = 'category:category_id(id, name, name_bn, parent_id, level)';
export const PARENT_CATEGORY_JOIN = 'parent:parent_id(id, name, level)';

/**
 * Robust database query wrapper with logging
 */
export async function safeQuery<T>(
    queryPromise: PromiseLike<{ data: T | null; error: any }>,
    context: string
): Promise<T | null> {
    const { data, error } = await queryPromise;

    if (error) {
        console.error(`Database Error [${context}]:`, {
            code: error.code,
            message: error.message,
            hint: error.hint,
            details: error.details,
        });
        return null;
    }

    return data as T;
}

/**
 * Centralized Category fetching logic
 */
export async function fetchCategories(type?: 'product' | 'service' | 'design') {
    const supabase = createClient();
    let query = supabase
        .from('product_categories')
        .select(`
            *,
            ${PARENT_CATEGORY_JOIN}
        `);

    if (type) {
        query = (query as any).eq('type', type);
    }

    return safeQuery(query.order('name'), 'fetchCategories');
}
