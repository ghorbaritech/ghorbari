import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nnrzszujwhutbgghtjwc.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function getHeroContent() {
  const { data, error } = await supabase
    .from('home_content')
    .select('*')
    .eq('section_key', 'hero_section')
    .single()

  if (error) {
    console.error('Error fetching hero section:', error)
  } else {
    console.log(JSON.stringify(data, null, 2))
  }
}

getHeroContent()
