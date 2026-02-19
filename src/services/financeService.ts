import { createClient } from '@/utils/supabase/client';

export interface LedgerEntry {
    id: string;
    amount: number;
    type: 'commission_charge' | 'payment_cleared' | 'adjustment';
    description: string;
    reference_id?: string;
    created_at: string;
}

export async function getSellerLedger(sellerId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('seller_ledger')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as LedgerEntry[];
}

export async function getSellerBalance(sellerId: string) {
    const entries = await getSellerLedger(sellerId);
    // Positive amount = Due/Charge, Negative = Payment/Credit
    // Total Due = Sum of all entries
    return entries.reduce((acc, curr) => acc + curr.amount, 0);
}

export async function processMockPayment(sellerId: string, amount: number) {
    const supabase = createClient();
    // In real app, this integrates with Payment Gateway (SSLCommerz)
    // Here we just insert a credit entry
    const { error } = await supabase
        .from('seller_ledger')
        .insert([{
            seller_id: sellerId,
            amount: -amount, // Credit
            type: 'payment_cleared',
            description: 'Manual Payment via Portal'
        }]);

    if (error) throw error;
}
