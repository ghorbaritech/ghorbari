/**
 * 🎨 Dalankotha Image Generation Utility
 * Uses Gemini 2.0 Flash Preview Image Generation
 * Model: gemini-2.0-flash-preview-image-generation
 * NOTE: Standard gemini-2.0-flash does NOT generate images via generateContent.
 *       The preview image generation model must be used explicitly.
 */

const IMAGE_GEN_MODEL = 'gemini-2.5-flash-image';
const IMAGE_GEN_TIMEOUT_MS = 30_000; // 30 second hard timeout (image gen can be slow)

export async function generateRoomDesign(
    prompt: string,
    roomImageBase64?: string
): Promise<string> {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) throw new Error('GOOGLE_GEMINI_API_KEY is not configured');

    const parts: any[] = [];

    if (roomImageBase64) {
        // Room photo provided — redesign mode
        const cleanBase64 = roomImageBase64.replace(/^data:image\/\w+;base64,/, '');
        parts.push({
            inlineData: { mimeType: 'image/jpeg', data: cleanBase64 },
        });
        parts.push({
            text: `[ROOM REDESIGN TASK]
Redesign the room in this photo. Keep the exact structural geometry (walls, ceiling, windows, doors, camera angle).
Only change: furniture, wall textures/paint, floor materials, lighting fixtures, colors, and decorations.
Apply this style: ${prompt}
Output: Photorealistic architectural photography, 4K quality, beautiful professional lighting.`,
        });
    } else {
        // Fresh design generation
        parts.push({
            text: `Create a photorealistic interior design visualization.
Style requirements: ${prompt}
Setting: High-end Bangladesh apartment, Dhaka.
Output: Professional architectural photography, beautiful lighting, 4K quality, ultra-realistic.`,
        });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), IMAGE_GEN_TIMEOUT_MS);

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_GEN_MODEL}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({
                    contents: [{ role: 'user', parts }],
                    generationConfig: {
                        responseModalities: ['IMAGE', 'TEXT'],
                        temperature: 1,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errText = await response.text();
            console.error('[Imagen] API error:', response.status, errText.slice(0, 300));
            throw new Error(`Image generation failed: HTTP ${response.status}`);
        }

        const data = await response.json();
        const imagePart = data?.candidates?.[0]?.content?.parts?.find(
            (p: any) => p.inlineData?.data
        );

        if (!imagePart?.inlineData?.data) {
            const candidate = data?.candidates?.[0];
            console.error('[Imagen] No image in response. Finish reason:', candidate?.finishReason);
            throw new Error('No image returned from Gemini. Model may have declined the request.');
        }

        return imagePart.inlineData.data; // base64 PNG string
    } finally {
        clearTimeout(timeout);
    }
}

// Backwards-compatible export alias
export const generateImagen3 = generateRoomDesign;
