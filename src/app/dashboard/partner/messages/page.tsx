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

export default function SellerMessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const supabase = createClient()

    useEffect(() => {
        fetchConversations()

        // Subscribe to new messages (global for notification badge, or specific logic)
        const channel = supabase
            .channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload: any) => {
                // Refresh if current conversation
                if (selectedConversation && payload.new.conversation_id === selectedConversation.id) {
                    setMessages(prev => [...prev, payload.new as Message])
                    scrollToBottom()
                }
                // Always refresh list to show latest
                fetchConversations()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [selectedConversation])

    // Load messages when conversation selected
    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.id)
        }
    }, [selectedConversation])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const fetchConversations = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        setUserId(user.id)

        // Fetch conversations where I am participant 1 or 2
        // We need to join profiles to get names. 
        // Supabase join syntax is bit tricky with OR, so we do client side merge or RPC ideally.
        // For now, let's just default fetch and manual populate.

        const { data: convs, error } = await supabase
            .from('conversations')
            .select('*')
            .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
            .order('updated_at', { ascending: false })

        if (convs) {
            // Enrich with partner details
            const enriched = await Promise.all(convs.map(async (c: any) => {
                const partnerId = c.participant_1_id === user.id ? c.participant_2_id : c.participant_1_id
                const { data: partner } = await supabase.from('profiles').select('full_name, email, avatar_url').eq('id', partnerId).single()
                return { ...c, participant: partner }
            }))
            setConversations(enriched)
            if (!selectedConversation && enriched.length > 0) {
                // Optionally auto select first? No, let user choose.
            }
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
            // realtime will handle update, but for instant UI:
            // setMessages([...messages, { ...temp }])
        }
    }

    const handleContactSupport = async () => {
        setLoading(true)
        console.log("Initiating contact support...")
        try {
            // 1. Find an admin
            console.log("Searching for admin user...")
            const { data: admin, error: adminError } = await supabase
                .from('profiles')
                .select('id, email, full_name, role')
                .eq('role', 'admin')
                .limit(1)
                .single()

            console.log("Admin search result:", { admin, adminError })

            if (adminError || !admin) {
                console.error("Admin not found or error:", adminError)
                alert("System Error: No valid Admin account found to receive support messages. Please contact the platform owner.")
                setLoading(false)
                return
            }

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                console.error("User not authenticated")
                return
            }

            // 2. Check if conversation exists
            console.log("Checking for existing conversation...")
            const { data: existing, error: existingError } = await supabase
                .from('conversations')
                .select('*')
                .or(`and(participant_1_id.eq.${user.id},participant_2_id.eq.${admin.id}),and(participant_1_id.eq.${admin.id},participant_2_id.eq.${user.id})`)
                .single()

            console.log("Existing conversation check:", { existing, existingError })

            if (existing) {
                console.log("Found existing conversation", existing)
                // Enrich and set
                const { data: partner } = await supabase.from('profiles').select('full_name, email, avatar_url').eq('id', admin.id).single()
                const fullConv = { ...existing, participant: partner }

                // Check if already in list
                if (!conversations.find(c => c.id === existing.id)) {
                    setConversations([fullConv, ...conversations])
                }
                setSelectedConversation(fullConv)
            } else {
                // 3. Create new
                console.log("Creating new conversation...")
                const { data: newConv, error: createError } = await supabase
                    .from('conversations')
                    .insert({
                        participant_1_id: user.id,
                        participant_2_id: admin.id,
                        updated_at: new Date().toISOString()
                    })
                    .select()
                    .single()

                console.log("Create new conversation result:", { newConv, createError })

                if (createError) {
                    console.error("Failed to create conversation:", createError)
                    alert(`Error creating chat: ${createError.message}`)
                    throw createError
                }

                if (newConv) {
                    const { data: partner } = await supabase.from('profiles').select('full_name, email, avatar_url').eq('id', admin.id).single()
                    const fullConv = { ...newConv, participant: partner }
                    setConversations([fullConv, ...conversations])
                    setSelectedConversation(fullConv)
                }
            }
        } catch (error) {
            console.error("Critical error in handleContactSupport:", error)
            alert("Failed to start support chat. Check console for details.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-[#F0F2F5] overflow-hidden rounded-[40px] m-8 border border-neutral-200">
            {/* Sidebar */}
            <div className="w-1/3 bg-white border-r border-neutral-100 flex flex-col">
                <div className="p-6 border-b border-neutral-100">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-black text-neutral-900 italic tracking-tighter uppercase">Messages</h2>
                        <Button onClick={handleContactSupport} size="sm" variant="outline" className="h-8 text-xs font-bold uppercase tracking-widest gap-2">
                            Details
                        </Button>
                    </div>
                    <div className="relative mb-4">
                        <Input className="pl-10 h-12 bg-neutral-50 border-none rounded-xl font-bold" placeholder="Search conversations..." />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    </div>
                    <Button onClick={handleContactSupport} className="w-full h-10 bg-neutral-900 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-black">
                        Contact Support
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-6 text-center text-neutral-500">Loading chats...</div>
                    ) : conversations.length === 0 ? (
                        <div className="p-10 text-center">
                            <MessageSquare className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                            <p className="text-neutral-400 font-bold uppercase text-xs tracking-widest">No active conversations</p>
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
                                        <p className="text-sm text-neutral-500 truncate font-medium">{c.participant?.email}</p>
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
                                            <p className={`text-[10px] mt-2 font-bold uppercase tracking-widest ${isMe ? 'text-neutral-500' : 'text-neutral-300'}`}>
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
                        <p className="max-w-xs text-center text-sm font-medium text-neutral-500">Choose a contact from the sidebar to start messaging.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
