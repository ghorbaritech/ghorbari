import { createClient } from '@/utils/supabase/client'

export interface PlatformConfig {
    category_id: string | null;
    vat_rate: number;
    platform_fee_rate: number;
    advance_payment_rate: number;
}

export async function getPlatformConfigs() {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('platform_configs')
        .select(`
            *,
            category:product_categories(name, type)
        `)
        .eq('is_active', true)

    if (error) {
        console.error('Error fetching platform configs:', error)
        return []
    }

    return data
}

export async function updatePlatformConfig(configId: string, updates: Partial<PlatformConfig>) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('platform_configs')
        .update(updates)
        .eq('id', configId)
        .select()
        .single()

    if (error) {
        console.error('Error updating platform config:', error)
        throw error
    }

    return data
}

export interface Order {
    id: string;
    order_number: string;
    customer_id: string | null;
    seller_id: string;
    total_amount: number;
    advance_amount: number;
    remaining_amount: number;
    vat_amount: number;
    platform_fee: number;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    items: any[];
    shipping_address: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    created_at: string;
}

export interface CustomerDetails {
    name: string;
    email: string;
    phone: string;
    address: string;
}

export async function createOrder(orderData: Partial<Order>, customerDetails: CustomerDetails, isGuest: boolean = false) {
    const supabase = createClient()

    // 1. If guest, trigger account creation
    if (isGuest && customerDetails.email) {
        try {
            // Check if user exists or sign them up
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: customerDetails.email,
                password: Math.random().toString(36).slice(-12),
                options: {
                    data: {
                        full_name: customerDetails.name,
                        phone_number: customerDetails.phone,
                    }
                }
            })

            if (!authError && authData.user) {
                console.log('Guest signup successful, triggering password reset email...');
                // Trigger password reset email so they can set their own password
                const { error: resetError } = await supabase.auth.resetPasswordForEmail(customerDetails.email, {
                    redirectTo: `${window.location.origin}/dashboard`
                })

                if (resetError) {
                    console.error('Password reset email failed:', resetError.message);
                    console.error('Full Reset Error:', resetError);
                } else {
                    console.log('Password reset email sent successfully to:', customerDetails.email);
                }

                orderData.customer_id = authData.user.id
            } else if (authError && authError.message.includes('already registered')) {
                console.log('User already exists, proceeding with order linked to email only');
                // Attempt to link if current session is this user, or if we can fetch user id (unlikely on client)
            } else if (authError) {
                console.error('Auth Signup Error:', authError.message);
            }
        } catch (e) {
            console.error('Guest signup failed', e)
        }
    }

    const { data, error } = await supabase
        .from('orders')
        .insert([{
            ...orderData,
            customer_phone: customerDetails.phone,
            customer_email: customerDetails.email,
            customer_name: customerDetails.name,
            shipping_address: customerDetails.address,
            advance_amount: orderData.advance_amount || 0,
            remaining_amount: orderData.remaining_amount || 0,
            vat_amount: orderData.vat_amount || 0,
            platform_fee: orderData.platform_fee || 0,
            status: 'pending'
        }])
        .select()
        .single()

    if (error) {
        console.error('Order Insertion Failed!');
        console.error('Error Message:', error.message);
        console.error('Error Code:', error.code);
        console.error('Error Details:', error.details);
        console.error('Error Hint:', error.hint);
        console.error('Payload:', JSON.stringify(orderData, null, 2));
        throw error
    }

    return data
}

export async function getAdminOrders() {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            customer:profiles!customer_id(full_name, phone_number, email),
            seller:sellers!seller_id(business_name)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching admin orders:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        })
        return []
    }

    return data
}

export async function confirmOrder(orderId: string, adminId: string, notes?: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('orders')
        .update({
            status: 'confirmed',
            confirmed_at: new Date().toISOString(),
            confirmed_by: adminId,
            admin_notes: notes
        })
        .eq('id', orderId)
        .select()
        .single()

    if (error) {
        console.error('Error confirming order:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        })
        throw error
    }

    return data
}
