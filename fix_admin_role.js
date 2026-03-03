import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nnrzszujwhutbgghtjwc.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
// or use NEXT_PUBLIC_SUPABASE_ANON_KEY and update the policy locally, but using a local node script with anon key won't bypass RLS.
// let's grab the dev anon key from env.
