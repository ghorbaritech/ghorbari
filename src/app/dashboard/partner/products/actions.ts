'use server'

import { createAdminClient } from '@/utils/supabase/admin'

export async function uploadProductImage(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) return { error: 'No file provided.' };

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(7)}_${Date.now()}.${fileExt}`;

    const supabaseAdmin = createAdminClient();
    const { error: uploadError } = await supabaseAdmin.storage
        .from('product-images')
        .upload(fileName, file);

    if (uploadError) {
        console.error('Storage Upload Error:', uploadError);
        return { error: uploadError.message };
    }

    const { data: urlData } = supabaseAdmin.storage
        .from('product-images')
        .getPublicUrl(fileName);

    return { publicUrl: urlData.publicUrl };
}
