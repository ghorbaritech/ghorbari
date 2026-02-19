import { createClient } from '@/utils/supabase/client';

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
    sender?: { full_name: string; avatar_url?: string };
}

export interface Conversation {
    id: string;
    type: string;
    context_id: string;
    participants: string[];
    last_message: string;
    last_message_at: string;
    other_participant?: { full_name: string; id: string }; // Hydrated on fetch
}

/**
 * Get or create a conversation for a specific context (e.g. order, ticket)
 */
export async function getConversationByContext(contextId: string, type: string, participants: string[]) {
    const supabase = createClient();

    // 1. Try to find existing
    const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .eq('context_id', contextId)
        .eq('type', type)
        .single();

    if (existing) return existing;

    // 2. Create new if not found
    const { data: newConv, error } = await supabase
        .from('conversations')
        .insert([{
            type,
            context_id: contextId,
            participants,
            last_message: 'Conversation started',
        }])
        .select()
        .single();

    if (error) throw error;
    return newConv;
}

export async function getMessages(conversationId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('messages')
        .select('*, sender:profiles(full_name)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data as Message[];
}

export async function sendMessage(conversationId: string, senderId: string, content: string) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('messages')
        .insert([{
            conversation_id: conversationId,
            sender_id: senderId,
            content
        }])
        .select()
        .single();

    if (error) throw error;

    // Update conversation last_message
    await supabase
        .from('conversations')
        .update({
            last_message: content,
            last_message_at: new Date().toISOString()
        })
        .eq('id', conversationId);

    return data;
}

export function subscribeToMessages(conversationId: string, callback: (msg: Message) => void) {
    const supabase = createClient();
    return supabase
        .channel(`chat:${conversationId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${conversationId}`
            },
            (payload: any) => {
                callback(payload.new as Message);
            }
        )
        .subscribe();
}
