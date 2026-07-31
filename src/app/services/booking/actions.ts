"use server"

import { createClient } from "@/utils/supabase/server";
import { ServiceCartItem } from "@/store/unifiedCartStore";

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
                itemsCount: data.items.length,
                // Store item details inline since service_items table uses seeded IDs only
                bookedItems: data.items.map(item => ({
                    id: item.id,
                    name: item.name,
                    name_bn: item.name_bn,
                    unit_price: item.unit_price,
                    unit_type: item.unit_type,
                    quantity: item.quantity,
                    subtotal: item.unit_price * item.quantity,
                    category: item.category?.name
                }))
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

        // 4. Insert Items - service_item_id is null for catalog-based items from product_categories
        // The item details are stored in the service request requirements JSONB instead
        const requestItems = data.items.map(item => ({
            request_id: request.id,
            service_item_id: null, // product_categories IDs are not valid FK into service_items table
            service_name: item.name,
            service_name_bn: item.name_bn || item.name,
            category_id: item.category_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.unit_price * item.quantity
        }));

        const { error: itemsError } = await supabase
            .from('service_request_items')
            .insert(requestItems);

        if (itemsError) {
            // If inserting items fails (e.g. schema mismatch), skip gracefully
            // The request was still created; admin will see item count in requirements
            console.warn('service_request_items insert warning:', itemsError.message);
        }

        return { success: true, requestNumber };

    } catch (e: any) {
        console.error("placeServiceRequest Error:", e);
        return { error: e.message || "Failed to place service request" };
    }
}
