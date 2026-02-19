
import { NextResponse } from 'next/server';
import { adminSignIn } from '@/app/adminlogin/actions';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const formData = new FormData();
        formData.append('email', body.email);
        formData.append('password', body.password);

        console.log('API Debug: Triggering adminSignIn...');
        const result = await adminSignIn(formData);
        console.log('API Debug: Result:', result);

        return NextResponse.json({ result });
    } catch (error: any) {
        console.error('API Debug: Crash:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
