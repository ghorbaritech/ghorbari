import { createClient } from '@/utils/supabase/client';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = createClient();

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    let role = 'unauthenticated';
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        role = profile?.role || 'unknown';
    }

    const checks = {
        user_id: user?.id,
        role: role,
        tables: {}
    };

    const tables = ['profiles', 'service_requests', 'designers'];

    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('count', { count: 'exact', head: true });
        checks.tables[table] = {
            exists: !error || error.code !== '42P01', // 42P01 is undefined table
            error: error ? { code: error.code, message: error.message } : null,
            count: data
        };
    }

    return NextResponse.json(checks);
}
