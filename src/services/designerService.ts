import { createClient } from '@/utils/supabase/client'

export async function getFeaturedDesigners() {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('designers')
        .select(`
      *,
      profile:profiles(full_name, avatar_url)
    `)
        .eq('verification_status', 'verified')
        .eq('is_active', true)
        .limit(10)

    if (error) {
        console.error('Error fetching designers:', error)
        return []
    }

    return data
}

export async function getDesignerById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('designers')
        .select(`
      *,
      profile:profiles(*)
    `)
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching designer:', error)
        return null
    }

    return data
}
