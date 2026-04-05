import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nnrzszujwhutbgghtjwc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucnpzenVqd2h1dGJnZ2h0andjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNTM0MDYsImV4cCI6MjA4NDcyOTQwNn0.Wm5Rt80-9_WyDCIxQVbreNSn9BTlqfgN8HmORGZcsO4'

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
