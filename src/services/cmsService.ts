import { createClient } from '@/utils/supabase/client';

export interface HomeContent {
    id: string;
    section_key: string;
    content: any; // JSONB
    is_active: boolean;
}

export async function getHomeContent(sectionKey?: string) {
    const supabase = createClient();
    let query = supabase.from('home_content').select('*');

    if (sectionKey) {
        query = query.eq('section_key', sectionKey);
        const { data, error } = await query.single();
        if (error && error.code !== 'PGRST116') throw error; // Ignore not found
        return data as HomeContent;
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as HomeContent[];
}

export async function updateHomeContent(sectionKey: string, content: any) {
    const supabase = createClient();

    // Upsert logic
    const { data, error } = await supabase
        .from('home_content')
        .upsert({
            section_key: sectionKey,
            content,
            updated_at: new Date().toISOString()
        }, { onConflict: 'section_key' })
        .select()
        .single();

    if (error) throw error;
    return data;
}
