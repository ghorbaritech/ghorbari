import { createClient } from '@/utils/supabase/client';

export type QuoteType = 'product' | 'service' | 'design';

export interface QuoteHistoryItem {
    id?: string; // specific history id not strictly needed if jsonb array
    by: 'customer' | 'partner' | 'admin';
    amount: number;
    note?: string;
    date: string;
}

export interface NegotiableEntity {
    id: string;
    status: string;
    quotation_history: QuoteHistoryItem[] | null;
    agreed_amount?: number;
    total_amount?: number; // fallback for current logic
}

/**
 * Adds a new quote/counter-offer to the history of a negotiable entity.
 */
export async function sendQuote(
    type: QuoteType,
    id: string,
    offer: { by: 'customer' | 'partner' | 'admin'; amount: number; note?: string }
) {
    const supabase = createClient();
    const table = type === 'product' ? 'product_inquiries'
        : type === 'service' ? 'service_requests'
            : 'design_bookings';

    // 1. Fetch current history
    const { data: current, error: fetchError } = await supabase
        .from(table)
        .select('quotation_history, status')
        .eq('id', id)
        .single();

    if (fetchError) throw fetchError;

    const history: QuoteHistoryItem[] = current.quotation_history || [];
    const newEntry: QuoteHistoryItem = {
        by: offer.by,
        amount: offer.amount,
        note: offer.note,
        date: new Date().toISOString()
    };

    const updatedHistory = [...history, newEntry];

    // Determine new status
    // If partner sends, status -> 'quoted' (or 'negotiation' if it was already quoted)
    // If customer sends, status -> 'negotiation'
    let newStatus = current.status;
    if (offer.by === 'partner' || offer.by === 'admin') {
        newStatus = 'quoted'; // Simplification, could be 'negotiation'
    } else {
        newStatus = 'negotiation';
    }

    // 2. Update
    const { data, error } = await supabase
        .from(table)
        .update({
            quotation_history: updatedHistory,
            status: newStatus,
            // If it's a final agreement (handled separately usually, but could be implied)
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function acceptQuote(type: QuoteType, id: string, amount: number) {
    const supabase = createClient();
    const table = type === 'product' ? 'product_inquiries'
        : type === 'service' ? 'service_requests'
            : 'design_bookings';

    const { data, error } = await supabase
        .from(table)
        .update({
            status: 'accepted', // or 'payment_pending'
            agreed_amount: amount
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function createProductInquiry(inquiry: any) {
    const supabase = createClient();
    // Logic to insert into product_inquiries
    // Generate simple ID like INQ-{Random}
    const inquiryNumber = 'INQ-' + Math.floor(Math.random() * 10000);

    const { data, error } = await supabase
        .from('product_inquiries')
        .insert([{ ...inquiry, inquiry_number: inquiryNumber }])
        .select()
        .single();

    if (error) throw error;
    return data;
}
