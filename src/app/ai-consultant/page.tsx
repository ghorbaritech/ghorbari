import { createClient } from "@/utils/supabase/server";
import ChatInterface from "@/components/ai/ChatInterface";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
    title: "Dalankotha AI Construction Consultant",
    description: "Your intelligent assistant for all things construction, design, and renovation in Bangladesh.",
};

export default async function AIConsultantPage() {
    const supabase = await createClient();

    // Attempt to get the user — but do NOT redirect if not logged in.
    // The AI Consultant is a lead-generation tool open to all guests.
    // Session persistence only works for authenticated users.
    const { data: { user } } = await supabase.auth.getUser();

    let profile: { full_name: string | null; avatar_url: string | null } | null = null;
    if (user) {
        const { data } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", user.id)
            .single();
        profile = data;
    }

    return (
        <div className="flex flex-col h-screen bg-neutral-50 overflow-hidden">
            <Navbar />

            <main className="flex-1 flex flex-col relative max-w-5xl mx-auto w-full min-h-0 overflow-hidden">
                {/* Header */}
                <div className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between shadow-sm z-10 flex-shrink-0">
                    <div>
                        <h1 className="text-xl font-black text-primary-950 flex items-center gap-2">
                            <span className="w-2 h-6 bg-primary-950 rounded-full inline-block" />
                            Dalankotha AI Consultant
                        </h1>
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mt-1">
                            Construction · Interior Design · Renovation
                        </p>
                    </div>

                    <div className="hidden sm:flex items-center gap-3">
                        {user ? (
                            <>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-neutral-900">{profile?.full_name || "User"}</p>
                                    <p className="text-[10px] font-bold text-accent-600 uppercase tracking-widest">Active Session</p>
                                </div>
                                {profile?.avatar_url ? (
                                    <img
                                        src={profile.avatar_url}
                                        alt="Profile"
                                        className="w-10 h-10 rounded-full border-2 border-neutral-200"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-900 font-bold border-2 border-primary-200">
                                        {profile?.full_name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                )}
                            </>
                        ) : (
                            <a
                                href="/login?next=/ai-consultant"
                                className="text-xs font-bold text-primary-700 border border-primary-200 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-xl transition-all"
                            >
                                Sign in to save conversations →
                            </a>
                        )}
                    </div>
                </div>

                {/* Chat Interface */}
                <div className="flex-1 flex flex-col overflow-hidden bg-white shadow-sm border-x border-neutral-200">
                    <ChatInterface
                        userId={user?.id ?? null}
                        userName={profile?.full_name || "Guest"}
                    />
                </div>
            </main>
        </div>
    );
}
