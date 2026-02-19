/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Creates a mock Supabase client that satisfies the type system 
 * and prevents crashing during build-time prerendering when 
 * environment variables are missing.
 */
export function createMockClient(): any {
    const mockResponse = { data: null, error: null, count: null, status: 200, statusText: 'OK' };
    const mockPromise = Promise.resolve(mockResponse);

    const queryHandler: ProxyHandler<any> = {
        get(target, prop) {
            if (prop === 'then') {
                return (onfulfilled: any, onrejected: any) => mockPromise.then(onfulfilled, onrejected);
            }
            if (prop === 'catch') return (onrejected: any) => mockPromise.catch(onrejected);
            if (prop === 'finally') return (onfinally: any) => mockPromise.finally(onfinally);

            // Chain
            const mockFunc = () => new Proxy({}, queryHandler);
            // Make the function returned by the chain also produce a thenable (it does by returning proxy)
            // But if we await the function object itself? (unlikely for query builder methods)
            // However, to be safe and consistent with previous "any" typing:
            (mockFunc as any).then = (onfulfilled: any, onrejected: any) => mockPromise.then(onfulfilled, onrejected);
            return mockFunc;
        }
    };

    const clientHandler: ProxyHandler<any> = {
        get(target, prop): any {
            // Client itself is NOT thenable
            if (prop === 'then') return undefined;

            // Specific mocks for common auth methods
            if (prop === 'auth') {
                return {
                    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
                    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
                    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
                    signOut: () => Promise.resolve({ error: null }),
                    signInWithPassword: () => Promise.resolve({
                        data: { user: null, session: null },
                        error: { message: 'Supabase credentials missing on server. Please configure NEXT_PUBLIC_SUPABASE_URL and KEY.' }
                    }),
                };
            }

            // Default: return query chain start
            const mockFunc = () => new Proxy({}, queryHandler);
            return mockFunc;
        }
    };

    return new Proxy({}, clientHandler);
}
