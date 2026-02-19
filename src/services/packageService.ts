import { createClient } from '@/utils/supabase/client';

export interface ServicePackage {
    id: string;
    provider_id: string;
    category_id?: string;
    title: string;
    description: string;
    price: number;
    unit: string;
    images: string[];
    is_active: boolean;
    category?: { name: string };
}

export interface DesignPackage {
    id: string;
    designer_id: string;
    category_id?: string;
    title: string;
    description: string;
    price: number;
    unit: string;
    images: string[];
    is_active: boolean;
    category?: { name: string };
}

// --- Service Packages ---

export async function getServicePackages(providerId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('service_packages')
        .select('*, category:product_categories(name)')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ServicePackage[];
}

export async function createServicePackage(pkg: Partial<ServicePackage>) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('service_packages')
        .insert([pkg])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateServicePackage(id: string, updates: Partial<ServicePackage>) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('service_packages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteServicePackage(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from('service_packages').delete().eq('id', id);
    if (error) throw error;
}

// --- Design Packages ---

export async function getDesignPackages(designerId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('design_packages')
        .select('*, category:product_categories(name)')
        .eq('designer_id', designerId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as DesignPackage[];
}

export async function createDesignPackage(pkg: Partial<DesignPackage>) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('design_packages')
        .insert([pkg])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateDesignPackage(id: string, updates: Partial<DesignPackage>) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('design_packages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteDesignPackage(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from('design_packages').delete().eq('id', id);
    if (error) throw error;
}
