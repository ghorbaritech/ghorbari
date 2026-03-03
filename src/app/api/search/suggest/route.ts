import { NextResponse } from 'next/server';
import { searchUnified } from '@/services/unifiedSearchService';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
        return NextResponse.json({ results: [] });
    }

    try {
        const results = await searchUnified(query, 12);

        // Map to expected format for existing UI
        const mappedResults = results.map(r => ({
            id: r.id,
            name: r.name,
            price: r.price,
            image: r.image,
            resultType: r.type.includes('category') ? 'category' : 'product', // Keep compat with old UI icons for now
            type: r.type,
            category: r.category_name,
            metadata: r.metadata
        }));

        const response = NextResponse.json({ results: mappedResults });

        // Add CORS headers
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        return response;
    } catch (error) {
        console.error('Search suggestion error:', error);
        const errorResponse = NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        errorResponse.headers.set('Access-Control-Allow-Origin', '*');
        return errorResponse;
    }
}

export async function OPTIONS() {
    const response = new NextResponse(null, { status: 204 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
}
