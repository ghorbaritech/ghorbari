"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { createClient } from "@/utils/supabase/client"
import { Send, Search, MoreVertical, User, MessageSquare } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { useSearchParams } from "next/navigation"

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

function ChatInterface() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const searchParams = useSearchParams()
    const partnerId = searchParams.get('partnerId')

    const supabase = createClient()

    useEffect(() => {
        const init = async () => {
            await fetchConversations()
            // If partnerId is provided, try to find or create conversation
            if (partnerId) {
                handleStartChatWithPartner(partnerId)
            }
        }
        init()

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
    }, [selectedConversation, partnerId])

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.id)
        }
    }, [selectedConversation])

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 100)
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
                const pId = c.participant_1_id === user.id ? c.participant_2_id : c.participant_1_id
                const { data: partner } = await supabase.from('profiles').select('full_name, email, avatar_url, role').eq('id', pId).single()
                return { ...c, participant: partner }
            }))
            setConversations(enriched)
        }
        setLoading(false)
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

    const handleStartChatWithPartner = async (targetPartnerId: string) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Check if conversation exists
        const existing = conversations.find(c =>
            (c.participant_1_id === user.id && c.participant_2_id === targetPartnerId) ||
            (c.participant_2_id === user.id && c.participant_1_id === targetPartnerId)
        )

        if (existing) {
            setSelectedConversation(existing)
        } else {
            // Create new
            const { data: newConv, error } = await supabase
                .from('conversations')
                .insert({
                    participant_1_id: user.id,
                    participant_2_id: targetPartnerId,
                    updated_at: new Date().toISOString()
                })
                .select()
                .single()

            if (newConv && !error) {
                const { data: partner } = await supabase.from('profiles').select('full_name, email, avatar_url, role').eq('id', targetPartnerId).single()
                const fullConv = { ...newConv, participant: partner }
                setConversations(prev => [fullConv, ...prev])
                setSelectedConversation(fullConv)
            }
        }
    }

    const handleContactSupport = async () => {
        const { data: admin } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'admin')
            .limit(1)
            .single()

        if (admin) {
            handleStartChatWithPartner(admin.id)
        } else {
            alert("No support agent available at the moment.")
        }
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-[#F0F2F5] overflow-hidden rounded-[40px] m-8 border border-neutral-200">
            {/* Sidebar */}
            <div className="w-1/3 bg-white border-r border-neutral-100 flex flex-col">
                <div className="p-6 border-b border-neutral-100">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-black text-neutral-900 italic tracking-tighter uppercase">Messages</h2>
                        <Button onClick={handleContactSupport} size="sm" variant="ghost" className="h-8 text-[10px] font-bold uppercase tracking-widest gap-2 text-neutral-500 hover:text-neutral-900">
                            Support
                        </Button>
                    </div>
                    <div className="relative mb-4">
                        <Input className="pl-10 h-12 bg-neutral-50 border-none rounded-xl font-bold" placeholder="Search conversations..." />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-6 text-center text-neutral-500">Loading chats...</div>
                    ) : conversations.length === 0 ? (
                        <div className="p-10 text-center">
                            <MessageSquare className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                            <p className="text-neutral-400 font-bold uppercase text-xs tracking-widest">No active conversations</p>
                            <Button onClick={handleContactSupport} className="mt-4 bg-neutral-900 text-white font-bold rounded-xl text-xs uppercase tracking-widest">
                                Contact Support
                            </Button>
                        </div>
                    ) : (
                        conversations.map(c => (
                            <div
                                key={c.id}
                                onClick={() => setSelectedConversation(c)}
                                className={`p-6 border-b border-neutral-50 cursor-pointer transition-colors hover:bg-neutral-50 ${selectedConversation?.id === c.id ? 'bg-neutral-50' : ''}`}
                            >
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-neutral-200 overflow-hidden shrink-0">
                                        {c.participant?.avatar_url ? (
                                            <img src={c.participant.avatar_url} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-neutral-500"><User className="w-6 h-6" /></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-bold text-neutral-900 truncate">{c.participant?.full_name || 'Unknown User'}</h3>
                                            <span className="text-[10px] font-bold text-neutral-400 uppercase">{format(new Date(c.updated_at), 'MMM d')}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${c.participant?.role === 'admin' ? 'bg-neutral-900 text-white' :
                                                c.participant?.role === 'seller' ? 'bg-orange-100 text-orange-700' : 'bg-neutral-100 text-neutral-500'
                                                }`}>
                                                {c.participant?.role || 'User'}
                                            </span>
                                            <p className="text-sm text-neutral-500 truncate font-medium flex-1">Click to view</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 bg-white flex flex-col">
                {selectedConversation ? (
                    <>
                        <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-white">
                            <div className="flex gap-4 items-center">
                                <div className="w-10 h-10 rounded-full bg-neutral-200 overflow-hidden">
                                    {selectedConversation.participant?.avatar_url ? (
                                        <img src={selectedConversation.participant.avatar_url} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-500"><User className="w-5 h-5" /></div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-neutral-900">{selectedConversation.participant?.full_name}</h3>
                                    <p className="text-xs text-green-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span> Online
                                    </p>
                                </div>
                            </div>
                            <Button size="icon" variant="ghost">
                                <MoreVertical className="w-5 h-5 text-neutral-400" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8FAFC]">
                            {messages.map(m => {
                                const isMe = m.sender_id === userId
                                return (
                                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] sm:max-w-[60%] p-4 rounded-3xl ${isMe ? 'bg-neutral-900 text-white rounded-br-none' : 'bg-white text-neutral-900 shadow-sm rounded-bl-none'}`}>
                                            <p className="text-sm font-medium leading-relaxed">{m.content}</p>
                                            <p className={`text-[10px] mt-2 font-bold uppercase tracking-widest ${isMe ? 'text-neutral-300' : 'text-neutral-400'}`}>
                                                {format(new Date(m.created_at), 'h:mm a')}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-6 bg-white border-t border-neutral-100">
                            <form
                                onSubmit={(e) => { e.preventDefault(); sendMessage() }}
                                className="flex gap-4 items-center"
                            >
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="flex-1 h-14 bg-neutral-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-neutral-900"
                                    placeholder="Type your message..."
                                />
                                <Button type="submit" disabled={!newMessage.trim()} className="h-14 w-14 rounded-2xl bg-neutral-900 hover:bg-black text-white shrink-0 shadow-xl">
                                    <Send className="w-5 h-5" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 bg-neutral-50/50">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                            <MessageSquare className="w-10 h-10 text-neutral-300" />
                        </div>
                        <h3 className="text-xl font-black text-neutral-900 uppercase tracking-tight mb-2">Select a Conversation</h3>
                        <p className="max-w-xs text-center text-sm font-medium text-neutral-500">Choose a contact or contact support to start messaging.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function CustomerMessagesPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-neutral-500">Loading chat...</div>}>
            <ChatInterface />
        </Suspense>
    )
}
