import { createClient } from '@/utils/supabase/client'

export interface BrandingSettings {
    logo_light_url: string | null; // For dark backgrounds
    logo_dark_url: string | null;  // For light backgrounds
    favicon_url: string | null;
    primary_color: string;
}

const supabase = createClient()

export async function getBrandingSettings(): Promise<BrandingSettings | null> {
    const { data, error } = await supabase
        .from('branding_settings')
        .select('*')
        .eq('id', 1)
        .single()

    if (error) {
        // Silence all fetch errors to prevent console spam
        // Fallback logos are handled by components
        return null;
    }
    return data
}

export async function checkBrandingHealth(): Promise<{ tableStatus: boolean; bucketStatus: boolean; rowExists: boolean }> {
    const status = { tableStatus: false, bucketStatus: false, rowExists: false };

    try {
        // Check table and row
        const { data, error } = await supabase.from('branding_settings').select('id').eq('id', 1).single();
        if (!error || error.code === 'PGRST116') {
            status.tableStatus = true;
            status.rowExists = !!data;
        }

        // Check bucket - using list() which is more permissive than listBuckets()
        const { error: bucketError } = await supabase.storage.from('brand-assets').list('', { limit: 1 });
        
        // If it's "Bucket not found", status is false. 
        // Any other error (including "empty") means the bucket exists but we might lack list permissions, 
        // which is fine as long as we can upload/get URLs.
        if (bucketError) {
            if (bucketError.message?.includes('not found')) {
                status.bucketStatus = false;
            } else {
                // Policy might restrict listing, but bucket likely exists
                status.bucketStatus = true;
            }
        } else {
            status.bucketStatus = true;
        }
    } catch (e) {
        console.warn('Branding health check performed with limited info');
    }

    return status;
}

export async function updateBranding(updates: Partial<BrandingSettings>) {
    const { data, error } = await supabase
        .from('branding_settings')
        .update({ ...updates, updated_at: new Date() })
        .eq('id', 1)

    if (error) throw error
    return data
}

export async function uploadBrandAsset(file: File, type: 'logo_light' | 'logo_dark' | 'favicon') {
    const fileExt = file.name.split('.').pop()
    const fileName = `${type}_${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
        .from('brand-assets')
        .upload(filePath, file)

    if (uploadError) {
        if (uploadError.message?.includes('Bucket not found')) {
            throw new Error('Storage bucket "brand-assets" missing. Please run the setup SQL in the Admin panel.');
        }
        throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(filePath)

    const updateKey = type === 'logo_light' ? 'logo_light_url' : 
                      type === 'logo_dark' ? 'logo_dark_url' : 'favicon_url';

    await updateBranding({ [updateKey]: publicUrl })
    return publicUrl
}
