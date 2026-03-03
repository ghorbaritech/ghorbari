const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://nnrzszujwhutbgghtjwc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucnpzenVqd2h1dGJnZ2h0andjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNTM0MDYsImV4cCI6MjA4NDcyOTQwNn0.Wm5Rt80-9_WyDCIxQVbreNSn9BTlqfgN8HmORGZcsO4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    console.log("Fetching products...")
    const { data, error } = await supabase.from('products').select('*')
    if (error) {
        console.error("Error:", error)
        return
    }
    console.log(`Found ${data.length} products total.`)
    if (data.length > 0) {
        console.log("First product:", JSON.stringify(data[0], null, 2))
        console.log("All statuses:", data.map(d => d.status).join(', '))
    } else {
        console.log("No products returned in query!")
    }
}

test()
