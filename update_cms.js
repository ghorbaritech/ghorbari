const url = 'https://nnrzszujwhutbgghtjwc.supabase.co/rest/v1/home_content?section_key=eq.service_sections';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucnrzenVqd2h1dGJnZ2h0andjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNTM0MDYsImV4cCI6MjA4NDcyOTQwNn0.Wm5Rt80-9_WyDCIxQVbreNSn9BTlqfgN8HmORGZcsO4';

const newContent = [
    {
        "id": 1772131335520,
        "title": "Aluminium & Glass",
        "bg_style": "bg-blue-50",
        "category_id": "8577f961-a9e1-432e-be9b-fa798e17569e" // Aluminium, Glass & Grill
    },
    {
        "id": 1772131349569,
        "title": "Construction Works",
        "bg_style": "bg-white",
        "category_id": "7cd7a88d-aeff-4fc1-b39c-6d1681b8d467" // Construction and Tile
    },
    {
        "id": 1772131355722,
        "title": "Paint & Finishes",
        "bg_style": "bg-blue-50",
        "category_id": "15830275-e506-4ee4-985e-a226ebd4a9c5" // Paints & Finishes
    }
];

async function update() {
    try {
        const res = await fetch(url, {
            method: 'PATCH',
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: newContent })
        });
        if (res.ok) {
            console.log("Successfully updated service sections in CMS.");
        } else {
            const err = await res.text();
            console.error("Failed to update:", err);
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

update();
