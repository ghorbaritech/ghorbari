import React from 'react';
import CostCalculator from '@/components/tools/CostCalculator';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Construction Cost Calculator | Dalankotha',
    description: 'Estimate your building construction cost instantly with Dalankotha intelligent cost calculator. Get detailed breakdown for civil, finishing, and MEP works.',
    openGraph: {
        title: 'Construction Cost Calculator | Dalankotha',
        description: 'Instant construction cost estimation for your dream home in Bangladesh.',
        images: ['/og-calculator.jpg'], // Should exist or fall back to default
    }
};

export default function CalculatorPage() {
    return (
        <main className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1">
                <CostCalculator />
            </div>
            <Footer />
        </main>
    );
}
