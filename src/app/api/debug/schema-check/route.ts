import { createClient } from '@/utils/supabase/client';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = createClient();
    const result: any = {};

    const tables = ['profiles', 'service_providers', 'service_requests', 'orders', 'products'];

    for (const table of tables) {
        const { error } = await supabase.from(table).select('*').limit(1);
        result[table] = error ? error.message : 'OK';
    }

    return NextResponse.json(result);
}
