import { NextResponse } from 'next/server'
import { generateDemoPartners } from '@/app/admin/onboarding/actions'

export async function GET() {
    try {
        const results = await generateDemoPartners()
        return NextResponse.json({ success: true, results })
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}
