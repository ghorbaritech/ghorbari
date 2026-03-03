import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
        return NextResponse.json({ results: [] });
    }

    try {
        const supabase = await createClient();

        // Use a wildcard search pattern
        const searchPattern = `%${query}%`;

        // Fetch from products
        const { data: products } = await supabase
            .from('products')
            .select('id, name, type, images')
            .ilike('name', searchPattern)
            .limit(5);

        // Fetch from categories
        const { data: categories } = await supabase
            .from('product_categories')
            .select('id, name, type')
            .ilike('name', searchPattern)
            .limit(3);

        const results = [
            ...(products || []).map(p => ({ ...p, resultType: 'product' })),
            ...(categories || []).map(c => ({ ...c, resultType: 'category' }))
        ];

        return NextResponse.json({ results });
    } catch (error) {
        console.error('Search Suggestion Error:', error);
        return NextResponse.json({ results: [] }, { status: 500 });
    }
}
