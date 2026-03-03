import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    try {
        const { message, lang = 'en' } = await request.json();

        if (!message) {
            return NextResponse.json({ reply: lang === 'bn' ? 'আমি আপনার বার্তাটি ঠিক বুঝতে পারছি না।' : "I'm sorry, I didn't quite catch that." });
        }

        const supabase = await createClient();

        // Fetch AI training data
        const { data: trainingData } = await supabase
            .from('home_content')
            .select('content')
            .eq('section_key', 'ai_training_data')
            .single();

        const knowledgeBase = trainingData?.content?.knowledge_base || [];
        const query = message.toLowerCase().trim();

        // Simple matching logic
        let bestMatch = null;

        // Try exact match first
        bestMatch = knowledgeBase.find((item: any) =>
            item.question.toLowerCase().trim() === query ||
            (item.question_bn && item.question_bn.trim() === query)
        );

        // Try includes match
        if (!bestMatch) {
            bestMatch = knowledgeBase.find((item: any) =>
                query.includes(item.question.toLowerCase().trim()) ||
                (item.question_bn && query.includes(item.question_bn.trim()))
            );
        }

        // Try reverse includes
        if (!bestMatch) {
            bestMatch = knowledgeBase.find((item: any) =>
                item.question.toLowerCase().trim().includes(query) ||
                (item.question_bn && item.question_bn.trim().includes(query))
            );
        }

        if (bestMatch) {
            const reply = lang === 'bn' && bestMatch.answer_bn ? bestMatch.answer_bn : bestMatch.answer;
            return NextResponse.json({
                reply,
                lang: lang === 'bn' && bestMatch.answer_bn ? 'bn' : 'en'
            });
        }

        // Default response if no match found
        const defaultReply = lang === 'bn'
            ? "দুঃখিত, আমি এই বিষয়ে পর্যাপ্ত তথ্য জানি না। দয়া করে আমাদের কাস্টমার সার্ভিসে যোগাযোগ করুন।"
            : "I'm sorry, I don't have information about that yet. Please contact our support for more detailed assistance.";

        return NextResponse.json({ reply: defaultReply, lang });

    } catch (error) {
        console.error('AI Chat API Error:', error);
        return NextResponse.json({
            reply: "Something went wrong. Please try again later.",
            lang: 'en'
        }, { status: 500 });
    }
}
