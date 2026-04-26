import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('branding_settings')
    .upsert({
      id: 1,
      logo_dark_url: '/logo-dalankotha-white-bg.png',
      logo_light_url: '/logo-dalankotha-dark.png', // Assuming dark.png is the one for dark backgrounds (light assets)
      favicon_url: '/favicon.ico',
      primary_color: '#0f172a',
      updated_at: new Date().toISOString()
    })
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'Branding force-updated to Dalankotha', data })
}
