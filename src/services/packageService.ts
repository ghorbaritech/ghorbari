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

export async function getAllServicePackages() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('service_packages')
        .select('*, provider:service_providers!provider_id(business_name, business_name_bn), category:product_categories(id, name, name_bn, parent_id)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
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

export async function getAllDesignPackages() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('design_packages')
        .select('*, designer:designers(company_name, company_name_bn), category:product_categories(name, name_bn)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
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
export async function getDesignPackageById(id: string, supabaseClient?: any) {
    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) return null;

    const supabase = supabaseClient || createClient();
    const { data, error } = await supabase
        .from('design_packages')
        .select(`
            *,
            designer:designer_id(id, company_name, company_name_bn, user_id),
            category:category_id(id, name, name_bn, parent_id, level)
        `)
        .eq('id', id)
        .maybeSingle();

    if (error) {
        console.error('Error fetching design package detail:', JSON.stringify(error, null, 2));
        return null;
    }
    return data;
}
