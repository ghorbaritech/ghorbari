import { createClient } from '@/utils/supabase/client';

export interface MilestoneTemplate {
    id: string;
    name: string;
    type: string;
    stages: string[];
    category_id?: string;
    category?: { name: string };
    created_at: string;
}

export interface MilestoneStatus {
    name: string;
    status: 'pending' | 'completed';
    completed_at?: string;
}

export async function getMilestoneTemplates() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('milestone_templates')
        .select('*, category:product_categories(name)')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as MilestoneTemplate[];
}

export async function createMilestoneTemplate(template: Partial<MilestoneTemplate>) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('milestone_templates')
        .insert([template])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteMilestoneTemplate(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from('milestone_templates').delete().eq('id', id);
    if (error) throw error;
}

export async function getApplicableMilestones(type: string, categoryId?: string) {
    const supabase = createClient();
    let query = supabase
        .from('milestone_templates')
        .select('*')
        .eq('type', type);

    // Logic: Look for specific category overrides first, then global (null category) for that type
    // This is simple client-side filtering or advanced SQL. 
    // Client-side is easier for small dataset.

    const { data, error } = await query;
    if (error) return []; // Fallback

    // Find specific match
    const specific = (data as any[])?.find((t: any) => t.category_id === categoryId);
    if (specific) return specific.stages;

    // Find default for type
    const global = (data as any[])?.find((t: any) => !t.category_id);
    return global ? global.stages : null; // returns string[] or null
}

export async function updateEntityMilestones(table: 'orders' | 'service_requests' | 'design_bookings', id: string, milestones: MilestoneStatus[]) {
    const supabase = createClient();
    const { error } = await supabase
        .from(table)
        .update({ milestones })
        .eq('id', id);

    if (error) throw error;
}
