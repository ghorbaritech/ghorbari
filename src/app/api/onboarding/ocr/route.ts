import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const frontImage = formData.get('front') as File;
        const backImage = formData.get('back') as File;

        if (!frontImage) {
            return NextResponse.json({ error: 'Front image is required' }, { status: 400 });
        }

        // Convert files to ArrayBuffers
        const frontBuffer = await frontImage.arrayBuffer();
        
        // Prepare prompt for Gemini
        const prompt = `
            You are a specialized OCR engine for Bangladeshi National ID (NID) cards.
            Extract the following information from the provided images:
            1. Full Name (English) - look specifically for the English version if available.
            2. NID Number - this is a critical field. It is usually a series of 10, 13, or 17 digits. Ensure you capture all digits correctly.
            3. Date of Birth (Format: YYYY-MM-DD).

            Return ONLY a JSON object with these keys: 
            {
                "fullName": "...",
                "nidNumber": "...",
                "dob": "...",
                "confidence": 0.0-1.0
            }
        `;

        const { text } = await generateText({
            model: google('gemini-1.5-flash'),
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        { type: 'file', data: frontBuffer, mimeType: frontImage.type },
                        ...(backImage ? [{ type: 'file', data: await backImage.arrayBuffer(), mimeType: backImage.type }] : [])
                    ],
                },
            ],
        });

        // Parse JSON from text (handling potential markdown blocks)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        let data = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

        if (!data) {
            console.error('Gemini OCR Text Output:', text);
            throw new Error('Failed to parse OCR response from Gemini');
        }

        // Standardize keys and add system metadata
        const responseData = {
            fullName: data.fullName || data.full_name || '',
            nidNumber: data.nidNumber || data.nid_number || '',
            dob: data.dob || data.date_of_birth || '',
            confidence: data.confidence || 0,
            processedAt: new Date().toISOString()
        };

        return NextResponse.json(responseData);

    } catch (error: any) {
        console.error('OCR Processing Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
