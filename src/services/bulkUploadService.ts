export interface ProductUploadRow {
    title: string;
    description: string;
    base_price: string; // CSV readable as string
    stock_quantity: string;
    sku: string;
    category_slug: string;
    unit: string;
    image_url: string;
}

export function parseCSV(file: File): Promise<ProductUploadRow[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (!text) return resolve([]);

            const lines = text.split(/\r?\n/);
            const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase().replace(/['"]+/g, ''));

            const results: ProductUploadRow[] = [];

            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;

                // Simple CSV split (doesn't handle commas inside quotes well, but sufficient for simple bulk)
                // For robust parsing, we'd need a library or complex regex
                const values = lines[i].split(',').map(v => v.trim().replace(/^"(.*)"$/, '$1'));

                if (values.length < headers.length) continue;

                const row: any = {};
                headers.forEach((header, index) => {
                    row[header] = values[index];
                });
                results.push(row);
            }
            resolve(results);
        };
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
}

import { createClient } from "@/utils/supabase/client";

export async function uploadProducts(products: ProductUploadRow[], sellerId: string) {
    const supabase = createClient();

    // 1. Fetch categories to map slugs to IDs
    const { data: categories } = await supabase.from('product_categories').select('id, slug');
    const categoryMap = new Map(categories?.map((c: any) => [c.slug, c.id]));

    const validProducts = [];
    const errors = [];

    for (const p of products) {
        // Basic Validation
        if (!p.title || !p.base_price || !p.sku) {
            errors.push({ sku: p.sku || 'Unknown', error: 'Missing required fields' });
            continue;
        }

        const categoryId = categoryMap.get(p.category_slug);

        validProducts.push({
            seller_id: sellerId,
            title: p.title,
            description: p.description,
            base_price: parseFloat(p.base_price),
            stock_quantity: parseInt(p.stock_quantity) || 0,
            sku: p.sku,
            category_id: categoryId, // Can be null if not found
            unit: p.unit || 'piece',
            images: p.image_url ? [p.image_url] : [],
            status: 'active'
        });
    }

    if (validProducts.length === 0) return { success: 0, errors };

    const { error } = await supabase.from('products').insert(validProducts);

    if (error) {
        throw error;
    }

    return { success: validProducts.length, errors };
}
