// Build Trigger: 2026-04-26T02:10:00Z
import { streamText, tool } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import { generateRoomDesign } from '@/utils/ai/imagen';
import { createClient } from '@/utils/supabase/server';
import { createClient as createRawSupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { KNOWLEDGE_BASE } from '@/utils/ai/knowledge';

/**
 * 🤖 Dalankotha AI Agent — v4.0.0
 *
 * Single canonical route for all AI interactions.
 * Supports two modes via `mode` body param:
 *   - 'full'   (default) — text + image generation + session persistence
 *   - 'widget' — text only, anonymous, fast
 */

export const maxDuration = 90;

// Validate that a string looks like a UUID to avoid RLS errors
const isValidUUID = (str: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const SYSTEM_PROMPT = `
You are **Dalankotha AI** — the expert construction and interior design consultant for দালানকোঠা, Bangladesh's premium construction and renovation platform.

## Personality
- Warm, direct, knowledgeable — like a "trusted big brother" who is a design and construction expert.
- Respond ONLY in the language the user writes in:
  - Bengali or Banglish → always reply in বাংলা script (e.g. write "আপনি", never "apni")
  - English → reply in English

---

## ⚠️ MANDATORY CONVERSATION FLOWS — FOLLOW EXACTLY

### FLOW 1: User shares a room/space photo
This is a strict multi-step process. DO NOT skip steps or jump to image generation.

**STEP 1 — ROOM ANALYSIS**
Carefully study the uploaded photo and write 2–3 sentences describing:
- What furniture, colors, lighting, and layout you see
- What is NOT working (e.g. "আলোর ব্যবস্থা দুর্বল", "ফার্নিচার রুমের সাথে মানানসই নয়")

**STEP 2 — SUGGEST 3 DISTINCT DESIGN OPTIONS**
Present 3 clearly different design styles. Use this EXACT format:

---
**বিকল্প ১: [Style Name — e.g. মডার্ন মিনিমালিস্ট]**
পরিবর্তন: [List 3–4 specific changes: furniture, colors, lighting, flooring]
আনুমানিক খরচ: ৳X – ৳Y লাখ

**বিকল্প ২: [Style Name — e.g. স্ক্যান্ডিনেভিয়ান ওয়ার্ম]**
পরিবর্তন: [List 3–4 specific changes]
আনুমানিক খরচ: ৳X – ৳Y লাখ

**বিকল্প ৩: [Style Name — e.g. আরবান লফট]**
পরিবর্তন: [List 3–4 specific changes]
আনুমানিক খরচ: ৳X – ৳Y লাখ
---

**STEP 3 — ASK THE USER TO CHOOSE**
Always end your response with:
"কোন বিকল্পটি আপনার পছন্দ? আপনি বললে আমি সাথে সাথে সেই ডিজাইনের একটি ফটোরিয়েলিস্টিক ভিজ্যুয়াল তৈরি করব!"

⛔ **ABSOLUTE RULE: DO NOT call generate_visual_design on the first response when a photo is uploaded.
You MUST complete Steps 1, 2, and 3 first. The image tool is FORBIDDEN until the user has chosen an option.**

---

### FLOW 2: User selects one of the 3 options
Detection: User says any of — "option 1", "প্রথমটা", "বিকল্প ২", "first one", "second", "এটা করো", "তাই করো", "show me", "হ্যাঁ", "ok", a number ("১", "2"), or refers to a style name.

Action: IMMEDIATELY call **generate_visual_design** tool with a rich, detailed prompt:
- Reference the uploaded room's existing structural layout, perspective, and architecture
- Apply ONLY the specific changes from the chosen option (furniture, colors, materials, lighting)
- Add: "Dhaka Bangladesh apartment, professional architectural photography, photorealistic, 4K, beautiful lighting"

After the image: write 3–4 bullets explaining what changed and suggest the matching Dalankotha service.

---

### FLOW 3: User requests a design WITHOUT a photo
1. Ask: "কোন ধরনের রুম?" (Living room? Bedroom? Kitchen?)
2. Ask: "পছন্দের স্টাইল কী?" (Minimalist? Classic? Modern?)
3. Once answered → call **generate_visual_design** immediately
4. After image → explain design choices and suggest Dalankotha service

---

### FLOW 4: User asks about construction or renovation cost
1. If floor area is unknown → ask for it in sqft or katha
2. Ask city and project type (full build / interior / renovation / gray structure)
3. Call **estimateConstructionCost** tool
4. Show results as a clear breakdown
5. End with: "সঠিক কোটেশনের জন্য /services-এ একজন Dalankotha পেশাদার বুক করুন।"

---

### FLOW 5: User asks about Dalankotha services or booking
1. Identify which service (design / permit / construction / materials)
2. Explain in 2–3 sentences what it includes
3. Link: "/services এ বুক করুন"

---

## Guardrails
- Never give binding cost quotes — always say "আনুমানিক" (estimate) and recommend a formal BOQ
- Never approve structural changes without: "অবশ্যই একজন সার্টিফাইড স্ট্রাকচারাল ইঞ্জিনিয়ারের সাথে নিশ্চিত করুন"
- Never fabricate RAJUK/CDA rules
`;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            messages: uiMessages,
            userId,
            sessionId: incomingSessionId,
            language: langKey,
            lang: fallbackLang,
            mode = 'full',       // 'full' | 'widget'
        } = body;

        const language = langKey || fallbackLang || 'bn';
        const isWidgetMode = mode === 'widget';

        if (!uiMessages || !Array.isArray(uiMessages) || uiMessages.length === 0) {
            return NextResponse.json({ error: 'Valid messages array is required' }, { status: 400 });
        }

        const supabase = await createClient();
        let sessionId = incomingSessionId;

        // --- 1. Build System Prompt ---
        let systemPrompt = SYSTEM_PROMPT;

        // Try to load CMS override (silently ignore if unavailable)
        try {
            const { data: cmsData } = await supabase
                .from('home_content')
                .select('section_key, content')
                .in('section_key', ['ai_system_prompt', 'ai_training_data']);

            const promptItem = cmsData?.find((d) => d.section_key === 'ai_system_prompt');
            const knowledgeItem = cmsData?.find((d) => d.section_key === 'ai_training_data');

            if (promptItem?.content?.prompt) systemPrompt = promptItem.content.prompt;

            const activeKnowledge = knowledgeItem?.content?.knowledge_base || KNOWLEDGE_BASE;
            systemPrompt += `\n\n## Verified Knowledge Base\n${JSON.stringify(activeKnowledge, null, 2)}`;
        } catch {
            systemPrompt += `\n\n## Verified Knowledge Base\n${JSON.stringify(KNOWLEDGE_BASE, null, 2)}`;
        }

        systemPrompt += language === 'bn'
            ? '\n\n## Active Language\nThe user is writing in Bengali. Respond ONLY in বাংলা script. Never use English or transliteration in your reply.'
            : '\n\n## Active Language\nThe user is writing in English. Respond in English.';

        if (isWidgetMode) {
            systemPrompt += '\n\n## Session Mode: Widget\nKeep responses concise (max 4 sentences). If the user wants to see a design or needs detailed consultation, say: "For the full AI Design experience, visit our AI Consultant page" and link to /ai-consultant.';
        }

        // --- 2. Session Management (skip for widget mode or invalid userId) ---
        const lastMessage = uiMessages[uiMessages.length - 1];
        const lastMessageText =
            typeof lastMessage?.content === 'string'
                ? lastMessage.content
                : (lastMessage?.parts
                    ?.filter((p: any) => p.type === 'text')
                    ?.map((p: any) => p.text)
                    ?.join(' ') || 'New conversation');

        if (!isWidgetMode && !sessionId && userId && isValidUUID(userId)) {
            try {
                const { data: session } = await supabase
                    .from('ai_sessions')
                    .insert({
                        user_id: userId,
                        title: lastMessageText.substring(0, 60) || 'New Conversation',
                    })
                    .select()
                    .single();
                if (session) sessionId = session.id;
            } catch (e) {
                console.warn('[AI] Session insert failed, continuing without session:', e);
            }
        }

        if (!isWidgetMode && sessionId && lastMessageText) {
            supabase
                .from('ai_messages')
                .insert({ session_id: sessionId, role: 'user', content: lastMessageText })
                .then()
                .catch(() => { /* non-fatal */ });
        }

        // --- 3. Sanitize Messages for Gemini API ---
        const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
        if (!apiKey) throw new Error('Gemini API key is not set');

        const google = createGoogleGenerativeAI({ apiKey });

        /**
         * 🔄 Standard Core Message Converter
         * Hand-rolled for maximum control over tool results and images.
         */
        const coreMessages: any[] = [];
        for (const m of uiMessages) {
            const content: any[] = [];
            
            // Add text if present
            const text = typeof m.content === 'string' ? m.content : '';
            if (text.trim()) content.push({ type: 'text', text });

            // Add images from attachments
            if (m.experimental_attachments?.length) {
                for (const att of m.experimental_attachments) {
                    if (att.contentType?.startsWith('image/') && att.url) {
                        content.push({ type: 'image', image: att.url });
                    }
                }
            }

            // Add tool calls (only for assistant role to avoid protocol errors)
            if (m.role === 'assistant' && m.toolInvocations?.length) {
                for (const ti of m.toolInvocations) {
                    if (ti.state === 'call' || ti.state === 'result') {
                        content.push({
                            type: 'tool-call',
                            toolCallId: ti.toolCallId,
                            toolName: ti.toolName,
                            args: ti.args
                        });
                    }
                }
            }

            if (content.length > 0) {
                coreMessages.push({ role: m.role, content });
            }

            // Results must accompany the conversation as 'tool' role messages
            const results = m.toolInvocations?.filter((ti: any) => ti.state === 'result');
            if (results?.length) {
                coreMessages.push({
                    role: 'tool',
                    content: results.map((ti: any) => ({
                        type: 'tool-result',
                        toolCallId: ti.toolCallId,
                        toolName: ti.toolName,
                        result: ti.result
                    }))
                });
            }
        }

        console.log(`[AI Route] Sending ${coreMessages.length} messages to Gemini. Last role: ${coreMessages[coreMessages.length - 1]?.role}`);


        // --- 4. Define Tools ---

        const tools: Record<string, any> = {
            estimateConstructionCost: tool({
                description: 'Calculate construction or renovation cost for a Bangladesh project. Call this for ANY cost/price/budget question.',
                parameters: z.object({
                    area_sqft: z.number().describe('Total floor area in square feet'),
                    tier: z.enum(['basic', 'standard', 'premium', 'luxury']).describe('Quality tier'),
                    location: z.string().optional().default('Dhaka').describe('City or area'),
                    project_type: z
                        .enum(['gray_structure', 'full_build', 'interior_only', 'renovation'])
                        .optional()
                        .default('full_build'),
                }),
                execute: async ({ area_sqft, tier, location = 'Dhaka', project_type = 'full_build' }) => {
                    console.log(`[Tool] estimateConstructionCost: area=${area_sqft}, tier=${tier}, type=${project_type}`);

                    const rates: Record<string, Record<string, number>> = {
                        gray_structure: { basic: 1800, standard: 2200, premium: 2800, luxury: 3500 },
                        full_build:     { basic: 2500, standard: 3200, premium: 4000, luxury: 5500 },
                        interior_only:  { basic: 600,  standard: 1000, premium: 1500, luxury: 2500 },
                        renovation:     { basic: 800,  standard: 1200, premium: 2000, luxury: 3000 },
                    };
                    const rate = rates[project_type]?.[tier] ?? rates.full_build.standard;
                    const total = area_sqft * rate;
                    return {
                        success: true,
                        area_sqft,
                        tier,
                        location,
                        project_type,
                        rate_per_sqft: `৳${rate.toLocaleString()}`,
                        estimated_total_bdt: total,
                        estimated_total_lac: `৳${(total / 100000).toFixed(1)} লাখ`,
                        formatted: `৳${total.toLocaleString()}`,
                        note: 'Market estimate — actual costs depend on site conditions and current material prices. Book a formal consultation for a precise BOQ.',
                    };
                },
            }),
        };

        // Only expose image generation in full mode
        if (!isWidgetMode) {
            tools.generate_visual_design = tool({
                description: 'Generate a photorealistic design visualization. Call IMMEDIATELY when user wants to see any design, room, or style. Do not describe in text first — generate the image, then explain.',
                parameters: z.object({
                    prompt: z.string().describe('Detailed design prompt: room type, style, colors, materials, furniture, lighting, Bangladesh context'),
                    designType: z.enum(['interior', 'exterior', 'renovation']).default('interior'),
                    style: z.string().optional().describe('Design style (e.g., minimalist, modern, Scandinavian, traditional Bangladeshi)'),
                }),
                execute: async ({ prompt, designType, style }) => {
                    console.log(`[Tool] generate_visual_design: type=${designType}, style=${style}, prompt_len=${prompt.length}`);

                    try {
                        const enrichedPrompt = [
                            style ? `${style} style` : '',
                            prompt,
                            designType === 'exterior' ? 'exterior architecture, Bangladesh' : 'interior design, Bangladesh apartment',
                            'professional architectural photography, photorealistic, 4K, beautiful natural and artificial lighting',
                        ].filter(Boolean).join(', ');

                        // Extract the most recent uploaded image from conversation
                        let lastUserImageBase64: string | undefined;
                        for (let i = coreMessages.length - 1; i >= 0; i--) {
                            const m = coreMessages[i];
                            if (m.role === 'user' && Array.isArray(m.content)) {
                                const imgPart = m.content.find((p: any) => p.type === 'image');
                                if (imgPart?.image) {
                                    lastUserImageBase64 = Buffer.isBuffer(imgPart.image)
                                        ? imgPart.image.toString('base64')
                                        : String(imgPart.image).replace(/^data:image\/\w+;base64,/, '');
                                    break;
                                }
                            }
                        }
                        // Fallback: check uiMessages attachments
                        if (!lastUserImageBase64) {
                            for (let i = uiMessages.length - 1; i >= 0; i--) {
                                const m = uiMessages[i];
                                const att = m.experimental_attachments?.find((a: any) => a.contentType?.startsWith('image/'));
                                if (att?.url) {
                                    lastUserImageBase64 = att.url.startsWith('data:')
                                        ? att.url.split(',')[1]
                                        : att.url;
                                    break;
                                }
                            }
                        }

                        const base64Image = await generateRoomDesign(enrichedPrompt, lastUserImageBase64);
                        const fileName = `ai-designs/${userId && isValidUUID(userId) ? userId : 'guest'}/${uuidv4()}.png`;
                        const buffer = Buffer.from(base64Image, 'base64');

                        const supabaseAdmin = createRawSupabaseClient(
                            process.env.NEXT_PUBLIC_SUPABASE_URL!,
                            process.env.SUPABASE_SERVICE_ROLE_KEY!
                        );

                        const { error: uploadError } = await supabaseAdmin.storage
                            .from('brand-assets')
                            .upload(fileName, buffer, { contentType: 'image/png', cacheControl: '3600' });

                        if (uploadError) throw uploadError;

                        const { data: { publicUrl } } = supabaseAdmin.storage
                            .from('brand-assets')
                            .getPublicUrl(fileName);

                        return { success: true, url: publicUrl, imageUrl: publicUrl };
                    } catch (err: any) {
                        const message = err?.message || 'Unknown error';
                        console.error('[AI Tool] generate_visual_design failed:', message);
                        return {
                            success: false,
                            error: message,
                            message: 'Image generation failed. I will describe the design instead.',
                        };
                    }
                },
            });
        }

        // --- 5. Stream Response ---
        const result = streamText({
            model: google('gemini-1.5-flash'),
            messages: coreMessages,
            system: systemPrompt,
            maxSteps: 8,
            maxTokens: 2048,
            tools,
            onFinish: async ({ text }) => {
                if (!isWidgetMode && sessionId) {
                    supabase
                        .from('ai_messages')
                        .insert({ session_id: sessionId, role: 'assistant', content: text || '' })
                        .then()
                        .catch(() => { /* non-fatal */ });
                }
            },
        });

        return result.toUIMessageStreamResponse({
            headers: { 'x-ai-session-id': sessionId || '' },
        });

    } catch (error: any) {
        console.error('[AI Master Route] Fatal error:', error?.message || error);
        return NextResponse.json(
            { error: 'AI service error', details: error?.message },
            { status: 500 }
        );
    }
}
