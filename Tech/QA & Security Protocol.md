# QA & Security Protocol: Ghorbari
**Goal:** Zero-Critical-Bugs in Production and Data Sovereignty.

## 1. Testing Tiers
* **Agentic Verification:** Automatically run checks using provided debugging scripts (e.g., `check-db.js`, `debug_cms.js`) to validate backend schema integrity.
* **Logic Unit Tests:** Focus verification on high-value business logic: Cost calculations, multi-currency conversions (if applicable), and CRM data structure mapping.
* **Cross-Platform Parity:** Ensure the Consumer Flutter app UI explicitly matches the logic and design presented on the Next.js Web front.

## 2. Security Guardrails
* **Row Level Security (RLS):** This is the foundation of Ghorbari's data security. No public DB access without strict, validated Supabase RLS policies. Admins require elevated roles.
* **Environment Secrets:** Never hard-code API keys (Gemini, Supabase, NanoBanana). Always use `.env.local` or respective secure environment managers.
* **Data Validation:** Validate payloads before processing, especially form outputs entering the ecosystem (e.g., Sales CRM entries require strict format constraints and persona mapping).