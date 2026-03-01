import { Wrench, Zap, Droplet, PaintBucket, Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

const services = [
    {
        icon: Droplet,
        title: "Plumbing",
        titleBn: "প্লাম্বিং",
        description: "Leak repairs, pipe installation, and bathroom fittings.",
        descriptionBn: "লিক মেরামত, পাইপ ইনস্টলেশন এবং বাথরুমের ফিটিংস।",
        color: "bg-blue-100 text-blue-600"
    },
    {
        icon: Zap,
        title: "Electrical",
        titleBn: "ইলেকট্রিক্যাল",
        description: "Wiring, switchboard repairs, and appliance installation.",
        descriptionBn: "ওয়্যারিং, সুইচবোর্ড মেরামত এবং অ্যাপ্লায়েন্স ইনস্টলেশন।",
        color: "bg-yellow-100 text-yellow-600"
    },
    {
        icon: PaintBucket,
        title: "Painting",
        titleBn: "পেইন্টিং",
        description: "Interior & exterior painting with professional finish.",
        descriptionBn: "পেশাদার ফিনিশ সহ ইন্টেরিয়র এবং এক্সটেরিয়র পেইন্টিং।",
        color: "bg-pink-100 text-pink-600"
    },
    {
        icon: Hammer,
        title: "Carpentry",
        titleBn: "কাঠমিস্ত্রি সার্ভিস",
        description: "Furniture repair, door installation, and custom woodwork.",
        descriptionBn: "আসবাবপত্র মেরামত, দরজা ইনস্টলেশন এবং কাস্টম কাঠের কাজ।",
        color: "bg-orange-100 text-orange-600"
    },
    {
        icon: Wrench,
        title: "General Maintenance",
        titleBn: "সাধারণ রক্ষণাবেক্ষণ",
        description: "Drilling, mounting TV units, and general repairs.",
        descriptionBn: "ড্রিলিং, টিভি ইউনিট মাউন্ট করা এবং সাধারণ মেরামত।",
        color: "bg-gray-100 text-gray-600"
    }
];

export function RepairRenovationServices() {
    const { language } = useLanguage();
    const isBn = language === "BN";

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-8">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    {/* Text Content */}
                    <div className="md:w-1/3">
                        <span className="text-secondary-500 font-bold uppercase tracking-wider text-sm">{isBn ? "হোম সার্ভিস" : "Home Services"}</span>
                        <h2 className="heading-2 mt-2 mb-6">{isBn ? "বিশেষজ্ঞ মেরামত ও সংস্কার" : "Expert Repair & Renovation"}</h2>
                        <p className="text-neutral-500 text-lg mb-8">
                            {isBn
                                ? "ছোটখাটো সমস্যা বড় হতে দেবেন না। আপনার সব হোম মেইনটেন্যান্স প্রয়োজনে এখনই যাচাইকৃত পেশাদার বুক করুন।"
                                : "Don't let small issues become big problems. Book verified professionals for all your home maintenance needs instantly."}
                        </p>
                        <Button size="lg">{isBn ? "সার্ভিস রিকোয়েস্ট করুন" : "Request a Service"}</Button>
                    </div>

                    {/* Service Cards Grid */}
                    <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service, index) => (
                            <div key={index} className="p-6 rounded-xl border border-neutral-100 hover:border-primary-100 hover:shadow-lg transition-all bg-white group cursor-pointer">
                                <div className={`w-12 h-12 rounded-lg ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <service.icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-lg mb-2 text-neutral-900">{isBn ? service.titleBn : service.title}</h3>
                                <p className="text-neutral-500 text-sm leading-relaxed">
                                    {isBn ? service.descriptionBn : service.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

