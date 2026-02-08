export const designCategories = [
    { id: 'cat_structural', name: 'Structural Design' },
    { id: 'cat_architectural', name: 'Architectural Design' },
    { id: 'cat_interior', name: 'Interior Design' },
    { id: 'cat_landscape', name: 'Landscape Design' },
    { id: 'cat_commercial', name: 'Commercial Spaces' },
];

export const designServices = [
    {
        id: 'dsn_001',
        title: 'Complete Home Interior Package',
        base_price: 150000,
        images: ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=600&fit=crop'],
        rating: 4.9,
        category: { name: 'Interior Design' },
        category_id: 'cat_interior',
        seller_id: 'des_001',
        seller: { business_name: 'Urban Living Studios' },
        brand: 'Premium',
        description: 'End-to-end interior design for 3-bedroom apartments.'
    },
    {
        id: 'dsn_002',
        title: 'Structural Safety Assessment',
        base_price: 25000,
        images: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop'],
        rating: 5.0,
        category: { name: 'Structural Design' },
        category_id: 'cat_structural',
        seller_id: 'des_002',
        seller: { business_name: 'SafeBuild Engineers' },
        brand: 'Certified',
        description: 'Detailed structural integrity assessment for existing buildings.'
    },
    {
        id: 'dsn_003',
        title: 'Modern Villa Architecture',
        base_price: 200000,
        images: ['https://images.unsplash.com/photo-1600596542815-27b88e9950e9?w=800&h=600&fit=crop'],
        rating: 4.8,
        category: { name: 'Architectural Design' },
        category_id: 'cat_architectural',
        seller_id: 'des_001',
        seller: { business_name: 'Urban Living Studios' },
        brand: 'Luxury',
        description: 'Comprehensive architectural planning for duplex villas.'
    },
    {
        id: 'dsn_004',
        title: 'Office Space Planning',
        base_price: 80000,
        images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'],
        rating: 4.7,
        category: { name: 'Commercial Spaces' },
        category_id: 'cat_commercial',
        seller_id: 'des_003',
        seller: { business_name: 'WorkSpace Innovators' },
        brand: 'Corporate',
        description: 'Efficient layout planning for modern office environments.'
    },
    {
        id: 'dsn_005',
        title: 'Garden & Landscape Design',
        base_price: 45000,
        images: ['https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&h=600&fit=crop'],
        rating: 4.6,
        category: { name: 'Landscape Design' },
        category_id: 'cat_landscape',
        seller_id: 'des_004',
        seller: { business_name: 'Green Thumb Designs' },
        brand: 'Eco-Friendly',
        description: 'Sustainable landscape architecture for rooftops and yards.'
    },
    {
        id: 'dsn_006',
        title: '3D Elevation Rendering',
        base_price: 15000,
        images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop'],
        rating: 4.9,
        category: { name: 'Architectural Design' },
        category_id: 'cat_architectural',
        seller_id: 'des_002',
        seller: { business_name: 'SafeBuild Engineers' },
        brand: 'Visuals',
        description: 'High-quality 3D exterior views for your dream home.'
    }
];

export const featuredProjects = [
    {
        id: 1,
        title: "Gulshan Luxury Apartment",
        category: "Interior",
        image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&h=400&fit=crop"
    },
    {
        id: 2,
        title: "Bashundhara Duplex Villa",
        category: "Architecture",
        image: "https://images.unsplash.com/photo-1600596542815-27b88e9950e9?w=600&h=400&fit=crop"
    },
    {
        id: 3,
        title: "Dhanmondi Commercial Complex",
        category: "Structural",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop"
    },
    {
        id: 4,
        title: "Banani Rooftop Garden",
        category: "Landscape",
        image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&h=400&fit=crop"
    }
];

export const clientReviews = [
    {
        id: 1,
        name: "Rahim Ahmed",
        role: "Homeowner",
        quote: "The structural safety assessment gave us peace of mind. Highly professional team.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
    },
    {
        id: 2,
        name: "Fatima Begum",
        role: "Interior Client",
        quote: "Transformed our apartment into a modern sanctuary. The design process was seamless.",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
    },
    {
        id: 3,
        name: "Tanvir Hasan",
        role: "Developer",
        quote: "Innovative architectural designs that sell. We've worked with them on 3 projects now.",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"
    }
];
