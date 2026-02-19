"use client"

import { useState, useEffect, useRef } from "react";
import { Send, User as UserIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createClient } from "@/utils/supabase/client";
import { Message, getConversationByContext, getMessages, sendMessage, subscribeToMessages } from "@/services/chatService";
import { cn } from "@/lib/utils";

interface ChatWindowProps {
    contextId: string; // Order ID, Ticket ID, etc.
    contextType: 'order' | 'support_ticket' | 'inquiry';
    otherUserId: string; // The person we are talking to (Admin, Seller, Customer)
    title?: string;
    className?: string;
}

export function ChatWindow({ contextId, contextType, otherUserId, title, className }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [currentUser, setCurrentUser] = useState<string | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    useEffect(() => {
        const initChat = async () => {
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                setCurrentUser(user.id);

                // Build participants list (Me + Them)
                const participants = [user.id, otherUserId].sort(); // Sort for consistency if needed, though array contains check handles it

                const conv = await getConversationByContext(contextId, contextType, participants);
                setConversationId(conv.id);

                const msgs = await getMessages(conv.id);
                setMessages(msgs);
            } catch (error) {
                console.error("Chat Init Error:", error);
            } finally {
                setLoading(false);
            }
        };

        if (contextId && otherUserId) {
            initChat();
        }
    }, [contextId, otherUserId]);

    // Real-time Subscription
    useEffect(() => {
        if (!conversationId) return;

        const channel = subscribeToMessages(conversationId, (newMsg) => {
            setMessages(prev => {
                // Avoid duplicates
                if (prev.find(m => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
            });
        });

        return () => {
            channel.unsubscribe();
        };
    }, [conversationId]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !conversationId || !currentUser) return;

        setSending(true);
        const content = newMessage;
        setNewMessage(""); // Optimistic clear

        try {
            await sendMessage(conversationId, currentUser, content);
        } catch (error) {
            console.error("Send Error:", error);
            setNewMessage(content); // Restore on partia
        } finally {
            setSending(false);
        }
    };

    return (
        <Card className={cn("flex flex-col h-[500px]", className)}>
            <CardHeader className="py-3 border-b">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    {title || "Chat"}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                <ScrollArea className="flex-1 p-4">
                    {loading ? (
                        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-neutral-400" /></div>
                    ) : messages.length === 0 ? (
                        <div className="text-center text-neutral-400 text-xs py-8">Start the conversation...</div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((msg, i) => {
                                const isMe = msg.sender_id === currentUser;
                                return (
                                    <div key={msg.id || i} className={cn("flex gap-2 max-w-[85%]", isMe ? "ml-auto flex-row-reverse" : "")}>
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                                            isMe ? "bg-primary-100 border-primary-200" : "bg-neutral-100 border-neutral-200"
                                        )}>
                                            <UserIcon className="w-4 h-4 opacity-50" />
                                        </div>
                                        <div className={cn(
                                            "p-3 text-sm rounded-lg",
                                            isMe ? "bg-primary-600 text-white" : "bg-neutral-100 text-neutral-800"
                                        )}>
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={scrollRef} />
                        </div>
                    )}
                </ScrollArea>
                <form onSubmit={handleSend} className="p-3 border-t bg-neutral-50 flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="bg-white"
                        disabled={loading}
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim() || sending || loading}>
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

import { MessageSquare } from "lucide-react";
