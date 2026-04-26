/**
 * 📚 Dalankotha Grounded Knowledge Base — v2.0
 * Expanded from 4 → 8 categories with richer, actionable facts.
 * Used to ground the AI's responses and prevent hallucination.
 */

export const KNOWLEDGE_BASE = [
    {
        category: "Construction Costs — Bangladesh 2025–2026",
        facts: [
            "Gray structure only (RCC frame, brick wall, plaster): ৳2,200–2,800/sqft in Dhaka.",
            "Standard full build (gray structure + tiles + doors + plumbing + electrical): ৳2,800–3,500/sqft.",
            "Premium full build (imported tiles, branded fixtures, false ceiling, concealed wiring): ৳3,500–4,500/sqft.",
            "Luxury/high-end finish (marble, smart home, premium Italian fittings): ৳4,500–6,500/sqft.",
            "Roof casting (slab) per sqft: ৳350–500 depending on slab thickness and rebar grade.",
            "Boundary wall construction: ৳800–1,200/running ft depending on height.",
            "Material price fluctuations: Cement and rod prices change monthly. Always verify current market rates before finalizing a budget.",
            "A standard 1,200 sqft apartment's gray structure typically takes 4–6 months to complete.",
            "Labor costs in Dhaka: Rod bending ৳8,000–12,000/ton, Mason work ৳600–900/day.",
        ]
    },
    {
        category: "Interior Design Costs — Bangladesh 2025–2026",
        facts: [
            "Basic interior (local materials, standard furniture): ৳600–900/sqft.",
            "Standard interior (mix of imported and local, mid-range furniture): ৳900–1,400/sqft.",
            "Premium interior (imported materials, branded furniture, full false ceiling, smart lighting): ৳1,400–2,200/sqft.",
            "Modular kitchen: ৳1.5–3.5 lakh for a standard 8–10 ft kitchen.",
            "Full bedroom interior (furniture + flooring + paint + lighting): ৳80,000–2,50,000 depending on size and finish.",
            "Living room interior (TV unit + sofa set + lighting + flooring): ৳1.5–5 lakh.",
            "False ceiling (gypsum board): ৳60–120/sqft for design and installation.",
            "Wall painting: ৳15–25/sqft for standard emulsion, ৳30–60/sqft for texture paint.",
        ]
    },
    {
        category: "Material Standards & Bangladesh Brands",
        facts: [
            "RCC (Reinforced Cement Concrete) is essential for structural beams, columns, slabs, and foundations.",
            "PCC (Plain Cement Concrete) is used for non-structural work: plinth filling, road surfaces, compound floors.",
            "OPC (Ordinary Portland Cement) — best for heavy structural components requiring high early strength.",
            "PCC cement brands in Bangladesh: Shah Cement, Crown Cement, Seven Rings, Lafarge (Surma).",
            "TMT rod grades: 500W and 500D are recommended for earthquake-resistant construction in Bangladesh.",
            "Top rod brands: BSRM, KSRM, Alam Steel, RML.",
            "Brick quality: First-class bricks should ring clearly when struck and absorb less than 20% of their weight in water.",
            "Sand for construction: Sharp sand for concrete work, fine sand for plaster.",
            "Tiles: Johnson, RAK, Somany, and Niro are popular brands in Bangladesh.",
            "Avoid using overburnt or underburnt bricks — they weaken masonry walls significantly.",
        ]
    },
    {
        category: "Dalankotha Services & Booking Process",
        facts: [
            "Dalankotha offers: Structural & Architectural Design, Building Permit Approval, Interior Design, Construction Supervision, and Material Procurement.",
            "How to book: Visit /services, choose a service, fill the booking form with project details (area, location, type), and submit. Our team contacts within 24 hours.",
            "Design packages: Available for full apartment interior, specific rooms (bedroom, kitchen, living room), and exterior facade.",
            "Site visit: Dalankotha engineers visit the site within 2–3 working days of booking confirmation.",
            "Payment: Advance payment (30–50%) is required to start a project; balance upon milestone completion.",
            "Project management: Dalankotha's app allows tracking construction milestones in real time.",
            "AI Consultant is a free pre-consultation service. For formal quotes, book a professional through /services.",
            "Materials marketplace: Verified vendors sell cement, rod, tiles, bricks, and fixtures through Dalankotha — ensuring fair pricing and quality guarantee.",
        ]
    },
    {
        category: "Legal & Approval — RAJUK, CDA, UDA",
        facts: [
            "Any building in Dhaka requires RAJUK (Rajdhani Unnayan Kartripakkha) approved building plan before construction begins.",
            "For Chittagong (Chattogram): CDA (Chittagong Development Authority) approval is required.",
            "For other cities: UDA (Urban Development Authority) or the respective municipality.",
            "FAR (Floor Area Ratio): In Dhaka, FAR varies by zone (residential, commercial, mixed use). Maximum floor area is calculated as FAR × plot area.",
            "Ground coverage: Typically 60% of plot area maximum for residential in Dhaka.",
            "Setbacks: Front setback minimum 1.5m, rear 1.5m, side varies by plot width.",
            "Building permit documents required: Land ownership documents (deed/khatiyan), survey/site plan, architectural drawings, structural drawings, engineer NOC.",
            "RAJUK approval typically takes 3–6 months; Dalankotha assists with full documentation.",
            "Unauthorized construction risks: RAJUK regularly demolishes non-approved structures. Do not start without approval.",
            "Soil testing is MANDATORY before foundation design — it determines whether pile or raft foundation is needed.",
        ]
    },
    {
        category: "Structural Engineering Basics",
        facts: [
            "Soil bearing capacity determines foundation type: Soft clay → Pile foundation. Hard soil → Raft or isolated footing.",
            "Pile foundation: Required for soft/waterlogged/alluvial soil common in Dhaka and coastal areas.",
            "Raft (mat) foundation: Suitable for medium soil conditions; spreads load across full floor area.",
            "Column spacing: Standard residential column grid is 10–15 ft for 5–6 inch RCC slabs.",
            "Slab thickness: Minimum 4 inches (100mm) for normal residential spans, 5–6 inches for longer spans.",
            "Earthquake zone: Bangladesh is in seismic zone III (moderate-high risk). All new buildings must comply with BNBC 2020 seismic provisions.",
            "Rebar cover: Minimum 40mm concrete cover for columns, 25mm for beams and slabs to prevent corrosion.",
            "Water table in Dhaka: Very high — foundation waterproofing (bituminous coating or crystalline waterproofing) is essential.",
        ]
    },
    {
        category: "Renovation Guide",
        facts: [
            "Renovation phases: Demo → Structural repair (if needed) → Plumbing/electrical → Plastering → Flooring → Painting → Fixtures.",
            "Never break load-bearing columns or beams during renovation without structural engineer approval.",
            "Old wiring replacement: Buildings older than 15 years should have full electrical rewiring for safety.",
            "Plumbing upgrade: Replace all GI pipes with CPVC or PPR pipes — GI corrodes within 10–15 years.",
            "Damp/moisture treatment cost: ৳15,000–50,000 per room depending on severity and treatment type.",
            "Renovation timeline: A standard 1,200 sqft apartment renovation takes 2–4 months.",
            "Common renovation mistakes: Changing floor level without checking beam depth, blocking drainage flow, removing tiles without waterproofing underneath.",
        ]
    },
    {
        category: "Common Customer FAQs",
        facts: [
            "Q: How do I know my contractor is giving me a fair price? → A: Use Dalankotha's transparent cost calculator and compare with market rates. Our verified contractors follow standard rate cards.",
            "Q: Do I need to hire an architect? → A: Yes, for RAJUK submission you legally need a certified architect's drawings. Dalankotha provides this service.",
            "Q: What is the difference between a contractor and a subcontractor? → A: Main contractor manages the whole project and hires subcontractors (masons, electricians, plumbers) for specific trades.",
            "Q: Can I build without RAJUK approval? → A: Legally no — unauthorized buildings face demolition orders. Always get approval first.",
            "Q: How much does building permit approval cost? → A: Government fees vary by plot size and floor area. Typically ৳50,000–3,00,000 total including professional fees.",
            "Q: What is a BOQ? → A: Bill of Quantities — a detailed list of all materials and labor needed for a project with quantities and unit rates. Dalankotha prepares this with every formal quote.",
        ]
    }
];

export const AI_SYSTEM_INSTRUCTIONS = `
## Persona: Trusted Expert Friend (Construction & Design Authority)
Respond in Bengali (বাংলা script) or English based on user's language. Never use transliteration.
Be warm, direct, and action-oriented — like a knowledgeable friend, not a corporate bot.

## Core Conversation Flows

### Cost Inquiry Flow:
1. If area is unknown: ask for it (sqft or katha)
2. Ask location (Dhaka/Chittagong/other) and project type
3. Call estimateConstructionCost tool
4. Show cost breakdown clearly
5. Suggest booking a professional for a formal quote → link to /services

### Design Visual Flow:
1. Ask room type (if not given) and preferred style
2. IMMEDIATELY call generate_visual_design — do NOT describe first
3. After image returns: explain design choices
4. Suggest the relevant Dalankotha design package → link to /services

### Service Inquiry Flow:
1. Identify which service (design / permit / construction / materials)
2. Explain what Dalankotha provides
3. Give the direct booking link
4. Offer to answer follow-up questions

## Guardrails
- Never give legally binding guarantees about timelines or costs
- Never approve structural changes without stating "consult a structural engineer"
- Always end cost estimates with the formal quote CTA
`;
