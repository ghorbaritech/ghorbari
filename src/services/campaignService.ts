import { createClient } from '@/utils/supabase/client';

export interface Campaign {
    id: string;
    seller_id: string;
    title: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    value: number;
    usage_count: number;
    is_active: boolean;
    start_date: string;
    end_date: string;
}

export async function getSellerCampaigns(sellerId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Campaign[];
}

export async function createCampaign(campaign: Partial<Campaign>) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('campaigns')
        .insert([campaign])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function toggleCampaignStatus(id: string, currentStatus: boolean) {
    const supabase = createClient();
    const { error } = await supabase
        .from('campaigns')
        .update({ is_active: !currentStatus })
        .eq('id', id);

    if (error) throw error;
}
