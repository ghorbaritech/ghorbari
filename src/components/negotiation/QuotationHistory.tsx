"use client"

import { useState } from "react";
import { format } from "date-fns";
import { Send, CheckCircle2, User, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { QuoteHistoryItem, sendQuote, acceptQuote, QuoteType } from "@/services/quotationService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuotationHistoryProps {
    type: QuoteType;
    entityId: string;
    history: QuoteHistoryItem[];
    userRole: 'customer' | 'partner' | 'admin';
    status: string;
    onUpdate: () => void;
}

export function QuotationHistory({ type, entityId, history = [], userRole, status, onUpdate }: QuotationHistoryProps) {
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);

    const isActionable = status !== 'accepted' && status !== 'completed' && status !== 'cancelled';

    // Last offer
    const lastOffer = history.length > 0 ? history[history.length - 1] : null;
    const canAccept = lastOffer && lastOffer.by !== userRole && isActionable;

    const handleSend = async () => {
        if (!amount) return;
        setLoading(true);
        try {
            await sendQuote(type, entityId, {
                by: userRole,
                amount: parseFloat(amount),
                note
            });
            setAmount("");
            setNote("");
            onUpdate();
        } catch (error) {
            alert("Failed to send quote");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        if (!lastOffer) return;
        if (!confirm(`Accept offer of ৳${lastOffer.amount}?`)) return;
        setLoading(true);
        try {
            await acceptQuote(type, entityId, lastOffer.amount);
            onUpdate();
        } catch (error) {
            alert("Failed to accept quote");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg flex items-center justify-between">
                    <span>Negotiation History</span>
                    <span className={cn(
                        "text-xs px-2 py-1 rounded-full uppercase",
                        status === 'accepted' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                    )}>
                        {status.replace('_', ' ')}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
                {history.length === 0 ? (
                    <div className="text-center text-neutral-400 py-8 text-sm">
                        No negotiation yet. Send an initial offer/quote.
                    </div>
                ) : (
                    history.map((item, idx) => {
                        const isMe = item.by === userRole;
                        return (
                            <div key={idx} className={cn("flex flex-col gap-1 max-w-[80%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
                                <div className={cn(
                                    "p-3 rounded-lg text-sm shadow-sm border",
                                    isMe ? "bg-primary-50 border-primary-100 text-primary-900" : "bg-white border-neutral-200 text-neutral-900"
                                )}>
                                    <div className="font-bold text-lg">৳{item.amount.toLocaleString()}</div>
                                    {item.note && <div className="text-neutral-600 mt-1">{item.note}</div>}
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-neutral-400 capitalize">
                                    {item.by === 'customer' ? <User className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                                    <span>{item.by}</span> • <span>{format(new Date(item.date), 'MMM d, h:mm a')}</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </CardContent>

            {isActionable && (
                <div className="p-4 border-t bg-neutral-50 space-y-3">
                    {canAccept && (
                        <Button onClick={handleAccept} disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white mb-2">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Accept Offer (৳{lastOffer.amount.toLocaleString()})
                        </Button>
                    )}

                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">৳</span>
                                <Input
                                    className="pl-8"
                                    placeholder="Amount"
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleSend} disabled={!amount || loading}>
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                        <Textarea
                            placeholder="Add a note (optional)..."
                            className="h-16 resize-none"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>
                </div>
            )}
        </Card>
    );
}
