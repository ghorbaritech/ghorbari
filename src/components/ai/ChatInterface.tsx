"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect, useCallback } from "react";
import {
    Send, ImagePlus, User, Loader2, Bot, Sparkles, X,
    Download, Calendar, Mic, MicOff, Volume2, VolumeX, RefreshCw, AlertCircle
} from "lucide-react";
import dynamic from 'next/dynamic';
import { toast } from "sonner";

const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
    { ssr: false }
);
const ChatPDF = dynamic(
    () => import('./ChatPDF').then(mod => mod.ChatPDF),
    { ssr: false }
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatInterfaceProps {
    userId: string | null;
    userName?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SUGGESTION_PROMPTS = [
    { bn: "আমার ১২০০ sqft বাড়ি বানাতে কত খরচ হবে?", en: "How much to build a 1200 sqft house?" },
    { bn: "আধুনিক মিনিমালিস্ট লিভিং রুমের ডিজাইন দেখাও", en: "Show me a modern minimalist living room design" },
    { bn: "RAJUK অনুমোদনের জন্য কী কাগজপত্র লাগবে?", en: "What documents are needed for RAJUK approval?" },
    { bn: "বাথরুমের জন্য ভালো টাইলস কোনগুলো?", en: "What are good tiles for a bathroom?" },
];

// ─── Helper: Extract plain text from a message ────────────────────────────────

function getMessageText(msg: any): string {
    if (msg.parts?.length) {
        return msg.parts
            .filter((p: any) => p.type === 'text')
            .map((p: any) => p.text as string)
            .join('');
    }
    if (typeof msg.content === 'string') return msg.content;
    return '';
}

// ─── Helper: Extract tool results from a message ──────────────────────────────

function getToolResults(msg: any): { name: string; result: any }[] {
    const results: { name: string; result: any }[] = [];

    // 1. Check parts (AI SDK v4)
    if (msg.parts && Array.isArray(msg.parts)) {
        for (const part of msg.parts) {
            if (part.type === 'tool-invocation') {
                const ti = part.toolInvocation;
                if (ti?.state === 'result') {
                    results.push({ name: ti.toolName, result: ti.result });
                }
            }
        }
    }

    // 2. Check toolInvocations (Standard for useChat)
    if (msg.toolInvocations && Array.isArray(msg.toolInvocations)) {
        for (const ti of msg.toolInvocations) {
            // Only add if not already added from parts
            if ((ti.state === 'result' || ti.result) && !results.some(r => r.name === ti.toolName)) {
                results.push({ name: ti.toolName, result: ti.result });
            }
        }
    }

    return results;
}



// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingDots() {
    return (
        <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary-700" />
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl rounded-tl-sm p-4 flex gap-1 items-center">
                <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
        </div>
    );
}

// ─── Design Image Result ──────────────────────────────────────────────────────

function DesignImageCard({ url, isLoading }: { url?: string; isLoading?: boolean }) {
    if (isLoading) {
        return (
            <div className="mt-4 pt-4 border-t border-neutral-200/40">
                <div className="flex items-center gap-3 text-sm font-semibold text-primary-600 bg-primary-50 p-3 rounded-xl border border-primary-100">
                    <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                    <span>Creating your design visualization... (15–25 seconds)</span>
                </div>
            </div>
        );
    }
    if (!url) return null;
    return (
        <div className="mt-4 pt-4 border-t border-neutral-200/40">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-600 flex items-center gap-2 mb-3">
                <Sparkles className="w-3.5 h-3.5" /> DESIGN GENERATED
            </p>
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-neutral-200 shadow-xl bg-neutral-100 group">
                <img
                    src={url}
                    alt="Generated Design"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                <a
                    href={url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-neutral-800 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                    <Download className="w-3 h-3" /> Save
                </a>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ChatInterface({ userId, userName = "User" }: ChatInterfaceProps) {
    const [attachedImage, setAttachedImage] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isTTSEnabled, setIsTTSEnabled] = useState(false);
    const [lastReadMessageId, setLastReadMessageId] = useState<string | null>(null);
    const [language, setLanguage] = useState<'bn' | 'en'>('bn');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [input, setInput] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { messages, sendMessage, status, error, reload } = useChat({
        api: "/api/chat",
        body: { userId, sessionId, language, mode: 'full' },
        maxSteps: 8,
        initialMessages: [
            {
                id: 'init-1',
                role: 'assistant',
                content: language === 'bn'
                    ? 'আস্সালামু আলাইকুম! আমি দালানকোঠা AI কনসাল্ট্যান্ট। নির্মাণ, ডিজাইন বা রিনোভেশন নিয়ে যেকোনো প্রশ্ন করুন — ছবি শেয়ার করলে রুম রিডিজাইনও করতে পারি।'
                    : 'Assalamu Alaikum! I am the Dalankotha AI Consultant. Ask me anything about construction, design, or renovation — you can also share a photo and I\'ll redesign your room.',
            }
        ],
        onResponse: (response: Response) => {
            const serverSessionId = response.headers.get('x-ai-session-id');
            if (serverSessionId && !sessionId) setSessionId(serverSessionId);
        },
        onError: () => {
            toast.error("Connection lost. Please try again.");
        },
    } as any);

    const isTyping = status === 'streaming' || status === 'submitted';
    const hasError = !!error || status === 'error';

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages, isTyping]);

    // TTS for assistant messages
    useEffect(() => {
        if (!isTTSEnabled || isTyping) return;
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.role !== 'assistant' || lastMessage.id === lastReadMessageId) return;
        const textContent = getMessageText(lastMessage);
        if (textContent) {
            const utterance = new SpeechSynthesisUtterance(textContent);
            utterance.lang = textContent.match(/[\u0980-\u09FF]/) ? 'bn-BD' : 'en-US';
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        }
        setLastReadMessageId(lastMessage.id);
    }, [messages, isTTSEnabled, lastReadMessageId, isTyping]);

    const toggleVoiceInput = useCallback(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            toast.error("Speech recognition requires Chrome or Safari.");
            return;
        }
        if (isRecording) {
            setIsRecording(false);
            (window as any)._recognition?.stop();
            return;
        }
        setIsRecording(true);
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language === 'en' ? 'en-US' : 'bn-BD';
        recognition.onresult = (event: any) => {
            setInput(prev => prev + (prev ? " " : "") + event.results[0][0].transcript);
            setIsRecording(false);
        };
        recognition.onerror = () => { setIsRecording(false); toast.error("Voice recognition failed."); };
        recognition.onend = () => setIsRecording(false);
        (window as any)._recognition = recognition;
        recognition.start();
    }, [isRecording, language]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error("Image must be smaller than 5MB"); return; }
        setAttachedImage(file);
        setImagePreviewUrl(URL.createObjectURL(file));
    };

    const removeImage = () => {
        setAttachedImage(null);
        if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
        setImagePreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const onSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const text = input.trim();
        if (!text && !attachedImage) return;

        if (attachedImage) {
            const reader = new FileReader();
            reader.onload = () => {
                sendMessage({
                    role: 'user',
                    content: text || 'Please analyze this image.',
                    experimental_attachments: [{
                        name: attachedImage.name,
                        contentType: attachedImage.type as any,
                        url: reader.result as string,
                    }],
                } as any);
            };
            reader.readAsDataURL(attachedImage);
        } else {
            sendMessage({ role: 'user', content: text } as any);
        }
        setInput('');
        removeImage();
    };

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col h-full bg-white relative font-sans">

            {/* Top action bar */}
            <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
                <button
                    onClick={() => setLanguage(l => l === 'bn' ? 'en' : 'bn')}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all shadow-sm ${language === 'bn'
                        ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                        : 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
                    }`}
                >
                    {language === 'bn' ? '🇧🇩 বাংলা' : '🇬🇧 English'}
                </button>
                <button
                    onClick={() => {
                        if (isTTSEnabled) window.speechSynthesis.cancel();
                        setIsTTSEnabled(!isTTSEnabled);
                    }}
                    className={`p-2 rounded-lg border transition-all shadow-sm ${isTTSEnabled ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-neutral-200 text-neutral-400'}`}
                    title={isTTSEnabled ? "Disable AI Voice" : "Enable AI Voice"}
                >
                    {isTTSEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
            </div>

            {/* Message List */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth">

                {/* Empty state / Suggestion prompts */}
                {messages.length <= 1 && (
                    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4">
                        <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 border border-primary-100 shadow-sm">
                            <Sparkles className="w-8 h-8 text-primary-600" />
                        </div>
                        <h2 className="text-2xl font-black text-neutral-900 mb-2">
                            {language === 'bn' ? 'আজকে কীভাবে সাহায্য করতে পারি?' : 'How can I help you build today?'}
                        </h2>
                        <p className="text-neutral-500 max-w-md mx-auto text-sm leading-relaxed mb-8">
                            {language === 'bn'
                                ? 'খরচ অনুমান, ডিজাইন ভিজ্যুয়ালাইজেশন, উপকরণ পরামর্শ বা অনুমোদন প্রক্রিয়া — যেকোনো প্রশ্ন করুন।'
                                : 'Cost estimates, design visuals, material advice, or approval guidance — ask anything.'
                            }
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                            {SUGGESTION_PROMPTS.map((p, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInput(language === 'bn' ? p.bn : p.en)}
                                    className="text-left px-4 py-3 text-xs font-semibold text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-xl hover:bg-white hover:border-primary-300 hover:text-primary-700 hover:shadow-sm transition-all"
                                >
                                    {language === 'bn' ? p.bn : p.en}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Message Bubbles */}
                {messages.map((m: any) => {
                    const textContent = getMessageText(m);
                    const toolResults = getToolResults(m);
                    const designResult = toolResults.find(t =>
                        t.name?.includes('design') || t.name?.includes('visual') || t.result?.url
                    );
                    const costResult = toolResults.find(t =>
                        t.name?.includes('cost') || t.name?.includes('estimate')
                    );

                    // Is the AI currently generating an image for this message?
                    const isGeneratingImage = isTyping &&
                        m.role === 'assistant' &&
                        m === messages[messages.length - 1] &&
                        (
                            m.parts?.some((p: any) =>
                                p.type === 'tool-invocation' &&
                                p.toolInvocation?.toolName?.includes('design') &&
                                p.toolInvocation?.state !== 'result'
                            ) ||
                            m.toolInvocations?.some((ti: any) =>
                                ti.toolName?.includes('design') &&
                                ti.state !== 'result'
                            )
                        );

                    return (
                        <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {m.role !== 'user' && (
                                <div className="w-8 h-8 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center flex-shrink-0 mt-1">
                                    <Bot className="w-4 h-4 text-primary-700" />
                                </div>
                            )}

                            <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 ${m.role === 'user'
                                ? 'bg-neutral-900 text-white rounded-tr-sm'
                                : 'bg-neutral-50 text-neutral-800 border border-neutral-200 rounded-tl-sm'
                            }`}>

                                {/* User attached image */}
                                {m.role === 'user' && m.experimental_attachments?.map((att: any, i: number) => (
                                    att.contentType?.startsWith('image/') && (
                                        <img
                                            key={i}
                                            src={att.url}
                                            alt="Uploaded"
                                            className="max-w-[200px] max-h-[180px] rounded-lg mb-2 border border-neutral-700/40 object-cover"
                                        />
                                    )
                                ))}

                                {/* Text content */}
                                {textContent && (
                                    <span className="whitespace-pre-wrap text-sm leading-relaxed">
                                        {textContent}
                                    </span>
                                )}

                                {/* Cost estimate result card */}
                                {costResult?.result?.success && (
                                    <div className="mt-4 pt-4 border-t border-neutral-200/40">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-600 mb-2">COST ESTIMATE</p>
                                        <div className="bg-white rounded-xl border border-neutral-200 p-3 space-y-1.5">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-500">Area</span>
                                                <span className="font-bold">{costResult.result.area_sqft} sqft</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-500">Rate / sqft</span>
                                                <span className="font-bold">{costResult.result.rate_per_sqft}</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t border-neutral-100">
                                                <span className="text-neutral-600 font-semibold">Estimate</span>
                                                <span className="text-lg font-black text-primary-700">{costResult.result.estimated_total_lac}</span>
                                            </div>
                                        </div>
                                        {costResult.result.note && (
                                            <p className="text-[10px] text-neutral-400 mt-2 italic leading-tight">{costResult.result.note}</p>
                                        )}
                                    </div>
                                )}

                                {/* Design image (loading or loaded) */}
                                <DesignImageCard
                                    url={designResult?.result?.url}
                                    isLoading={isGeneratingImage && !designResult?.result?.url}
                                />

                                {/* Error from design tool */}
                                {designResult?.result?.success === false && (
                                    <div className="mt-4 pt-4 border-t border-neutral-200/40">
                                        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl p-3">
                                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                            <span>Design generation failed. Please try again with a different description.</span>
                                        </div>
                                    </div>
                                )}

                                {/* Action buttons */}
                                {m.role === 'assistant' && m.id !== 'init-1' && !isTyping && (
                                    <div className="mt-4 pt-3 border-t border-neutral-200/30 space-y-2">
                                        <p className="text-[10px] text-neutral-400 italic leading-relaxed">
                                            {language === 'bn'
                                                ? 'Dalankotha AI টি সাধারণ তথ্য দেয়। পেশাদার পরামর্শের জন্য আমাদের বিশেষজ্ঞদের সাথে কথা বলুন।'
                                                : 'Dalankotha AI provides general guidance. Speak to our professionals for formal quotes and structural decisions.'
                                            }
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <a
                                                href="/services"
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-950 text-white text-[10px] font-bold rounded-lg hover:bg-black transition-all"
                                            >
                                                <Calendar className="w-3 h-3" />
                                                {language === 'bn' ? 'পেশাদার বুক করুন' : 'BOOK A PROFESSIONAL'}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {m.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0 mt-1">
                                    <User className="w-4 h-4 text-neutral-600" />
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Typing indicator (global — while AI hasn't started a new message yet) */}
                {isTyping && messages[messages.length - 1]?.role === 'user' && <TypingDots />}

                {/* Error state */}
                {hasError && (
                    <div className="flex justify-center">
                        <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 flex items-center gap-3 text-sm text-red-600 max-w-md">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{language === 'bn' ? 'সংযোগ সমস্যা হয়েছে।' : 'Connection error.'}</span>
                            <button
                                onClick={() => reload()}
                                className="flex items-center gap-1 text-xs font-bold text-red-700 underline hover:no-underline ml-1"
                            >
                                <RefreshCw className="w-3 h-3" />
                                {language === 'bn' ? 'আবার চেষ্টা' : 'Retry'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Bottom spacer */}
                <div className="h-52 shrink-0" aria-hidden="true" />
                <div ref={messagesEndRef} />
            </div>

            {/* Floating Input Bar */}
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-8 bg-gradient-to-t from-white via-white to-transparent z-20 pointer-events-none">
                <form
                    onSubmit={onSubmit}
                    className="max-w-3xl mx-auto relative bg-white border border-neutral-200 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-all focus-within:ring-4 focus-within:ring-primary-600/10 focus-within:border-primary-500/40 mb-2 pointer-events-auto"
                >
                    {/* Image Preview */}
                    {imagePreviewUrl && (
                        <div className="px-3 pt-3 pb-1 border-b border-neutral-100">
                            <div className="relative inline-block border border-neutral-200 rounded-lg p-1 bg-neutral-50">
                                <img src={imagePreviewUrl} alt="Preview" className="h-16 w-auto rounded object-cover" />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute -top-2 -right-2 bg-neutral-900 text-white rounded-full p-1 shadow-sm hover:bg-red-500 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex items-end px-2 py-2">
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 text-neutral-400 hover:text-primary-600 hover:bg-neutral-100 rounded-xl transition-colors mb-0.5"
                            title="Attach a room photo"
                        >
                            <ImagePlus className="w-5 h-5" />
                        </button>

                        <button
                            type="button"
                            onClick={toggleVoiceInput}
                            className={`p-3 rounded-xl mb-0.5 transition-all ${isRecording ? 'bg-red-50 text-red-600 animate-pulse' : 'text-neutral-400 hover:text-primary-600 hover:bg-neutral-100'}`}
                        >
                            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </button>

                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={
                                language === 'bn'
                                    ? "নির্মাণ, ডিজাইন বা খরচ সম্পর্কে জিজ্ঞেস করুন..."
                                    : "Ask about materials, costs, or describe a space to design..."
                            }
                            className="flex-1 max-h-40 min-h-[48px] bg-transparent resize-none py-3.5 px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    if (input.trim() || attachedImage) onSubmit();
                                }
                            }}
                        />

                        <button
                            type="submit"
                            disabled={(!input.trim() && !attachedImage) || isTyping}
                            className="p-3 bg-neutral-950 text-white rounded-xl mb-0.5 ml-2 hover:bg-primary-600 hover:shadow-lg disabled:opacity-50 disabled:hover:bg-neutral-950 disabled:cursor-not-allowed transition-all"
                        >
                            {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
