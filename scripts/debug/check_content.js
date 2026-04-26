import { createClient } from './src/utils/supabase/client.js';

async function checkHomeContent() {
    const supabase = createClient();
    const { data: content, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'home_content')
        .single();

    if (error) {
        console.error("Error fetching home content:", error);
        return;
    }

    const contentMap = content?.value || {};
    console.log("Service Sections:", JSON.stringify(contentMap['service_sections'], null, 2));

    const { data: categories } = await supabase.from('product_categories').select('id, name');
    console.log("Categories:", JSON.stringify(categories, null, 2));
}

checkHomeContent();
