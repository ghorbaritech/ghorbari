import { createClient } from '@/utils/supabase/client';

export interface PlatformConfig {
    id: string;
    category_id: string | null;
    vat_rate: number;
    platform_fee_rate: number;
    advance_payment_rate: number;
    is_active: boolean;
    category?: { name: string; type: string };
}

export async function getPlatformConfigs() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('platform_configs')
        .select(`
            *,
            category:product_categories(name, type)
        `)
        .order('category_id', { ascending: false }); // Put NULL (Global) last or handle sorting in UI

    if (error) {
        console.error('Error fetching platform configs:', error);
        throw error;
    }

    return data as PlatformConfig[];
}

export async function updatePlatformConfig(id: string, updates: Partial<PlatformConfig>) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('platform_configs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating platform config:', error);
        throw error;
    }

    return data;
}

export async function createPlatformConfig(config: Partial<PlatformConfig>) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('platform_configs')
        .insert([config])
        .select()
        .single();

    if (error) {
        console.error('Error creating platform config:', error);
        throw error;
    }

    return data;
}
