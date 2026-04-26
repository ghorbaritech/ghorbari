"use client"

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Mic, X, Send, Loader2, Bot, Sparkles, RefreshCw } from "lucide-react";
import { useChat } from "@ai-sdk/react";

const STARTER_PROMPTS = [
    { bn: "নির্মাণ খরচ কত হবে?", en: "How much will construction cost?" },
    { bn: "RAJUK অনুমোদন কীভাবে নেব?", en: "How to get RAJUK approval?" },
    { bn: "Dalankotha কী কী সেবা দেয়?", en: "What services does Dalankotha offer?" },
];

export function AIChatAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [lang, setLang] = useState<'en' | 'bn'>('bn');
    const [input, setInput] = useState("");
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { messages, sendMessage, status, error, reload } = useChat({
        api: "/api/chat",
        // Widget mode: text-only, no image gen, anonymous
        body: { userId: null, lang, mode: 'widget' },
        initialMessages: [
            {
                id: 'init-1',
                role: 'assistant',
                content: lang === 'bn'
                    ? 'আস্সালামু আলাইকুম! আমি দালানকোঠা AI। আজকে কীভাবে সাহায্য করতে পারি?'
                    : 'Assalamu Alaikum! I am Dalankotha AI. How can I help you today?',
            }
        ],
    });

    const isTyping = status === 'submitted' || status === 'streaming';
    const hasError = !!error || status === 'error';

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (text?: string) => {
        const message = (text || input).trim();
        if (!message || isTyping) return;
        setInput("");
        await sendMessage({ role: 'user', content: message } as any);
    };

    const toggleListen = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Voice recognition requires Chrome or Safari.");
            return;
        }
        if (isListening) { setIsListening(false); return; }

        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
            recognition.stop();
            setIsListening(false);
            handleSend(event.results[0][0].transcript);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    const getMessageText = (msg: any): string => {
        if (msg.parts?.length) {
            return msg.parts
                .filter((p: any) => p.type === 'text')
                .map((p: any) => p.text)
                .join('');
        }
        return typeof msg.content === 'string' ? msg.content : '';
    };

    return (
        <div className="fixed bottom-6 right-6 z-[200]">
            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-neutral-100 flex flex-col overflow-hidden"
                    style={{ animation: 'slideUpFade 0.25s ease-out' }}>

                    {/* Header */}
                    <div className="bg-primary-950 p-4 flex items-center justify-between text-white flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-primary-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Dalankotha AI</h3>
                                <div className="flex items-center gap-2">
                                    <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <p className="text-[10px] text-primary-200">
                                        {lang === 'bn' ? 'সক্রিয়' : 'Online'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setLang(l => l === 'en' ? 'bn' : 'en')}
                                className="text-[10px] font-black px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-all border border-white/10 uppercase tracking-widest"
                                title="Switch Language"
                            >
                                {lang === 'bn' ? 'বাং' : 'EN'}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 text-white/70 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 h-72 max-h-[55vh] overflow-y-auto p-4 flex flex-col gap-3 bg-neutral-50/50">
                        {/* Starter prompts — shown before first user message */}
                        {messages.length <= 1 && (
                            <div className="flex flex-col gap-2 mb-1">
                                {STARTER_PROMPTS.map((p, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(lang === 'bn' ? p.bn : p.en)}
                                        className="text-left text-xs px-3 py-2 bg-white border border-neutral-200 rounded-xl text-neutral-600 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 transition-all"
                                    >
                                        {lang === 'bn' ? p.bn : p.en}
                                    </button>
                                ))}
                            </div>
                        )}

                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-primary-600 text-white rounded-br-sm'
                                    : 'bg-white border border-neutral-100 text-neutral-800 rounded-bl-sm shadow-sm'
                                }`}>
                                    <span className="whitespace-pre-wrap">{getMessageText(msg)}</span>

                                    {/* CTA for AI messages */}
                                    {msg.role === 'assistant' && msg.id !== 'init-1' && (
                                        <p className="text-[9px] text-neutral-400 mt-2 pt-2 border-t border-neutral-100/60 italic leading-tight">
                                            {lang === 'bn'
                                                ? 'বিস্তারিত পরামর্শের জন্য আমাদের বিশেষজ্ঞদের সাথে কথা বলুন'
                                                : 'For in-depth advice, consult a Dalankotha professional'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-neutral-100 p-3 rounded-2xl rounded-bl-sm shadow-sm flex gap-1 items-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}

                        {/* Error state */}
                        {hasError && (
                            <div className="flex justify-start">
                                <div className="bg-red-50 border border-red-100 p-3 rounded-2xl text-sm text-red-600 flex items-center gap-2">
                                    <span>{lang === 'bn' ? 'সংযোগ সমস্যা হয়েছে।' : 'Connection error.'}</span>
                                    <button onClick={() => reload()} className="flex items-center gap-1 text-xs font-bold underline hover:no-underline">
                                        <RefreshCw className="w-3 h-3" />
                                        {lang === 'bn' ? 'আবার চেষ্টা' : 'Retry'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Full AI Consultant CTA */}
                    <div className="px-4 py-2 bg-gradient-to-r from-primary-950 to-primary-800 text-center">
                        <a href="/ai-consultant" className="text-[10px] text-primary-200 hover:text-white transition-colors flex items-center justify-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            {lang === 'bn' ? 'ডিজাইন ভিজ্যুয়ালাইজেশনের জন্য পূর্ণ AI কনসাল্ট্যান্ট →' : 'Full AI Consultant for design visuals →'}
                        </a>
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-neutral-100 flex-shrink-0">
                        <div className="flex items-center gap-2 bg-neutral-50 rounded-full border border-neutral-200 p-1 pl-4">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                placeholder={lang === 'bn' ? "আপনার প্রশ্ন লিখুন..." : "Type your message..."}
                                className="flex-1 bg-transparent text-sm text-neutral-900 border-none outline-none placeholder:text-neutral-400"
                                disabled={isTyping}
                            />
                            <button
                                onClick={toggleListen}
                                className={`w-9 h-9 rounded-full flex flex-shrink-0 items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-neutral-200 text-neutral-500'}`}
                                title={lang === 'bn' ? "কথা বলুন" : "Use Voice"}
                            >
                                <Mic className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleSend()}
                                disabled={!input.trim() || isTyping}
                                className="w-9 h-9 rounded-full bg-primary-950 text-white flex flex-shrink-0 items-center justify-center disabled:opacity-40 transition-all hover:scale-105 active:scale-95"
                            >
                                {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* FAB Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${isOpen
                    ? 'bg-neutral-900 text-white scale-90 rotate-90'
                    : 'bg-gradient-to-tr from-primary-700 via-primary-600 to-primary-500 text-white hover:scale-110 active:scale-95'
                } group`}
                aria-label={isOpen ? 'Close AI Chat' : 'Open AI Chat'}
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <div className="relative">
                        <Bot size={24} className="group-hover:rotate-12 transition-transform" />
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-primary-600 rounded-full animate-pulse" />
                    </div>
                )}
            </button>

            <style jsx>{`
                @keyframes slideUpFade {
                    from { opacity: 0; transform: translateY(12px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}
