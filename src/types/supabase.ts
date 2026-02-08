/* eslint-disable @typescript-eslint/no-explicit-any */
export type UserRole = 'customer' | 'designer' | 'seller' | 'admin';

export interface Profile {
    id: string;
    email: string;
    full_name: string;
    phone_number?: string;
    role: UserRole;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
}

export interface Designer {
    id: string;
    user_id: string;
    company_name: string;
    contact_person_name: string;
    business_registration_number?: string;
    specializations: string[];
    years_of_experience?: number;
    certifications?: { name: string; file_url: string }[];
    professional_license_number?: string;
    hourly_rate?: number;
    flat_rates?: { project_type: string; rate: number }[];
    minimum_project_size?: number;
    portfolio_images?: string[];
    projects?: any[];
    business_address?: any;
    service_areas?: string[];
    website_url?: string;
    social_media_links?: any;
    bank_details?: BankDetails;
    rating: number;
    total_projects: number;
    completed_projects: number;
    verification_status: 'pending' | 'verified' | 'rejected' | 'suspended';
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Seller {
    id: string;
    user_id: string;
    business_name: string;
    contact_person_name: string;
    business_type: 'manufacturer' | 'distributor' | 'retailer';
    verification_docs?: { businessReg: string; taxCert: string; tradeLicense: string };
    gst_number?: string;
    primary_categories: string[];
    warehouse_address?: any;
    service_areas?: string[];
    business_hours?: any;
    minimum_order_value?: number;
    delivery_capabilities?: any;
    bank_details?: BankDetails;
    commission_rate: number;
    payment_terms: 'net7' | 'net15' | 'net30';
    rating: number;
    total_sales: number;
    total_revenue: number;
    verification_status: 'pending' | 'verified' | 'rejected' | 'suspended';
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface BankDetails {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    taxId?: string;
}

export interface ServiceRequest {
    id: string;
    request_number: string;
    customer_id: string;
    assigned_designer_id?: string;
    assigned_by_admin_id?: string;
    service_type: 'structural_design' | 'interior_design' | 'health_check' | 'renovation';
    project_type?: string;
    requirements: any;
    status: ServiceRequestStatus;
    consultation_scheduled_at?: string;
    consultation_meeting_link?: string;
    consultation_notes?: string;
    quotation?: any;
    quotation_sent_at?: string;
    quotation_accepted_at?: string;
    milestones?: any[];
    draft_design_files?: string[];
    final_design_files?: string[];
    customer_feedback?: string;
    revision_count: number;
    advance_payment_status: 'pending' | 'paid' | 'failed';
    advance_paid_at?: string;
    advance_amount?: number;
    final_payment_status: 'pending' | 'paid' | 'failed';
    final_paid_at?: string;
    final_amount?: number;
    total_amount?: number;
    created_at: string;
    updated_at: string;
    completed_at?: string;
}

export type ServiceRequestStatus =
    | 'pending_assignment'
    | 'assigned'
    | 'consultation_scheduled'
    | 'in_progress'
    | 'draft_submitted'
    | 'revision_requested'
    | 'final_submitted'
    | 'completed'
    | 'cancelled'
    | 'disputed';
