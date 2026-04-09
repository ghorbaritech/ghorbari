import { InteriorCalculator } from "@/components/tools/InteriorCalculator";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function InteriorCalculatorPage() {
    return (
        <main className="min-h-screen bg-[#fbfcfd]">
            <Navbar />
            <div className="py-12 md:py-20">
                <InteriorCalculator />
            </div>
            <Footer />
        </main>
    );
}
