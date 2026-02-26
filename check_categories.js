const url = 'https://nnrzszujwhutbgghtjwc.supabase.co/rest/v1/product_categories?select=id,name';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucnpzenVqd2h1dGJnZ2h0andjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNTM0MDYsImV4cCI6MjA4NDcyOTQwNn0.Wm5Rt80-9_WyDCIxQVbreNSn9BTlqfgN8HmORGZcsO4';

async function checkCategories() {
    try {
        const res = await fetch(url + '&name=ilike.*Repair*', {
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`
            }
        });
        const data = await res.json();
        console.log("Matched Categories:", JSON.stringify(data, null, 2));

        const res2 = await fetch(url + '&name=ilike.*Construction*', {
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`
            }
        });
        const data2 = await res2.json();
        console.log("Matched Construction Categories:", JSON.stringify(data2, null, 2));

    } catch (err) {
        console.error("Error:", err);
    }
}

checkCategories();
