import { streamText, tool, convertToModelMessages } from 'ai';
import { createGoogleGenerativeAI, google } from '@ai-sdk/google';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import { generateImagen3 } from '@/utils/ai/imagen';
import { createClient } from '@/utils/supabase/server';
import { v4 as uuidv4 } from 'uuid';

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

const getSystemPrompt = (language: string) => `
You are the Ghorbari AI Construction Consultant, an expert architect, civil engineer, and interior designer specialized in the context of building and renovating in Bangladesh.
Your goal is to provide highly accurate, practical, and helpful advice to homeowners and builders.

IMAGE GENERATION GUIDELINES:
- Trigger the \`generate_design_image\` tool ONLY when the user explicitly asks for a DESIGN, VISUALIZATION, IMAGE, or to SHOW them a visual representation of a space.
- If the user asks about costs, materials, or general advice, respond with TEXT only. Do NOT generate images for cost estimates unless specifically asked for a design of the room being discussed.
- You MUST call the tool in the VERY FIRST STEP for visual requests.
- Do NOT provide a long text response before calling the tool.

Language Instructions:
${language === 'en'
        ? '- IMPORTANT: The user has selected English as their preferred language. You MUST respond ONLY in English for this entire conversation.'
        : '- IMPORTANT: সর্বদা বাংলায় উত্তর দিন। আপনার সমস্ত সাড়া বাংলায় লিখতে হবে। শুধুমাত্র প্রযুক্তিগত শব্দ যেখানে বাংলা সমতুল্য নেই, সেখানে ইংরেজি ব্যবহার করুন।\n- English rule: When the user writes in English, still respond in Bangla.\n- You can understand mixed "Banglish" as is common in Bangladesh.'
    }

Capabilities & Tone:
1. Speak professionally but accessibly. Be encouraging but realistic about costs and timelines.
2. You understand local materials (e.g., specific cement brands, RCC vs PCC, local brick types).
3. If the user asks about Ghorbari services or products, confidently recommend they check the "Products" or "Services" sections on the website.

When calling \`generate_design_image\`:
- Write a highly detailed, descriptive prompt for the image generator (e.g., "A hyper-realistic architectural render of a modern minimalist living room in Dhaka, natural sunlight, warm wood tones, beige sofa, indoor plants, 8k resolution").
`;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log('[AI CONSULT] Request body keys:', Object.keys(body));

        // Handle both 'language' (ChatInterface) and 'lang' (AIChatAssistant)
        const { messages: uiMessages, userId, sessionId: incomingSessionId, language: langKey, lang: fallbackLang } = body;
        const language = langKey || fallbackLang || 'bn';

        console.log('Chat API Request:', {
            hasMessages: !!uiMessages,
            messagesCount: uiMessages?.length,
            lang: language,
            userId,
            clientSessionId: incomingSessionId
        });

        if (!uiMessages || !Array.isArray(uiMessages)) {
            console.error('Invalid or missing messages in request');
            return NextResponse.json({ error: "Messages are required" }, { status: 400 });
        }

        const lastMessage = uiMessages?.[uiMessages.length - 1];

        // Extract text for persistence
        let lastMessageText = '';
        if (lastMessage?.content && typeof lastMessage.content === 'string') {
            lastMessageText = lastMessage.content;
        } else if (lastMessage?.parts) {
            lastMessageText = lastMessage.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join(' ');
        }

        console.log(`[AI CONSULT] Request from ${userId} [lang:${language}]:`, lastMessageText.substring(0, 100));

        // Robust conversion using AI SDK utility
        console.log('[AI CONSULT] Converting UI messages to model messages with convertToModelMessages...');
        const messages = await convertToModelMessages(uiMessages);

        console.log('[AI CONSULT] Conversion successful. Message count:', messages.length);

        // Debug: Log the full structure of the last 2 messages to identify why tool loop occurs
        messages.slice(-2).forEach((m, i) => {
            console.log(`[AI CONSULT] Converted Message ${i} [${(m as any).role}]:`, JSON.stringify(m).substring(0, 500));
        });

        const supabase = await createClient();
        let sessionId = incomingSessionId;

        console.log('[AI CONSULT] Checking session...');

        // 1. Ensure we have a session
        if (!sessionId && userId) {
            const { data: session, error: sessionError } = await supabase
                .from('ai_sessions')
                .insert({
                    user_id: userId,
                    title: lastMessageText.substring(0, 50) || 'New Conversation'
                })
                .select()
                .single();

            if (!sessionError && session) {
                sessionId = session.id;
            }
        }

        // 2. Save User Message
        if (sessionId && lastMessageText) {
            await supabase.from('ai_messages').insert({
                session_id: sessionId,
                role: 'user',
                content: lastMessageText
            });
        }

        const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
        const googleProvider = createGoogleGenerativeAI({ apiKey });

        // Call the language model
        const result = streamText({
            model: googleProvider('gemini-flash-latest'),
            messages,
            system: getSystemPrompt(language),
            toolChoice: 'auto',
            // @ts-ignore
            maxSteps: 5,
            tools: {
                generate_design_image: tool({
                    description: 'MANDATORY: Call this whenever the user wants to see, design, or visualize a room, building, or space. MUST be called for visual requests.',
                    parameters: z.object({
                        prompt: z.string().describe('Highly detailed architectural prompt for image generation. Style, lighting, materials, and location (Dhaka, Bangladesh).'),
                        designType: z.enum(['interior', 'exterior']).default('interior'),
                    }),
                    // @ts-ignore - Vercel AI SDK v6 tool generics mismatch
                    execute: async ({ prompt, designType }: { prompt?: string; designType?: 'interior' | 'exterior' }) => {
                        console.log(`[TOOL CALLED] generate_design_image. Raw Args:`, { prompt, designType });

                        // Robustness: If the model failed to provide args but we reached here, try to infer or fallback
                        const finalPrompt = prompt || "A beautiful modern interior design for a home in Bangladesh";
                        const finalType = designType || 'interior';

                        console.log(`[AI CONSULT] Executing with - Type: ${finalType}, Prompt: ${finalPrompt}`);

                        try {
                            // 1. Generate Image via Vertex AI Imagen 3
                            let base64Image: string;

                            try {
                                console.log('[AI CONSULT] Attempting Vertex AI generation...');
                                base64Image = await generateImagen3(finalPrompt, finalType);
                                console.log('[AI CONSULT] Vertex AI generation successful.');
                            } catch (e) {
                                console.warn('[AI CONSULT] Vertex AI failed or not configured, using fallback placeholder.', e);
                                // Fallback placeholder if Vertex AI is not yet setup
                                const placeholderUrl = finalType === 'interior'
                                    ? 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1000'
                                    : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1000';

                                return {
                                    success: true,
                                    url: placeholderUrl,
                                    message: `Generated a ${finalType} visualization (Fallback) based on: "${finalPrompt}"`,
                                };
                            }

                            // 2. Upload to Supabase Storage (ai-uploads bucket)
                            const supabase = await createClient();
                            const fileName = `${userId || 'guest'}/${uuidv4()}.png`;
                            const buffer = Buffer.from(base64Image, 'base64');

                            console.log('[AI CONSULT] Uploading to Supabase Storage:', fileName);
                            const { data: uploadData, error: uploadError } = await supabase.storage
                                .from('ai-uploads')
                                .upload(fileName, buffer, {
                                    contentType: 'image/png',
                                    upsert: true
                                });

                            if (uploadError) {
                                console.error('[AI CONSULT] Supabase Upload Error:', uploadError);
                                throw uploadError;
                            }
                            console.log('[AI CONSULT] Upload successful.');

                            // 3. Get Public URL
                            const { data: { publicUrl } } = supabase.storage
                                .from('ai-uploads')
                                .getPublicUrl(fileName);

                            console.log('[AI CONSULT] Public URL generated:', publicUrl);
                            return {
                                success: true,
                                url: publicUrl,
                                message: `Generated a ${finalType} visualization based on: "${finalPrompt}"`,
                            };

                        } catch (error) {
                            console.error('[AI CONSULT] Tool Execution Error:', error);
                            return {
                                success: false,
                                message: 'Failed to generate image. Please try again.',
                            };
                        }
                    },
                }),
            },
            onStepFinish: ({ text, toolCalls, toolResults, finishReason }) => {
                console.log(`[AI CONSULT] Step finished. Reason: ${finishReason}`);
                if (toolCalls && toolCalls.length > 0) {
                    console.log(`[AI CONSULT] Step emitted ${toolCalls.length} tool calls:`, toolCalls.map(tc => tc.toolName));
                }
                if (toolResults && toolResults.length > 0) {
                    console.log(`[AI CONSULT] Step returned ${toolResults.length} tool results.`);
                }
            },
            onFinish: async ({ text }) => {
                // Persist the assistant message
                if (sessionId) {
                    try {
                        const supabase = await createClient();
                        await supabase.from('ai_messages').insert({
                            session_id: sessionId,
                            role: 'assistant',
                            content: text || 'Assistant response (contained tool calls/results)'
                        });
                    } catch (e) {
                        console.error('[AI CONSULT] Persistence error:', e);
                    }
                }
            }
        });

        // Handle non-streaming requests (e.g., from mobile)
        if (body.stream === false) {
            const { text, toolResults } = await result;
            return NextResponse.json({
                text,
                toolResults,
                sessionId
            });
        }

        // 3. Respond with the stream using the UI message stream response (v6)
        return result.toUIMessageStreamResponse({
            headers: {
                'x-ai-session-id': sessionId || '',
            }
        });

    } catch (error: any) {
        console.error('API /ai/consult Error Details:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error?.message || 'Unknown error'
        }, { status: 500 });
    }
}
