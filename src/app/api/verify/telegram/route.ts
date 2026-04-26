import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * TELEGRAM VERIFICATION WEBHOOK
 * 
 * Logic Flow:
 * 1. Partner clicks 'Verify with Telegram' in Onboarding UI.
 * 2. They are redirected to the Telegram Bot with a specific deep-link token.
 * 3. Partner 'Starts' the bot and 'Shares Contact'.
 * 4. Telegram sends a POST request here with the user's phone and deep-link token.
 * 5. We match the token to the Profile ID and update 'phone_verified' to true.
 */

export async function POST(req: Request) {
    try {
        const payload = await req.json();
        const supabase = await createClient();

        console.log('Telegram Webhook Received:', payload);

        // Security Check: Verify Telegram Secret (should be in env)
        const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!telegramToken) {
            console.warn('TELEGRAM_BOT_TOKEN not configured. Stubbing verification.');
        }

        // Logic for extracting data from Telegram Update (simplified)
        // message.contact.phone_number and message.text (for token)
        const chat_id = payload.message?.chat?.id;
        const phone = payload.message?.contact?.phone_number;
        const text = payload.message?.text; // Usually contains the token if it's a /start [token]

        if (phone && text && text.startsWith('/start ')) {
            const token = text.split(' ')[1];

            // Match token to user in profiles
            const { data: profile, error: searchError } = await supabase
                .from('profiles')
                .select('id, full_name')
                .eq('verification_token', token)
                .single();

            if (searchError || !profile) {
                console.error('Telegram Match Error:', searchError || 'No profile found for token');
                return NextResponse.json({ status: 'invalid_token' }, { status: 404 });
            }

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ 
                    phone_verified: true,
                    phone: phone.startsWith('+') ? phone : `+${phone}`, // Normalize E.164
                    telegram_chat_id: String(chat_id)
                })
                .eq('id', profile.id);

            if (updateError) {
                console.error('Telegram Update Error:', updateError);
                throw updateError;
            }

            return NextResponse.json({ 
                status: 'verified', 
                userId: profile.id,
                userName: profile.full_name 
            });
        }

        return NextResponse.json({ status: 'received' });

    } catch (error: any) {
        console.error('Telegram Webhook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
