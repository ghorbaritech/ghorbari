import { createClient } from '@/utils/supabase/client';

export interface SupportTicket {
    id: string;
    ticket_number: string;
    user_id: string;
    subject: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    assigned_to?: string;
    created_at: string;
    updated_at: string;
    user?: { full_name: string; email: string };
    assignee?: { full_name: string; email: string };
}

export async function createTicket(ticket: Partial<SupportTicket>) {
    const supabase = createClient();
    const ticketNumber = 'TKT-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 10000);

    const { data, error } = await supabase
        .from('support_tickets')
        .insert([{
            ...ticket,
            ticket_number: ticketNumber,
            status: 'open'
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getUserTickets(userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as SupportTicket[];
}

export async function getAllTickets(filters?: any) {
    const supabase = createClient();
    let query = supabase
        .from('support_tickets')
        .select('*, user:profiles!user_id(full_name, email), assignee:profiles!assigned_to(full_name)')
        .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.priority) query = query.eq('priority', filters.priority);

    const { data, error } = await query;
    if (error) throw error;
    return data as SupportTicket[];
}

export async function updateTicketStatus(id: string, status: string, assignedTo?: string) {
    const supabase = createClient();
    const updates: any = { status };
    if (assignedTo) updates.assigned_to = assignedTo;

    const { data, error } = await supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}
