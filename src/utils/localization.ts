export type Language = 'EN' | 'BN';

/**
 * Returns the localized version of a text based on the current language.
 * Falls back to English if the Bengali version is missing.
 */
export function getL(en: string | null | undefined, bn: string | null | undefined, currentLanguage: Language): string {
    if (currentLanguage === 'BN') {
        return bn || en || '';
    }
    return en || '';
}

/**
 * Helper to get the correct field name for dynamic queries (if needed)
 */
export function getLField(baseField: string, currentLanguage: Language): string {
    return currentLanguage === 'BN' ? `${baseField}_bn` : baseField;
}
