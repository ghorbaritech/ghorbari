"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import { Send, Search, MoreVertical, User, MessageSquare } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

type Conversation = {
    id: string
    participant_1_id: string
    participant_2_id: string
    updated_at: string
    participant?: {
        full_name: string
        email: string
        avatar_url: string
        role?: string
    }
}

type Message = {
    id: string
    conversation_id: string
    sender_id: string
    content: string
    created_at: string
    is_read: boolean
}

export default function AdminMessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const supabase = createClient()

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const fetchMessages = async (id: string) => {
        const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', id)
            .order('created_at', { ascending: true })

        setMessages(data || [])
        scrollToBottom()
    }

    const fetchConversations = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        setUserId(user.id)

        const { data: convs } = await supabase
            .from('conversations')
            .select('*')
            .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
            .order('updated_at', { ascending: false })

        if (convs) {
            const enriched = await Promise.all(convs.map(async (c: any) => {
                const partnerId = c.participant_1_id === user.id ? c.participant_2_id : c.participant_1_id
                const { data: partner } = await supabase.from('profiles').select('full_name, email, avatar_url, role').eq('id', partnerId).single()
                return { ...c, participant: partner }
            }))
            setConversations(enriched)
        }
        setLoading(false)
    }

    useEffect(() => {
        const loadConversations = async () => {
            await fetchConversations()
        }
        loadConversations()

        const channel = supabase
            .channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload: any) => {
                if (selectedConversation && payload.new.conversation_id === selectedConversation.id) {
                    setMessages(prev => [...prev, payload.new as Message])
                    scrollToBottom()
                }
                fetchConversations()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [selectedConversation])

    useEffect(() => {
        if (selectedConversation) {
            const loadMessages = async () => {
                await fetchMessages(selectedConversation.id)
            }
            loadMessages()
        }
    }, [selectedConversation])

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation || !userId) return

        const { error } = await supabase.from('messages').insert({
            conversation_id: selectedConversation.id,
            sender_id: userId,
            content: newMessage,
        })

        if (!error) {
            setNewMessage("")
        }
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-neutral-900 border-neutral-800 overflow-hidden rounded-[40px] m-4 md:m-8 border">
            {/* Sidebar */}
            <div className="w-1/3 bg-neutral-950 border-r border-neutral-800 flex flex-col">
                <div className="p-6 border-b border-neutral-800">
                    <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-4">Support Inbox</h2>
                    <div className="relative">
                        <Input className="pl-10 h-12 bg-neutral-900 border-neutral-800 text-white rounded-xl font-bold focus:ring-2 focus:ring-blue-500/50" placeholder="Search chats..." />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="p-6 text-center text-neutral-500">Loading...</div>
                    ) : conversations.length === 0 ? (
                        <div className="p-10 text-center">
                            <MessageSquare className="w-10 h-10 text-neutral-700 mx-auto mb-2" />
                            <p className="text-neutral-500 font-bold uppercase text-xs tracking-widest">No tickets</p>
                        </div>
                    ) : (
                        conversations.map(c => (
                            <div
                                key={c.id}
                                onClick={() => setSelectedConversation(c)}
                                className={`p-6 border-b border-neutral-800/50 cursor-pointer transition-colors hover:bg-neutral-900 ${selectedConversation?.id === c.id ? 'bg-neutral-900' : ''}`}
                            >
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-neutral-800 overflow-hidden shrink-0 border border-neutral-700">
                                        {c.participant?.avatar_url ? (
                                            <img src={c.participant.avatar_url} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-neutral-500"><User className="w-6 h-6" /></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-bold text-white truncate">{c.participant?.full_name || 'Unknown User'}</h3>
                                            <span className="text-[10px] font-bold text-neutral-500 uppercase">{format(new Date(c.updated_at), 'MMM d')}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700 text-[10px] font-bold uppercase tracking-widest">{c.participant?.role}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 bg-neutral-900 flex flex-col relative">
                {selectedConversation ? (
                    <>
                        <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-950/80 backdrop-blur-md z-10">
                            <div className="flex gap-4 items-center">
                                <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden border border-neutral-700">
                                    {selectedConversation.participant?.avatar_url ? (
                                        <img src={selectedConversation.participant.avatar_url} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-500"><User className="w-5 h-5" /></div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{selectedConversation.participant?.full_name}</h3>
                                    <span className="text-xs text-neutral-400 font-bold uppercase tracking-widest">{selectedConversation.participant?.role}</span>
                                </div>
                            </div>
                            <Button size="icon" variant="ghost" className="hover:bg-neutral-800 text-neutral-400 hover:text-white">
                                <MoreVertical className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-900 custom-scrollbar relative">
                            {/* Decorative background element */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

                            <div className="relative z-10 space-y-6">
                                {messages.map(m => {
                                    const isMe = m.sender_id === userId
                                    return (
                                        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] sm:max-w-[60%] p-4 rounded-3xl ${isMe ? 'bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-900/20 text-right' : 'bg-neutral-800 border border-neutral-700 text-white shadow-sm rounded-bl-none'}`}>
                                                <p className="text-sm font-medium leading-relaxed">{m.content}</p>
                                                <p className={`text-[10px] mt-2 font-bold uppercase tracking-widest ${isMe ? 'text-blue-200' : 'text-neutral-500'}`}>
                                                    {format(new Date(m.created_at), 'h:mm a')}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        <div className="p-6 bg-neutral-950 border-t border-neutral-800">
                            <form
                                onSubmit={(e) => { e.preventDefault(); sendMessage() }}
                                className="flex gap-4 items-center"
                            >
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="flex-1 h-14 bg-neutral-900 border-neutral-800 text-white rounded-2xl font-medium focus:ring-2 focus:ring-blue-500/50 placeholder:text-neutral-500"
                                    placeholder="Type your reply..."
                                />
                                <Button type="submit" disabled={!newMessage.trim()} className="h-14 w-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shrink-0 shadow-lg shadow-blue-900/20 active:scale-95 transition-all">
                                    <Send className="w-5 h-5 ml-1" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 bg-neutral-900 relative">
                        {/* Decorative background element empty state */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-neutral-500/5 blur-[80px] rounded-full pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-24 h-24 bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center shadow-lg mb-6">
                                <MessageSquare className="w-10 h-10 text-neutral-500" />
                            </div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 italic">Select a Ticket</h3>
                            <p className="max-w-xs text-center text-sm font-medium text-neutral-500">Choose a conversation from the sidebar to reply.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
