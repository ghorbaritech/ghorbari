"use server"

import { createClient } from "@/utils/supabase/server";
import { ServiceCartItem } from "@/context/ServiceCartContext";

export async function placeServiceRequest(data: {
    items: ServiceCartItem[];
    assignmentType: 'dalankotha_assign' | 'user_choose';
    providerId?: string;
    schedule: any;
    totalAmount: number;
    requirements?: any;
    customerDetails?: any; // Added for guest checkout
}) {
    const supabase = await createClient();

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Generate Request Number
    const requestNumber = `SRV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    try {
        const insertData: any = {
            request_number: requestNumber,
            service_type: data.items[0]?.category?.name || 'Home Service', // Simplified
            requirements: {
                ...data.requirements,
                notes: "Service booking from marketplace",
                itemsCount: data.items.length
            },
            assignment_type: data.assignmentType,
            assigned_designer_id: null,
            preferred_schedule: data.schedule,
            total_amount: data.totalAmount,
            status: 'pending_assignment'
        };

        if (user) {
            insertData.customer_id = user.id;
        } else if (data.customerDetails) {
            insertData.customer_email = data.customerDetails.email;
            insertData.customer_phone = data.customerDetails.phone;
            insertData.customer_name = data.customerDetails.name;
        } else {
            return { error: "Customer details or login required" };
        }

        // 3. Insert Service Request
        const { data: request, error: requestError } = await supabase
            .from('service_requests')
            .insert(insertData)
            .select()
            .single();

        if (requestError) throw requestError;

        // 4. Insert Items
        const requestItems = data.items.map(item => ({
            request_id: request.id,
            service_item_id: item.id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.unit_price * item.quantity
        }));

        const { error: itemsError } = await supabase
            .from('service_request_items')
            .insert(requestItems);

        if (itemsError) throw itemsError;

        // 5. If specific provider chosen, create a "consultation" or similar (Optional for now)

        return { success: true, requestNumber };

    } catch (e: any) {
        console.error("placeServiceRequest Error:", e);
        return { error: e.message || "Failed to place service request" };
    }
}
