/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Creates a mock Supabase client that satisfies the type system 
 * and prevents crashing during build-time prerendering when 
 * environment variables are missing.
 */
export function createMockClient(): any {
    const mockResponse = { data: null, error: null, count: null, status: 200, statusText: 'OK' };
    const mockPromise = Promise.resolve(mockResponse);

    const handler: ProxyHandler<any> = {
        get(target, prop): any {
            // Special case for thenable (Promise compatibility)
            if (prop === 'then') return undefined;

            // Handle common methods by returning a function that returns the proxy (chaining)
            const mockFunc = () => new Proxy({}, handler);

            // Add promise-like behavior to the proxy itself for awaitable calls
            (mockFunc as any).then = (onfulfilled: any) => mockPromise.then(onfulfilled);
            (mockFunc as any).catch = (onrejected: any) => mockPromise.catch(onrejected);
            (mockFunc as any).finally = (onfinally: any) => mockPromise.finally(onfinally);

            // Specific mocks for common auth methods
            if (prop === 'auth') {
                return {
                    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
                    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
                    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
                    signOut: () => Promise.resolve({ error: null }),
                };
            }

            return mockFunc;
        }
    };

    return new Proxy({}, handler);
}
