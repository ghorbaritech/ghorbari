const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nnrzszujwhutbgghtjwc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

async function setupAITable() {
    // Instead of raw SQL which we cannot easily run without admin pg access via REST,
    // we will store the AI Training data inside the existing `home_content` table
    // under a specific section_key named `ai_training_data`. It's robust enough for JSON arrays.

    const supabase = createClient(supabaseUrl, supabaseKey);

    const initialData = {
        knowledge_base: [
            { id: 1, question: "How to order?", question_bn: "কীভাবে অর্ডার করব?", answer: "You can search for products and add them to your cart. Then proceed to checkout.", answer_bn: "আপনি পণ্য অনুসন্ধান করে কার্টে যোগ করতে পারেন। এরপর চেকআউটে এগিয়ে যান।" },
            { id: 2, question: "What is the delivery time?", question_bn: "ডেলিভারি সময় কত?", answer: "Delivery usually takes 2-3 business days within Dhaka.", answer_bn: "ঢাকায় সাধারণত ২-৩ কর্মদিবস সময় লাগে।" },
            { id: 3, question: "contact", question_bn: "যোগাযোগ", answer: "You can call us at +8801900000000 or email support@ghorbari.tech.", answer_bn: "আপনি আমাদের +8801900000000 নম্বরে কল করতে পারেন অথবা support@ghorbari.tech এ ইমেইল করতে পারেন।" }
        ]
    };

    const { error } = await supabase
        .from('home_content')
        .upsert({
            section_key: 'ai_training_data',
            content: initialData,
            is_active: true
        }, { onConflict: 'section_key' });

    if (error) {
        console.error('Error seeding AI Training Data:', error);
    } else {
        console.log('Successfully seeded ai_training_data into home_content');
    }
}

setupAITable();
