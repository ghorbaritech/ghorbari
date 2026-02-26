/**
 * Centralized error reporting and logging utility.
 * In a real production app, this would integrate with Sentry or LogRocket.
 */

export interface GhorbariError extends Error {
    code?: string;
    details?: any;
    context?: string;
}

export const logError = (error: any, context: string) => {
    const formattedError: GhorbariError = {
        name: error?.name || 'UnknownError',
        message: error?.message || String(error),
        code: error?.code,
        details: error?.details,
        context
    };

    // Console logging with distinct formatting
    console.group(`🚨 Ghorbari Error [${context}]`);
    console.error('Message:', formattedError.message);
    if (formattedError.code) console.error('Code:', formattedError.code);
    if (formattedError.details) console.error('Details:', formattedError.details);
    console.groupEnd();

    // Potential for future metrics/tracking
    // trackErrorInAnalytics(formattedError);
};

export const handleServiceError = (error: any, serviceName: string, methodName: string) => {
    const context = `${serviceName}.${methodName}`;
    logError(error, context);

    // Standardized fallback or rethrow logic
    return {
        data: null,
        error: formattedErrorMessage(error)
    };
};

const formattedErrorMessage = (error: any) => {
    if (error?.code === 'PGRST116') return 'Resource not found.';
    if (error?.code === '23505') return 'Information already exists.';
    return error?.message || 'A database error occurred.';
};
