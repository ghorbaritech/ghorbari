"use client"

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Mic, X, Send, Loader2, Volume2, Bot } from "lucide-react";

export function AIChatAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([
        { role: 'assistant', text: "Hello! I am your Ghorbari AI assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [lang, setLang] = useState<'en' | 'bn'>('en');
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const speakText = (text: string, language: 'en' | 'bn') => {
        if (!isVoiceEnabled || !window.speechSynthesis) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Try to find a suitable voice
        const voices = window.speechSynthesis.getVoices();
        if (language === 'bn') {
            // common Bengali voice identifiers in different OS
            const bnVoice = voices.find(v => v.lang.startsWith('bn') || v.name.includes('Bengali') || v.name.includes('Bangladesh'));
            if (bnVoice) utterance.voice = bnVoice;
            utterance.lang = 'bn-BD';
        } else {
            const enVoice = voices.find(v => v.lang.startsWith('en'));
            if (enVoice) utterance.voice = enVoice;
            utterance.lang = 'en-US';
        }

        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        const userText = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setInput("");
        setIsTyping(true);

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText, lang })
            });

            const data = await response.json();
            const botResponse = data.reply || "I encountered an error. Please try again.";
            const responseLang = data.lang || lang;

            setMessages(prev => [...prev, { role: 'assistant', text: botResponse }]);
            setIsTyping(false);

            // Trigger Voice Output
            if (isVoiceEnabled) {
                speakText(botResponse, responseLang);
            }
        } catch (error) {
            console.error("AI Chat Error:", error);
            setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I'm having trouble connecting right now." }]);
            setIsTyping(false);
        }
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
            setInput(speechResult);
            // Auto-send voice input for a smoother experience
            setTimeout(() => {
                // We need to use the value from local scope or handleSend needs to allow passing text
            }, 100);
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

                    {/* Messages Body */}
                    <div className="flex-1 h-80 max-h-[60vh] overflow-y-auto p-4 flex flex-col gap-4 bg-neutral-50/50">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                    ? 'bg-primary-600 text-white rounded-br-sm'
                                    : 'bg-white border border-neutral-100 text-neutral-800 rounded-bl-sm shadow-sm'
                                    }`}>
                                    {msg.text}
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
                        <Bot className="w-8 h-8 transition-transform group-hover:scale-110" />
                        {/* Status indicator / Voice ready pulse */}
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-primary-600 rounded-full animate-pulse shadow-sm" />
                    </div>
                )}
            </button>
        </div>
    );
}
