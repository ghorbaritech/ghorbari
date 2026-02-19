import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();
    const { data, error } = await supabase.from('home_content').select('*');
    if (error) return NextResponse.json({ error }, { status: 500 });
    return NextResponse.json({ data });
}
