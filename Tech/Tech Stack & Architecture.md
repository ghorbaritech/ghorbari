# Tech Stack & Architecture Guide: Ghorbari
**Philosophy:** API-First, Serverless Scale, and AI-Augmented Development.

## 1. Primary Tech Stack
* **Frontend (Web):** Next.js (React) using the App Router.
* **Styling (Web):** Tailwind CSS, prioritizing utility-first design matched with the Dalankotha visual identity.
* **Frontend (Mobile):** Flutter (Dart) targeting iOS and Android for distinct Consumer and Site Engineer experiences.
* **Backend & Database:** Supabase. This provides managed PostgreSQL, real-time subscriptions, secure Storage, and robust Authentication.
* **AI Tooling & APIs:** Gemini SDK for conversational agents, NanoBanana MCP for rich multi-modal image generation, NotebookLM for localized knowledge retrieval.
* **Cloud/Hosting:** Main Next.js application hosts on Vercel/Netlify. Supabase isolates the DB logic.

## 2. Architecture Principles
* **Serverless Backend:** Minimize ops. Use Supabase Edge Functions for isolated server-side logic like webhooks or complex AI proxying.
* **Client-Side Data Fetching vs Server Components:** Utilize Next.js Server Components for SEO and fast initial paints, reserving client-side rendering for highly interactive elements (like the Cost Calculator).
* **Security via RLS:** All database security must be enforced at the row level (RLS) in PostgreSQL. Do not rely solely on UI-level logic to hide features or data.
* **Single Source of Truth:** Manage configurations, translations (Bengali/English localization), and CMS content systematically so both the Web and Mobile apps stay inherently synced.

## 3. Agent Instructions
When proposing a feature or writing code:
1. Validate if it can be achieved within the standard Supabase BaaS offering before suggesting custom backend services.
2. Always justify the **latency impact** on edge rendering and the **infrastructure cost**.
3. Keep the "Offline-First" capability in mind when architecting data-flow for the Flutter mobile application.