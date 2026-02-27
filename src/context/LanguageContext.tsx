"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from './translations';

type Language = 'EN' | 'BN';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: typeof translations.EN;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    // Default to BN; restore from localStorage if user has previously switched
    const [language, setLanguageState] = useState<Language>('BN');

    useEffect(() => {
        const saved = localStorage.getItem('ghorbari_lang') as Language | null;
        const lang = (saved === 'EN' || saved === 'BN') ? saved : 'BN';
        setLanguageState(lang);
        document.documentElement.lang = lang === 'BN' ? 'bn' : 'en';
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('ghorbari_lang', lang);
        // Set html[lang] so CSS font override activates
        document.documentElement.lang = lang === 'BN' ? 'bn' : 'en';
    };

    const value = {
        language,
        setLanguage,
        t: translations[language],
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
