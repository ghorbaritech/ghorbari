export const designCategories = [
    { id: 'cat_structural', name: 'Structural Design', nameBn: 'স্ট্রাকচারাল ডিজাইন' },
    { id: 'cat_architectural', name: 'Architectural Design', nameBn: 'আর্কিটেকচারাল ডিজাইন' },
    { id: 'cat_interior', name: 'Interior Design', nameBn: 'ইন্টেরিয়র ডিজাইন' },
    { id: 'cat_landscape', name: 'Landscape Design', nameBn: 'ল্যান্ডস্কেপ ডিজাইন' },
    { id: 'cat_commercial', name: 'Commercial Spaces', nameBn: 'কমাশিয়াল স্পেস' },
];

export const designServices = [
    {
        id: 'dsn_001',
        title: 'Complete Home Interior Package',
        title_bn: 'সম্পূর্ণ হোম ইন্টেরিয়র প্যাকেজ',
        base_price: 150000,
        images: ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=600&fit=crop'],
        rating: 4.9,
        category: { name: 'Interior Design', name_bn: 'ইন্টেরিয়র ডিজাইন' },
        category_id: 'cat_interior',
        seller_id: 'des_001',
        seller: { business_name: 'Urban Living Studios', business_name_bn: 'আরবান লিভিং স্টুডিওস' },
        brand: 'Premium',
        description: 'End-to-end interior design for 3-bedroom apartments.',
        description_bn: '৩-বেডরুমের অ্যাপার্টমেন্টের জন্য সম্পূর্ণ ইন্টেরিয়র ডিজাইন সমাধান।'
    },
    {
        id: 'dsn_002',
        title: 'Structural Safety Assessment',
        title_bn: 'স্ট্রাকচারাল সেফটি অ্যাসেসমেন্ট',
        base_price: 25000,
        images: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop'],
        rating: 5.0,
        category: { name: 'Structural Design', name_bn: 'স্ট্রাকচারাল ডিজাইন' },
        category_id: 'cat_structural',
        seller_id: 'des_002',
        seller: { business_name: 'SafeBuild Engineers', business_name_bn: 'সেফবিল্ড ইঞ্জিনিয়ার্স' },
        brand: 'Certified',
        description: 'Detailed structural integrity assessment for existing buildings.',
        description_bn: 'বিদ্যমান ভবনগুলোর জন্য বিস্তারিত স্ট্রাকচারাল ইন্টিগ্রিটি অ্যাসেসমেন্ট।'
    },
    {
        id: 'dsn_003',
        title: 'Modern Villa Architecture',
        title_bn: 'আধুনিক ভিলা আর্কিটেকচার',
        base_price: 200000,
        images: ['https://images.unsplash.com/photo-1600596542815-27b88e9950e9?w=800&h=600&fit=crop'],
        rating: 4.8,
        category: { name: 'Architectural Design', name_bn: 'আর্কিটেকচারাল ডিজাইন' },
        category_id: 'cat_architectural',
        seller_id: 'des_001',
        seller: { business_name: 'Urban Living Studios', business_name_bn: 'আরবান লিভিং স্টুডিওস' },
        brand: 'Luxury',
        description: 'Comprehensive architectural planning for duplex villas.',
        description_bn: 'ডুপ্লেক্স ভিলার জন্য ব্যাপক স্থাপত্য পরিকল্পনা।'
    },
    {
        id: 'dsn_004',
        title: 'Office Space Planning',
        title_bn: 'অফিস স্পেস প্ল্যানিং',
        base_price: 80000,
        images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'],
        rating: 4.7,
        category: { name: 'Commercial Spaces', name_bn: 'কমাশিয়াল স্পেস' },
        category_id: 'cat_commercial',
        seller_id: 'des_003',
        seller: { business_name: 'WorkSpace Innovators', business_name_bn: 'ওয়ার্কস্পেস ইনোভেটরস' },
        brand: 'Corporate',
        description: 'Efficient layout planning for modern office environments.',
        description_bn: 'আধুনিক অফিস পরিবেশের জন্য দক্ষ লেআউট পরিকল্পনা।'
    },
    {
        id: 'dsn_005',
        title: 'Garden & Landscape Design',
        title_bn: 'গার্ডেন ও ল্যান্ডস্কেপ ডিজাইন',
        base_price: 45000,
        images: ['https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&h=600&fit=crop'],
        rating: 4.6,
        category: { name: 'Landscape Design', name_bn: 'ল্যান্ডস্কেপ ডিজাইন' },
        category_id: 'cat_landscape',
        seller_id: 'des_004',
        seller: { business_name: 'Green Thumb Designs', business_name_bn: 'গ্রিন থাম্ব ডিজাইনস' },
        brand: 'Eco-Friendly',
        description: 'Sustainable landscape architecture for rooftops and yards.',
        description_bn: 'ছাদ এবং উঠানের জন্য টেকসই ল্যান্ডস্কেপ আর্কিটেকচার।'
    },
    {
        id: 'dsn_006',
        title: '3D Elevation Rendering',
        title_bn: 'থ্রিডি এলিভেশন রেন্ডারিং',
        base_price: 15000,
        images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop'],
        rating: 4.9,
        category: { name: 'Architectural Design', name_bn: 'আর্কিটেকচারাল ডিজাইন' },
        category_id: 'cat_architectural',
        seller_id: 'des_002',
        seller: { business_name: 'SafeBuild Engineers', business_name_bn: 'সেফবিল্ড ইঞ্জিনিয়ার্স' },
        brand: 'Visuals',
        description: 'High-quality 3D exterior views for your dream home.',
        description_bn: 'আপনার স্বপ্নের বাড়ির জন্য উচ্চ মানের থ্রিডি এক্সটেরিয়র ভিউ।'
    }
];

export const featuredProjects = [
    {
        id: 1,
        title: "Gulshan Luxury Apartment",
        title_bn: "গুলশান লাক্সারি অ্যাপার্টমেন্ট",
        category: "Interior",
        category_bn: "ইন্টেরিয়র",
        image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&h=400&fit=crop"
    },
    {
        id: 2,
        title: "Bashundhara Duplex Villa",
        title_bn: "বসুন্ধরা ডুপ্লেক্স ভিলা",
        category: "Architecture",
        category_bn: "আর্কিটেকচার",
        image: "https://images.unsplash.com/photo-1600596542815-27b88e9950e9?w=600&h=400&fit=crop"
    },
    {
        id: 3,
        title: "Dhanmondi Commercial Complex",
        title_bn: "ধানমন্ডি কমাশিয়াল কমপ্লেক্স",
        category: "Structural",
        category_bn: "স্ট্রাকচারাল",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop"
    },
    {
        id: 4,
        title: "Banani Rooftop Garden",
        title_bn: "বনানি রুফটপ গার্ডেন",
        category: "Landscape",
        category_bn: "ল্যান্ডস্কেপ",
        image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&h=400&fit=crop"
    }
];

export const clientReviews = [
    {
        id: 1,
        name: "Rahim Ahmed",
        name_bn: "রহিম আহমেদ",
        role: "Homeowner",
        role_bn: "বাড়ির মালিক",
        quote: "The structural safety assessment gave us peace of mind. Highly professional team.",
        quote_bn: "স্ট্রাকচারাল সেফটি অ্যাসেসমেন্ট আমাদের মানসিক শান্তি দিয়েছে। অত্যন্ত পেশাদার দল।",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
    },
    {
        id: 2,
        name: "Fatima Begum",
        name_bn: "ফাতিমা বেগম",
        role: "Interior Client",
        role_bn: "ইন্টেরিয়র ক্লায়েন্ট",
        quote: "Transformed our apartment into a modern sanctuary. The design process was seamless.",
        quote_bn: "আমাদের অ্যাপার্টমেন্টকে একটি আধুনিক অভয়ারণ্যে রূপান্তর করেছে। ডিজাইন প্রক্রিয়া ছিল নির্বিঘ্ন।",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
    },
    {
        id: 3,
        name: "Tanvir Hasan",
        name_bn: "তানভীর হাসান",
        role: "Developer",
        role_bn: "ডেভেলপার",
        quote: "Innovative architectural designs that sell. We've worked with them on 3 projects now.",
        quote_bn: "উদ্ভাবনী আর্কিটেকচারাল ডিজাইন যা সহজে সমাদৃত হয়। আমরা এখন পর্যন্ত তাদের সাথে ৩টি প্রকল্পে কাজ করেছি।",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"
    }
];
