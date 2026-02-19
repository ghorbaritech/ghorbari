import { createClient } from '@/utils/supabase/server'

export default async function DebugPage() {
    let debugInfo: any = {
        logs: [],
        env: {
            url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'DEFINED' : 'MISSING',
            key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'DEFINED' : 'MISSING'
        }
    };

    try {
        const supabase = await createClient();
        debugInfo.clientExists = !!supabase;

        if (supabase) {
            debugInfo.authExists = !!supabase.auth;
            debugInfo.authType = typeof supabase.auth;

            if (supabase.auth) {
                debugInfo.signInFunctionType = typeof supabase.auth.signInWithPassword;
                debugInfo.methods = Object.keys(supabase.auth);

                // Try to get prototype methods if plain object keys are empty (for classes)
                if (debugInfo.methods.length === 0) {
                    debugInfo.methods = Object.getOwnPropertyNames(Object.getPrototypeOf(supabase.auth));
                }
            }
        }

    } catch (e: any) {
        debugInfo.error = e.message;
        debugInfo.stack = e.stack;
    }

    return (
        <div className="p-10 font-mono text-sm">
            <h1 className="text-xl font-bold mb-4">Auth Debugger</h1>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
            </pre>
        </div>
    );
}
