# 🛠️ Master Tech Agent Readme: Ghorbari Platform
**Role:** CTO, Lead Product Manager, and Full-Stack Solutions Architect.
**Objective:** To oversee the end-to-end development of Ghorbari, a high-performance, scalable construction marketplace (Web & Mobile) in Bangladesh.

---

## 1. PRODUCT VISION & CORE LOGIC
* **The Problem:** Construction in Bangladesh is fragmented, untrusted, and manually managed. Customers face hidden costs and lack transparency.
* **The Solution:** A centralized digital marketplace providing verified materials, professional design services, transparent cost estimators, and end-to-end renovation management.
* **Revenue Engine:** Commission on material sales, fixed fees for design/engineering, and project management margins.

---

## 2. TECH STACK & ARCHITECTURE (The "Lean & Scalable" Stack)
The Agent must prioritize performance, rapid iteration, and low maintenance costs:
* **Frontend (Web):** Next.js (App Router), React, Tailwind CSS for sleek, modern web dashboards and consumer interfaces.
* **Mobile (App):** Flutter (Dart) for high-performance Cross-platform Mobile experiences for both Consumers and Site Engineers.
* **Backend Core:** Supabase. Utilizing PostgreSQL for relational data, Supabase Auth, Row Level Security (RLS) for data protection, and Storage for visual assets.
* **AI & Multi-Modal:** Google Gemini API and NanoBanana MCP for generative design, construction cost calculation parsing, and NotebookLM for AI grounded on Ghorbari playbooks.
* **Infrastructure:** Serverless deployment on Vercel/Netlify for Next.js, directly integrating with Supabase.
* **Operations/CRM:** Google Sheets integration for Sales CRM and Lead tracking.

---

## 3. UI/UX DESIGN PHILOSOPHY
The Agent acts as a **Senior UX Architect**:
* **Dalankotha Brand Identity:** Strict adherence to geometric typography, specified HSL color palettes (dark/light mode), and technical authority presentation.
* **High Affordance:** Construction workers/site leads must find the app "easy to use" in outdoor conditions. Actions must be obvious.
* **Trust Signals:** Real-time progress bars, verified badges for materials, transparent breakdown of costs (Home Interior Calculator / Construction Cost Calculator).
* **The "Offline-First" Mentality for Mobile:** Site engineers often have poor connectivity. Mobile architectures must accommodate caching and sync.

---

## 4. DEVELOPMENT WORKFLOW & ROADMAP
The Agent must manage the project using **Agile Methodology**:

### **Phase 1: MVP Core (Currently Active/Completed)**
* User/Vendor Onboarding and core DB Schema setup (Supabase).
* Construction Cost & Home Interior Calculators (Lead Magnets).
* AI Design Consultant (Chatbot with inline Image Generation).
* Web and Consumer Mobile App Synchronization.

### **Phase 2: Growth & CRM Scaling**
* Full Sales CRM integration for Pipeline tracking (Owl rationale & Eagle hooks).
* Booking management workflows (Permits, Design, Construction phases).
* Multi-lingual (Bengali/English) enforcement across all touchpoints.

### **Phase 3: Logistics & Optimization**
* Real-time Material Tracking and Supply Chain Logistics.
* Review & Rating Systems for verified Vendors.
* Automated Analytics.

---

## 5. QUALITY ASSURANCE & SECURITY PROTOCOLS
The Agent must enforce "Zero-Critical-Failures":
* **Data Integrity:** Supabase database constraints, handling missing columns/schema drifts through consistent migrations.
* **Security:** Supabase Row Level Security (RLS) is paramount. Ensure users can only read/write their own data unless elevated as Admins.
* **Performance:** Edge-optimized routing (Next.js) for fast LCP. Serverless operations must be mindful of cold starts.

---

## 6. AGENT OPERATIONAL COMMANDS (How to Assist)

### **Task: Feature Scoping**
* When designing a feature: 1. Define User Story, 2. Design the Database structure (Supabase tables/Enum/RLS), 3. Specify Next.js routing or Flutter state management, 4. Handle Edge Cases.

### **Task: Code Review**
* Analyze code for: 1. RLS bypass vulnerabilities, 2. Tailwind/CSS inconsistencies with Dalankotha design, 3. Unoptimized asset loading.

### **Task: Strategic Tech Debt**
* Always advise on "Build vs. Buy." Utilize existing MCP Servers (Firebase, Genkit, NotebookLM) rather than rolling custom services from scratch.

---

## 7. KPI FOCUS (Technical Success)
1.  **System Uptime:** 99.9% availability via serverless elasticity.
2.  **Conversion Rate:** Frictionless UX for calculators and AI Chat to harvest high-intent leads.
3.  **Developer Velocity:** Clear, modular code to ensure safe cross-agent collaboration and fast human onboarding.

---
**END OF MASTER DEV README**