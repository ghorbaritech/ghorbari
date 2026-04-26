'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function createContract(data: any) {
    const supabase = await createClient()
    const adminClient = createAdminClient()
    
    // 1. Get current user session
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized access." }

    // 2. Insert the contract record
    const { data: contract, error: contractError } = await adminClient
        .from('contracts')
        .insert({
            partner_id: user.id, // Current user as the partner
            contract_type: 'PARTNER_ONBOARDING',
            status: 'SIGNED',
            variable_data: {
                partnerName: data.partnerName,
                nidPassport: data.nidPassport,
                phone: data.phone,
                email: data.email,
                address: data.address,
                businessName: data.businessName,
                tradeLicense: data.tradeLicense,
                selectedServices: data.selectedServices,
                bankAccount: data.bankAccount,
                bankName: data.bankName,
                branchName: data.branchName,
                mobilePayment: data.mobilePayment,
                witnessName: data.witnessName
            },
            signed_at: new Date().toISOString()
        })
        .select()
        .single()

    if (contractError) {
        console.error("Contract Error Details:", contractError)
        return { error: contractError.message || "Failed to create contract." }
    }

    // 3. Insert the signature record
    const { error: signatureError } = await adminClient
        .from('contract_signatures')
        .insert({
            contract_id: contract.id,
            signer_id: user.id,
            signature_svg: data.signatureData,
            ip_address: 'Captured via Proxy', // Real apps would use headers
            user_agent: 'Server' // Server actions execute in Node
        })

    if (signatureError) {
        console.error("Signature Error Details:", signatureError)
        return { error: signatureError.message || "Failed to save signature." }
    }

    // 4. Resolve scope from selectedServices and Sync Roles
    const { data: categories } = await adminClient
        .from('product_categories')
        .select('id, type')
        .in('id', data.selectedServices || [])

    const hasProduct = categories?.some(c => c.type === 'product')
    const hasService = categories?.some(c => c.type === 'service')
    const hasDesign = categories?.some(c => c.type === 'design')

    // SELLER (Product)
    if (hasProduct) {
        await adminClient.from('sellers').upsert({
            user_id: user.id,
            business_name: data.businessName,
            verification_status: 'pending',
            updated_at: new Date().toISOString()
        })
    }

    // DESIGNER (Design)
    if (hasDesign) {
        const selectedDesign = categories?.filter(c => c.type === 'design').map(c => c.id) || []
        await adminClient.from('designers').upsert({
            user_id: user.id,
            company_name: data.businessName,
            specializations: selectedDesign,
            active_specializations: selectedDesign,
            verification_status: 'pending',
            updated_at: new Date().toISOString()
        })
    }

    // SERVICE PROVIDER (Service)
    if (hasService) {
        const selectedServices = categories?.filter(c => c.type === 'service').map(c => c.id) || []
        await adminClient.from('service_providers').upsert({
            user_id: user.id,
            business_name: data.businessName,
            service_types: selectedServices,
            active_service_types: selectedServices,
            verification_status: 'pending',
            updated_at: new Date().toISOString()
        })
    }

    // 5. Update profile status to pending and ensure step is recorded
    const { error: updateError } = await adminClient
        .from('profiles')
        .update({ 
            onboarding_status: 'pending',
            onboarding_step: 4,
            role: 'partner',
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

    if (updateError) {
        console.error("Profile Status Update Error:", updateError)
        // We don't necessarily return error here as the contract is already saved, 
        // but we should log it so we know why redirection might fail.
    }

    return { success: true, contractId: contract.id }
}

export async function getContracts() {
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
        .from('contracts')
        .select(`
            *,
            profile:profiles(id, full_name, email)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Failed to list contracts", error)
        return []
    }
    return data
}

export async function getContractById(contractId: string) {
    const adminClient = createAdminClient()
    const { data: contract, error: contractError } = await adminClient
        .from('contracts')
        .select(`*`)
        .eq('id', contractId)
        .single()
        
    if (contractError) {
        console.error("Failed to get contract", contractError)
        return { success: false, error: "Contract not found" }
    }
    
    const { data: signature, error: sigError } = await adminClient
        .from('contract_signatures')
        .select('*')
        .eq('contract_id', contractId)
        .single()

    return { success: true, contract, signature }
}

export async function updateContractData(contractId: string, updatedVariableData: any) {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    // 1. Get current user session
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized access." }

    const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') {
        return { error: 'Unauthorized: Admins only' }
    }

    const { error } = await adminClient
        .from('contracts')
        .update({
            variable_data: updatedVariableData,
            updated_at: new Date().toISOString()
        })
        .eq('id', contractId)

    if (error) {
        console.error("Failed to update contract details", error)
        return { error: error.message }
    }
    
    return { success: true }
}

export async function getContractByPartnerId(partnerId: string) {
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
        .from('contracts')
        .select('id')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (error) {
        console.error("Failed to find contract for partner", error)
        return null
    }
    return data?.id || null
}
