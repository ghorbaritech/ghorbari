"use client"

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Mic, X, Send, Loader2, Volume2, Bot, Sparkles } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { toast } from "sonner";

export function AIChatAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [lang, setLang] = useState<'en' | 'bn'>('bn');
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
    const [input, setInput] = useState("");
    const [isListening, setIsListening] = useState(false);

    const { messages, append, status, setMessages } = useChat({
        api: "/api/chat",
        body: { userId: "assistant-user", lang },
        initialMessages: [
            {
                id: 'init-1',
                role: 'assistant',
                content: "Assalamu Alaikum! I am Ghorbari AI Assistant. How can I help you today?"
            }
        ],
    });

    const isTyping = status === 'submitted' || status === 'streaming';
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const msgText = input.trim();
        setInput("");
        await append({
            role: 'user',
            content: msgText,
        }, { body: { userId: 'guest', lang } });
    };

    const toggleListen = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Your browser does not support Voice Recognition. Please use Chrome or Safari.");
            return;
        }

        if (isListening) {
            setIsListening(false);
            return;
        }

        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = (event: any) => {
            const speechResult = event.results[0][0].transcript;
            setInput("");
            sendMessage({ text: speechResult }, { body: { userId: 'guest', lang } });
        };

        recognition.onspeechend = () => {
            recognition.stop();
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            setIsListening(false);
        };

        recognition.start();
    };

    return (
        <div className="fixed bottom-6 right-6 z-[200]">
            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-neutral-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="bg-primary-950 p-4 flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-primary-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Ghorbari AI</h3>
                                <div className="flex items-center gap-2">
                                    <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <p className="text-[10px] text-primary-200">Online</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Lang Toggle */}
                            <button
                                onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
                                className="text-[10px] font-black px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-all border border-white/10 uppercase tracking-widest"
                                title="Switch Language"
                            >
                                {lang}
                            </button>
                            {/* Voice Toggle */}
                            <button
                                onClick={() => {
                                    if (isVoiceEnabled) window.speechSynthesis.cancel();
                                    setIsVoiceEnabled(!isVoiceEnabled);
                                }}
                                className={`p-1.5 rounded-lg transition-all ${isVoiceEnabled ? 'text-primary-400 bg-white/10' : 'text-white/40 hover:text-white'}`}
                                title={isVoiceEnabled ? "Disable Voice Output" : "Enable Voice Output"}
                            >
                                {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <Volume2 className="w-4 h-4 opacity-30" />}
                            </button>
                            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors ml-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 h-80 max-h-[60vh] overflow-y-auto p-4 flex flex-col gap-4 bg-neutral-50/50">
                        {messages.map((msg, i) => (
                            <div key={msg.id || i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                    ? 'bg-primary-600 text-white rounded-br-sm'
                                    : 'bg-white border border-neutral-100 text-neutral-800 rounded-bl-sm shadow-sm'
                                    }`}>
                                    {/* Visible Debug for Tool Issues - will remove after fix */}
                                    {msg.role === 'assistant' && (
                                        <div className="text-[8px] text-neutral-300 mb-1 font-mono">
                                            ID: {msg.id.substring(0,4)} | P: {msg.parts?.length || 0} | TI: {(msg as any).toolInvocations?.length || 0}
                                        </div>
                                    )}

                                    {/* Text Content Rendering using parts */}
                                    {msg.parts && msg.parts.map((part, pIdx) => (
                                        <div key={pIdx}>
                                            {part.type === 'text' && <span className="whitespace-pre-wrap">{part.text}</span>}
                                            {part.type === 'reasoning' && (
                                                <p className="text-xs text-neutral-400 italic mb-1">{part.text}</p>
                                            )}
                                        </div>
                                    ))}

                                    {/* Robust Tool Rendering Logic */}
                                    {(() => {
                                        // Combine toolInvocations and parts into a single list
                                        const toolInvocations = (msg as any).toolInvocations || [];
                                        const parts = msg.parts || [];
                                        const toolParts = parts.filter((p: any) => p.type?.startsWith('tool-'));

                                        const allTools = [
                                            ...toolInvocations.map((ti: any) => ({
                                                id: ti.toolCallId,
                                                name: ti.toolName,
                                                state: ti.state === 'result' ? 'output-available' : ti.state,
                                                result: ti.result
                                            })),
                                            ...toolParts.map((tp: any) => ({
                                                id: tp.toolCallId,
                                                name: tp.toolName || tp.name || (tp.type === 'tool-result' ? 'result' : 'call'),
                                                state: tp.type === 'tool-result' ? 'output-available' : 'calling',
                                                result: tp.output || tp.result
                                            }))
                                        ];

                                        if (allTools.length === 0) return null;

                                        return allTools.map((tool: any, idx: number) => {
                                            const result = tool.result;
                                            const isDesignTool = 
                                                tool.name?.includes('design') || 
                                                tool.name?.includes('image') || 
                                                (result && (result.url || result.designUrl)) ||
                                                tool.name === 'result';

                                            if (isDesignTool && result && (result.url || (typeof result === 'string' && result.startsWith('http')))) {
                                                const imageUrl = result.url || (typeof result === 'string' ? result : null);
                                                
                                                return (
                                                    <div key={tool.id || idx} className="mt-3 pt-3 border-t border-neutral-100 not-prose">
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-[10px] font-bold uppercase tracking-wider text-primary-600 flex items-center gap-1.5">
                                                                    <Sparkles className="w-3 h-3" /> Design Created
                                                                </p>
                                                            </div>
                                                            <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-neutral-100 shadow-sm bg-neutral-50 group">
                                                                <img
                                                                    src={imageUrl}
                                                                    alt="Generated Design"
                                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                                />
                                                            </div>
                                                            {result.message && (
                                                                <p className="text-[10px] text-neutral-500 italic leading-snug">
                                                                    {result.message}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        });
                                    })()}

                                    {msg.role === 'assistant' && (
                                        <div className="mt-2 pt-2 border-t border-neutral-100/50">
                                            <p className="text-[10px] text-neutral-400 leading-tight italic">
                                                Ghorbari AI helps you understand the basics, to understand the professional depth please talk to Ghorbari experts
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-neutral-100 text-neutral-500 p-3 rounded-2xl rounded-bl-sm shadow-sm flex gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-200 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-neutral-100">
                        <div className="flex items-center gap-2 bg-neutral-50 rounded-full border border-neutral-200 p-1 pl-4">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder={lang === 'bn' ? "আপনার প্রশ্ন লিখুন..." : "Type your message..."}
                                className="flex-1 bg-transparent text-sm text-neutral-900 border-none outline-none placeholder:text-neutral-400"
                            />

                            <button
                                onClick={toggleListen}
                                className={`w-9 h-9 rounded-full flex flex-shrink-0 items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-neutral-200 text-neutral-500'
                                    }`}
                                title={lang === 'bn' ? "কথা বলুন" : "Use Voice"}
                            >
                                <Mic className="w-4 h-4" />
                            </button>

                            <button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className="w-9 h-9 rounded-full bg-primary-950 text-white flex flex-shrink-0 items-center justify-center disabled:opacity-50 transition-all hover:scale-105"
                            >
                                <Send className="w-4 h-4 ml-0.5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating FAB */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 ease-out ${isOpen
                    ? 'bg-neutral-900 text-white rotate-180 scale-90'
                    : 'bg-gradient-to-tr from-primary-700 via-primary-600 to-primary-500 text-white hover:scale-110 active:scale-95'
                    } group`}
            >
                {isOpen ? (
                    <X className="w-7 h-7" />
                ) : (
                    <div className="relative">
                        <Bot size={24} className={`${isListening ? 'animate-pulse text-accent-500' : ''} group-hover:rotate-12 transition-transform`} />
                        {/* Status indicator / Voice ready pulse */}
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-primary-600 rounded-full animate-pulse shadow-sm" />
                    </div>
                )}
            </button>
        </div>
    );
}
