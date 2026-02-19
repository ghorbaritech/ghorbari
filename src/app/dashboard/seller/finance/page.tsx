"use client"

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { DollarSign, TrendingUp, ArrowDownLeft, ArrowUpRight, Download, Filter, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { getSellerBalance, getSellerLedger, processMockPayment, LedgerEntry } from "@/services/financeService";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SellerFinancePage() {
    const [balance, setBalance] = useState(0);
    const [ledger, setLedger] = useState<LedgerEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [filterType, setFilterType] = useState('all');

    const supabase = createClient();

    const fetchData = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: seller } = await supabase.from('sellers').select('id').eq('user_id', user.id).single();
        if (!seller) return;

        try {
            const [bal, entries] = await Promise.all([
                getSellerBalance(seller.id),
                getSellerLedger(seller.id)
            ]);
            setBalance(bal);
            setLedger(entries || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleWithdraw = async () => {
        // This is a mock function since we don't have real payment gateway integration for payouts yet
        if (balance <= 0) return alert("Insufficient balance");
        if (!confirm(`Request withdrawal of ৳${balance.toFixed(2)}?`)) return;

        setProcessing(true);
        try {
            // In a real app, this would create a 'withdrawal_request' record.
            // For now, we simulate a "Payment Cleared" entry to zero out the balance.
            const { data: { user } } = await supabase.auth.getUser();
            const { data: seller } = await supabase.from('sellers').select('id').eq('user_id', user.id).single();

            await processMockPayment(seller.id, balance); // This service function clears the due amount
            await fetchData();
            alert("Withdrawal request processed!");
        } catch (error) {
            alert("Failed to process withdrawal");
        } finally {
            setProcessing(false);
        }
    };

    const filteredLedger = filterType === 'all'
        ? ledger
        : ledger.filter(l => l.type === filterType);

    return (
        <div className="p-8 space-y-8 min-h-screen bg-[#F0F2F5]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-neutral-900 italic tracking-tighter uppercase">Finance & Earnings</h1>
                    <p className="text-neutral-500 font-bold uppercase text-xs tracking-widest mt-2">{ledger.length} Transactions • Lifetime History</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="h-12 border-neutral-200 rounded-xl font-bold text-neutral-600 gap-2">
                        <Download className="w-4 h-4" /> Export Report
                    </Button>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-neutral-900 text-white border-none shadow-xl rounded-[32px] overflow-hidden relative group">
                    {/* Decorative BG */}
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors" />

                    <CardContent className="p-8 relative z-10">
                        <div className="flex justify-between items-start mb-8">
                            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <Badge className="bg-green-500 text-neutral-900 font-black border-none">LIVE</Badge>
                        </div>
                        <div>
                            <p className="text-neutral-400 font-bold uppercase text-xs tracking-widest mb-1">Available Balance</p>
                            <h2 className="text-4xl font-black tracking-tight">৳{balance.toFixed(2)}</h2>
                        </div>
                        <div className="mt-6 pt-6 border-t border-white/10">
                            <Button
                                onClick={handleWithdraw}
                                disabled={processing || balance <= 0}
                                className="w-full bg-white text-neutral-900 font-black uppercase tracking-widest h-12 rounded-xl hover:bg-neutral-200"
                            >
                                {processing ? 'Processing...' : 'Withdraw Funds'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-none shadow-sm rounded-[32px]">
                    <CardContent className="p-8 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start">
                            <div className="bg-green-50 p-3 rounded-2xl">
                                <ArrowDownLeft className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-neutral-400 font-bold uppercase text-xs tracking-widest mb-1">Total Earnings</p>
                            <h2 className="text-3xl font-black text-neutral-900 tracking-tight">
                                ৳{ledger.filter(l => l.amount > 0).reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
                            </h2>
                            <p className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> +12% this month
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-none shadow-sm rounded-[32px]">
                    <CardContent className="p-8 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start">
                            <div className="bg-orange-50 p-3 rounded-2xl">
                                <ArrowUpRight className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-neutral-400 font-bold uppercase text-xs tracking-widest mb-1">Total Withdrawn</p>
                            <h2 className="text-3xl font-black text-neutral-900 tracking-tight">
                                ৳{Math.abs(ledger.filter(l => l.amount < 0).reduce((acc, curr) => acc + curr.amount, 0)).toFixed(2)}
                            </h2>
                            <p className="text-xs text-neutral-400 font-bold mt-2">
                                Last Payout: {ledger.find(l => l.amount < 0) ? format(new Date(ledger.find(l => l.amount < 0)!.created_at), 'MMM d') : 'Never'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transaction Table */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black text-neutral-900 uppercase">Transaction History</h2>
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-[180px] h-10 bg-white border-none rounded-xl font-bold">
                            <SelectValue placeholder="All Transactions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Transactions</SelectItem>
                            <SelectItem value="sale_commission">Earnings</SelectItem>
                            <SelectItem value="payment_cleared">Withdrawals</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="bg-white rounded-[32px] shadow-sm overflow-hidden border border-neutral-100 min-h-[400px]">
                    <table className="w-full">
                        <thead className="bg-neutral-50/50">
                            <tr>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-neutral-400 uppercase tracking-widest w-40">Date</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-neutral-400 uppercase tracking-widest">Description</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-neutral-400 uppercase tracking-widest">Type</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black text-neutral-400 uppercase tracking-widest">Amount</th>
                                <th className="px-8 py-6 text-center text-[10px] font-black text-neutral-400 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {loading ? (
                                <tr><td colSpan={5} className="p-20 text-center font-bold text-neutral-400 animate-pulse">Loading Ledger...</td></tr>
                            ) : filteredLedger.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <p className="font-black text-neutral-900 uppercase">No Transactions Found</p>
                                    </td>
                                </tr>
                            ) : filteredLedger.map((entry) => (
                                <tr key={entry.id} className="hover:bg-neutral-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                        <p className="font-bold text-neutral-900">{format(new Date(entry.created_at), 'MMM d, yyyy')}</p>
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase">{format(new Date(entry.created_at), 'h:mm a')}</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="font-bold text-neutral-700">{entry.description}</p>
                                        {entry.related_order_id && <p className="text-xs text-neutral-500">Order #{entry.related_order_id.slice(0, 8)}</p>}
                                    </td>
                                    <td className="px-8 py-5">
                                        <Badge variant="outline" className="border-neutral-200 text-neutral-600 bg-neutral-50 font-bold uppercase text-[10px] tracking-widest">
                                            {entry.type.replace('_', ' ')}
                                        </Badge>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <p className={`font-black text-lg ${entry.amount > 0 ? 'text-green-600' : 'text-neutral-900'}`}>
                                            {entry.amount > 0 ? '+' : ''}৳{Math.abs(entry.amount).toFixed(2)}
                                        </p>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <Badge className="bg-green-100 text-green-700 border-none font-bold uppercase text-[10px]">
                                            Completed
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
