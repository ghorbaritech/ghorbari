"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { Send, ImagePlus, User, Loader2, Bot, Sparkles, X, Download, Calendar, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import dynamic from 'next/dynamic';
import { toast } from "sonner";

// Dynamically import PDF components to avoid SSR issues
// Version: 1.0.1 - Banner removed
const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
    { ssr: false }
);
const ChatPDF = dynamic(
    () => import('./ChatPDF').then(mod => mod.ChatPDF),
    { ssr: false }
);

interface ChatInterfaceProps {
    userId: string;
    userName?: string;
}

export default function ChatInterface({ userId, userName = "User" }: ChatInterfaceProps) {
    const [isAttachedImage, setIsAttachedImage] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isTTSEnabled, setIsTTSEnabled] = useState(false);
    const [lastReadMessageId, setLastReadMessageId] = useState<string | null>(null);
    const [language, setLanguage] = useState<'bn' | 'en'>('bn'); // Default Bangla
    const [lastSentViaVoice, setLastSentViaVoice] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [input, setInput] = useState("");

    const [sessionId, setSessionId] = useState<string | null>(null);

    const { messages, sendMessage, status, error } = useChat({
        maxSteps: 5,
        // @ts-ignore
        api: "/api/chat",
        body: { userId, sessionId, language },
        initialMessages: [
            {
                id: 'init-1',
                role: 'assistant',
                content: 'আলাইকুম আসসালাম! আমি ঘরবাড়ি এআই কনসাল্ট্যান্ট। আজকে আপনাকে কীভাবে সাহায্য করতে পারি?'
            }
        ],
        onResponse: (response: Response) => {
            const serverSessionId = response.headers.get('x-ai-session-id');
            if (serverSessionId && !sessionId) {
                setSessionId(serverSessionId);
            }
        },
        onFinish: () => {
            // If the last message was sent via voice, auto-speak the response
            if (lastSentViaVoice) {
                setIsTTSEnabled(true);
                setLastSentViaVoice(false);
            }
        },
        onError: (err: any) => {
            console.error("Chat Error:", err);
            toast.error("Connection lost. Please try again.");
            setLastSentViaVoice(false);
        },
    } as any);

    const isTyping = status === 'streaming' || status === 'submitted';

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages]);

    // Text-to-Speech for Assistant Messages
    useEffect(() => {
        if (!isTTSEnabled) return;

        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.role === 'assistant' && lastMessage.id !== lastReadMessageId && !isTyping) {
            // Extract text from parts (v3 UIMessage format)
            const textContent = (lastMessage as any).parts
                ?.filter((p: any) => p.type === 'text')
                ?.map((p: any) => p.text)
                ?.join(' ')
                ?? (lastMessage as any).content ?? '';

            if (textContent) {
                const utterance = new SpeechSynthesisUtterance(textContent);
                utterance.lang = textContent.match(/[\u0980-\u09FF]/) ? 'bn-BD' : 'en-US';
                window.speechSynthesis.speak(utterance);
            }
            setLastReadMessageId(lastMessage.id);
        }
    }, [messages, isTTSEnabled, lastReadMessageId, isTyping]);

    // Debugging tool invocations
    useEffect(() => {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg?.role === 'assistant' && (lastMsg as any).toolInvocations?.length > 0) {
            console.log('[DEBUG] Last Assistant Message Tool Invocations:', (lastMsg as any).toolInvocations);
        }
    }, [messages]);

    const toggleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            toast.error("Speech recognition is not supported in this browser");
            return;
        }

        if (isRecording) {
            setIsRecording(false);
            // @ts-ignore
            window._recognition?.stop();
            return;
        }

        setIsRecording(true);
        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        // Support both Bangla and English
        recognition.lang = language === 'en' ? 'en-US' : 'bn-BD';

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(prev => prev + (prev ? " " : "") + transcript);
            setIsRecording(false);
            // Mark that the user just sent a voice message so we auto-TTS the response
            setLastSentViaVoice(true);
        };

        recognition.onerror = () => {
            setIsRecording(false);
            toast.error("Voice recognition failed. Please try again.");
        };

        recognition.onend = () => setIsRecording(false);

        // @ts-ignore
        window._recognition = recognition;
        recognition.start();
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("Image must be smaller than 5MB");
                return;
            }
            setIsAttachedImage(file);
            setImagePreviewUrl(URL.createObjectURL(file));
        }
    };

    const removeAttachedImage = () => {
        setIsAttachedImage(null);
        if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
        setImagePreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const text = (input || '').trim();
        if (!text && !isAttachedImage) return;

        if (isAttachedImage) {
            // Read the image as a Data URL and pass it as an attachment
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result as string;
                sendMessage({
                    role: 'user',
                    content: text || 'Attached image',
                    experimental_attachments: [
                        {
                            name: isAttachedImage.name,
                            contentType: isAttachedImage.type as any,
                            url: dataUrl,
                        },
                    ],
                } as any);
            };
            reader.readAsDataURL(isAttachedImage);
        } else {
            // Text only — use sendMessage directly
            sendMessage({ role: 'user', content: text } as any);
        }

        setInput('');
        removeAttachedImage();
    };

    return (
        <div className="flex flex-col h-full bg-white relative font-sans">
            {/* Context Actions Header */}
            <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
                {/* Language Toggle */}
                <button
                    onClick={() => setLanguage(l => l === 'bn' ? 'en' : 'bn')}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${language === 'bn'
                        ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                        : 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
                        }`}
                    title={language === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
                >
                    {language === 'bn' ? '🇧🇩 বাংলা' : '🇬🇧 English'}
                </button>
                <button
                    onClick={() => setIsTTSEnabled(!isTTSEnabled)}
                    className={`p-2 rounded-lg border transition-all shadow-sm ${isTTSEnabled ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-neutral-200 text-neutral-400'}`}
                    title={isTTSEnabled ? "Disable AI Voice" : "Enable AI Voice"}
                >
                    {isTTSEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-8 scroll-smooth">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 border border-primary-100 shadow-sm">
                            <Sparkles className="w-8 h-8 text-primary-600" />
                        </div>
                        <h2 className="text-2xl font-black text-neutral-900 mb-2">
                            {language === 'bn' ? 'আজকে কীভাবে সাহায্য করতে পারি?' : 'How can I help you build today?'}
                        </h2>
                        <p className="text-neutral-500 max-w-md mx-auto text-sm leading-relaxed mb-8">
                            {language === 'bn'
                                ? 'আমি আপনার এআই নির্মাণ পরামর্শদাতা। খরচ অনুমান, উপকরণ তুলনা, বিল্ডিং কোড বা ডিজাইন ভিজুয়ালাইজেশনে সাহায্য করতে পারি।'
                                : 'I am your AI Construction Consultant. I can estimate costs, compare materials, read building codes, or generate stunning interior and exterior design concepts.'
                            }
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                            {[
                                "Design a modern minimalist living room",
                                "What is the difference between PCC and RCC?",
                                "Estimate the cost of a 1200 sqft roof casting",
                                "Suggest materials for a damp bathroom"
                            ].map((suggestion, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInput(suggestion)}
                                    className="text-left px-4 py-3 text-xs font-semibold text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-xl hover:bg-white hover:border-primary-300 hover:text-primary-700 hover:shadow-sm transition-all"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((m: any) => {
                        return (
                            <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                                {m.role !== 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center flex-shrink-0 mt-1">
                                        <Bot className="w-4 h-4 text-primary-700" />
                                    </div>
                                )}

                                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 prose prose-sm ${m.role === 'user'
                                    ? 'bg-neutral-900 text-white prose-invert rounded-tr-sm'
                                    : 'bg-neutral-50 text-neutral-800 border border-neutral-200 rounded-tl-sm'
                                    }`}>

                                    {(() => {
                                        const renderContent = (content: any) => {
                                            if (typeof content === 'string') {
                                                return <span className="whitespace-pre-wrap">{content}</span>;
                                            }
                                            if (Array.isArray(content)) {
                                                return content.map((part: any, i: number) => {
                                                    if (part.type === 'text') {
                                                        return <span key={i} className="whitespace-pre-wrap">{part.text}</span>;
                                                    }
                                                    return null;
                                                });
                                            }
                                            return null;
                                        };

                                        const attachments = m.experimental_attachments || [];

                                        return (
                                            <div className="flex flex-col gap-2">
                                                {/* Render Text Content */}
                                                {(() => {
                                                    if (m.parts && Array.isArray(m.parts)) {
                                                        return m.parts.map((part: any, i: number) => {
                                                            if (part.type === 'text' && part.text) {
                                                                return <span key={i} className="whitespace-pre-wrap">{part.text}</span>;
                                                            }
                                                            return null;
                                                        });
                                                    }
                                                    return renderContent(m.content);
                                                })()}

                                                {/* Typing Indicator Fallback */}
                                                {isTyping && m.role === 'assistant' && !m.content && !m.parts && (
                                                    <span className="animate-pulse">...</span>
                                                )}

                                                {/* Render User Attachments */}
                                                {m.role === 'user' && attachments.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {attachments.map((attachment: any, i: number) => (
                                                            <div key={i} className="relative group">
                                                                {attachment.contentType?.startsWith('image/') && (
                                                                    <img
                                                                        src={attachment.url}
                                                                        alt={attachment.name || 'Attachment'}
                                                                        className="max-w-[200px] max-h-[200px] rounded-lg border border-neutral-700/50 shadow-sm object-cover"
                                                                    />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    {(() => {
                                        // 1. Handle Legacy toolInvocations (v3/v4)
                                        const toolInvocations = (m as any).toolInvocations || [];

                                        // 2. Handle Modern parts (v6)
                                        const parts = (m as any).parts || [];
                                        const toolParts = parts.filter((p: any) => p.type?.startsWith('tool-'));

                                        if (toolInvocations.length === 0 && toolParts.length === 0) return null;

                                        const allTools = [
                                            ...toolInvocations.map((ti: any) => ({
                                                id: ti.toolCallId,
                                                name: ti.toolName,
                                                state: ti.state === 'result' ? 'output-available' : ti.state,
                                                result: ti.result
                                            })),
                                            ...toolParts.map((tp: any) => ({
                                                id: tp.toolCallId,
                                                name: tp.toolName || tp.name || tp.type.replace('tool-', ''),
                                                state: tp.state === 'result' ? 'output-available' : tp.state,
                                                result: tp.output || tp.result
                                            }))
                                        ];

                                        if (allTools.length > 0) {
                                            console.log('[DEBUG] allTools for message:', m.id, allTools);
                                        }

                                        return allTools.map((tool: any, idx: number) => {
                                            const result = tool.result;

                                            // Handle various possible names and structures
                                            const isDesignTool =
                                                tool.name?.includes('design') ||
                                                tool.name?.includes('image') ||
                                                (result && (result.url || result.designUrl)) ||
                                                tool.name === 'call' ||
                                                tool.name === 'result';

                                            if (isDesignTool) {
                                                // 1. If we have a valid result, render the image block
                                                if (result && (result.url || (typeof result === 'string' && result.startsWith('http')))) {
                                                    const imageUrl = result.url || (typeof result === 'string' ? result : null);

                                                    return (
                                                        <div key={tool.id || idx} className="mt-4 pt-4 border-t border-neutral-200/40 not-prose">
                                                            <div className="space-y-4">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-600 flex items-center gap-2">
                                                                        <Sparkles className="w-3.5 h-3.5" /> DESIGN GENERATED
                                                                    </p>
                                                                </div>
                                                                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-neutral-200 shadow-xl bg-neutral-100 group">
                                                                    <img
                                                                        src={imageUrl}
                                                                        alt="Generated Design"
                                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                                    />
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                                                </div>
                                                                {result.message && (
                                                                    <p className="text-[11px] text-neutral-500 leading-relaxed italic">
                                                                        {result.message}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                // 2. If no result yet, show loader for design-related tools
                                                if (!result) {
                                                    return (
                                                        <div key={tool.id || idx} className="mt-4 pt-4 border-t border-neutral-200/20 not-prose">
                                                            <div className="flex items-center gap-3 text-sm font-semibold text-primary-600/80 bg-primary-50/50 p-3 rounded-xl border border-primary-100">
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                                Creating your design...
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            }
                                            return null;
                                        });
                                    })()}

                                    {/* Action Buttons for AI Responses */}
                                    {m.role === 'assistant' && !isTyping && (
                                        <div className="mt-4 flex flex-col gap-2">
                                            <p className="text-[10px] text-neutral-500 leading-relaxed mb-2 italic">
                                                Ghorbari AI helps you understand the basics, to understand the deep and accurate knowledge please talk to ghorbari professionals
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                <a
                                                    href="/services/design/book"
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-950 text-white text-[10px] font-bold rounded-lg hover:bg-black transition-all"
                                                >
                                                    <Calendar className="w-3 h-3" />
                                                    BOOK A PROFESSIONAL
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {
                                    m.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0 mt-1">
                                            <User className="w-4 h-4 text-neutral-600" />
                                        </div>
                                    )
                                }
                            </div>
                        );
                    })
                )}

                {isTyping && messages[messages.length - 1]?.role === "user" && (
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center flex-shrink-0 mt-1">
                            <Bot className="w-4 h-4 text-primary-700" />
                        </div>
                        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 flex gap-1 items-center">
                            <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                )}

                {/* Spacer so last message clears the floating input bar */}
                <div className="h-52 shrink-0" aria-hidden="true" />

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area (Fixed at bottom of container) */}
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-8 bg-gradient-to-t from-white via-white to-transparent z-20 pointer-events-none">
                <form
                    onSubmit={onSubmit}
                    className="max-w-3xl mx-auto relative bg-white border border-neutral-200 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-all focus-within:ring-4 focus-within:ring-primary-600/10 focus-within:border-primary-500/40 mb-2 pointer-events-auto"
                >
                    {/* Image Preview Area */}
                    {imagePreviewUrl && (
                        <div className="px-3 pt-3 pb-1 border-b border-neutral-100">
                            <div className="relative inline-block border border-neutral-200 rounded-lg p-1 bg-neutral-50">
                                <img src={imagePreviewUrl} alt="Preview" className="h-16 w-auto rounded object-cover" />
                                <button
                                    type="button"
                                    onClick={removeAttachedImage}
                                    className="absolute -top-2 -right-2 bg-neutral-900 text-white rounded-full p-1 shadow-sm hover:bg-red-500 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex items-end px-2 py-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                        />

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 text-neutral-400 hover:text-primary-600 hover:bg-neutral-100 rounded-xl transition-colors mb-0.5"
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
                            placeholder="Ask about materials, cost, or describe a space to design..."
                            className="flex-1 max-h-40 min-h-[48px] bg-transparent resize-none py-3.5 px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    if ((input || "").trim()) onSubmit(e as any);
                                }
                            }}
                        />

                        <button
                            type="submit"
                            disabled={(!(input || "").trim() && !isAttachedImage) || isTyping}
                            className="p-3 bg-neutral-950 text-white rounded-xl mb-0.5 ml-2 hover:bg-primary-600 hover:shadow-lg disabled:opacity-50 disabled:hover:bg-neutral-950 disabled:cursor-not-allowed transition-all"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>

                </form>
            </div>
        </div >
    );
}
