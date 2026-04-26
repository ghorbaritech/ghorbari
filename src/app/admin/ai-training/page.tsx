"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, Trash2, Edit2, Loader2, Save, X, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QA {
    id: number;
    question: string;
    question_bn: string;
    answer: string;
    answer_bn: string;
}

export default function AITrainingPanel() {
    const [data, setData] = useState<QA[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Modal state for Add/Edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Partial<QA>>({
        question: "", question_bn: "", answer: "", answer_bn: ""
    });

    const supabase = createClient();

    useEffect(() => {
        fetchTrainingData();
    }, []);

    const fetchTrainingData = async () => {
        setIsLoading(true);
        const { data: result } = await supabase
            .from("home_content")
            .select("content")
            .eq("section_key", "ai_training_data")
            .single();

        if (result?.content?.knowledge_base) {
            setData(result.content.knowledge_base);
        }
        setIsLoading(false);
    };

    const handleSaveList = async (newList: QA[]) => {
        setIsSaving(true);
        const { error } = await supabase
            .from("home_content")
            .upsert({
                section_key: 'ai_training_data',
                content: { knowledge_base: newList },
                is_active: true
            }, { onConflict: 'section_key' });

        setIsSaving(false);
        if (error) {
            toast.error("Failed to save changes to the database.");
            return false;
        } else {
            setData(newList);
            toast.success("AI Training Data updated successfully!");
            return true;
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this training prompt?")) return;
        const newList = data.filter(item => item.id !== id);
        await handleSaveList(newList);
    };

    const handleOpenModal = (qa?: QA) => {
        if (qa) {
            setEditingId(qa.id);
            setFormData(qa);
        } else {
            setEditingId(null);
            setFormData({ question: "", question_bn: "", answer: "", answer_bn: "" });
        }
        setIsModalOpen(true);
    };

    const handleModalSubmit = async () => {
        if (!formData.question || !formData.answer) {
            toast.error("English Question and Answer are required.");
            return;
        }

        let newList = [...data];
        if (editingId) {
            newList = newList.map(item => item.id === editingId ? { ...item, ...formData } as QA : item);
        } else {
            const newId = data.length > 0 ? Math.max(...data.map(d => d.id)) + 1 : 1;
            newList.push({ ...(formData as QA), id: newId });
        }

        const success = await handleSaveList(newList);
        if (success) {
            setIsModalOpen(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-800 pb-8">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                        <Bot className="w-3 h-3" />
                        AI Instruction Engine
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                        Training <span className="text-blue-500">Data</span>
                    </h1>
                    <p className="text-neutral-500 font-medium">Teach your Dalankotha Assistant how to reply to queries.</p>
                </div>

                <Button onClick={() => handleOpenModal()} className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white h-12 px-6 rounded-xl font-black uppercase text-xs tracking-widest shadow-sm transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4 text-blue-500" /> Add New Prompt
                </Button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 text-neutral-500 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                    <p className="font-black uppercase tracking-widest text-xs">Loading Knowledge Base...</p>
                </div>
            ) : data.length === 0 ? (
                <Card className="bg-neutral-900 border border-neutral-800 rounded-3xl p-16 text-center shadow-sm">
                    <div className="w-16 h-16 bg-neutral-950 border border-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Bot className="w-8 h-8 text-neutral-600" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">No Training Data Configured</h3>
                    <p className="text-neutral-500 font-medium text-sm max-w-md mx-auto">
                        Click "Add New Prompt" to start adding instructional Q&A pairs for the AI consultant.
                    </p>
                </Card>
            ) : (
                <Card className="bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-950 border-b border-neutral-800">
                                    <th className="p-6 text-[10px] uppercase font-black tracking-widest text-neutral-500 w-[20%]">Expected Question (EN)</th>
                                    <th className="p-6 text-[10px] uppercase font-black tracking-widest text-neutral-500 w-[25%]">Answer (EN)</th>
                                    <th className="p-6 text-[10px] uppercase font-black tracking-widest text-neutral-500 w-[20%]">Expected Question (BN)</th>
                                    <th className="p-6 text-[10px] uppercase font-black tracking-widest text-neutral-500 w-[25%]">Answer (BN)</th>
                                    <th className="p-6 text-[10px] uppercase font-black tracking-widest text-neutral-500 text-center w-[10%]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800/50">
                                {data.map((item) => (
                                    <tr key={item.id} className="hover:bg-neutral-800/30 transition-colors">
                                        <td className="p-6 align-top">
                                            <span className="text-sm font-bold text-white leading-relaxed block">{item.question}</span>
                                        </td>
                                        <td className="p-6 align-top">
                                            <span className="text-sm text-neutral-400 font-medium leading-relaxed block">{item.answer}</span>
                                        </td>
                                        <td className="p-6 align-top">
                                            {item.question_bn ? (
                                                <span className="text-sm font-bold text-white leading-relaxed block">{item.question_bn}</span>
                                            ) : (
                                                <span className="text-[10px] text-neutral-600 font-black uppercase tracking-widest">Not Set</span>
                                            )}
                                        </td>
                                        <td className="p-6 align-top">
                                            {item.answer_bn ? (
                                                <span className="text-sm text-neutral-400 font-medium leading-relaxed block">{item.answer_bn}</span>
                                            ) : (
                                                <span className="text-[10px] text-neutral-600 font-black uppercase tracking-widest">Not Set</span>
                                            )}
                                        </td>
                                        <td className="p-6 align-top">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(item)}
                                                    className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-rose-400 hover:border-rose-500/50 hover:bg-rose-500/10 transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Editing Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <Card className="bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="px-8 py-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
                            <h2 className="text-xl font-black italic uppercase text-white tracking-tight flex items-center gap-3">
                                <Bot className="w-5 h-5 text-blue-500" />
                                {editingId ? "Update Prompt" : "Teach New Prompt"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6 bg-neutral-900">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Question (English) *</label>
                                    <Input
                                        value={formData.question}
                                        onChange={e => setFormData({ ...formData, question: e.target.value })}
                                        placeholder="e.g. How to order?"
                                        className="h-12 rounded-xl border-neutral-800 bg-neutral-950 text-white font-bold focus:ring-1 focus:ring-blue-500 placeholder:text-neutral-700"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Question (Bengali)</label>
                                    <Input
                                        value={formData.question_bn}
                                        onChange={e => setFormData({ ...formData, question_bn: e.target.value })}
                                        placeholder="e.g. কীভাবে অর্ডার করব?"
                                        className="h-12 rounded-xl border-neutral-800 bg-neutral-950 text-white font-bold focus:ring-1 focus:ring-blue-500 placeholder:text-neutral-700"
                                    />
                                </div>
                                <div className="space-y-3 col-span-2">
                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Answer (English) *</label>
                                    <textarea
                                        value={formData.answer}
                                        onChange={e => setFormData({ ...formData, answer: e.target.value })}
                                        placeholder="e.g. You can browse products and add them to your cart..."
                                        className="w-full h-32 p-4 rounded-xl border border-neutral-800 bg-neutral-950 text-white text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none placeholder:text-neutral-700"
                                    />
                                </div>
                                <div className="space-y-3 col-span-2">
                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Answer (Bengali)</label>
                                    <textarea
                                        value={formData.answer_bn}
                                        onChange={e => setFormData({ ...formData, answer_bn: e.target.value })}
                                        placeholder="e.g. আপনি পণ্যগুলো ব্রাউজ করে কার্টে যোগ করতে পারেন..."
                                        className="w-full h-32 p-4 rounded-xl border border-neutral-800 bg-neutral-950 text-white text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none placeholder:text-neutral-700"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="px-8 py-6 border-t border-neutral-800 bg-neutral-950 flex items-center justify-end gap-3">
                            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl font-bold uppercase text-[10px] tracking-widest text-neutral-500 hover:text-white hover:bg-neutral-900 h-12 px-6">
                                Cancel
                            </Button>
                            <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-12 px-8 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-900/40 transition-all active:scale-95" onClick={handleModalSubmit} disabled={isSaving}>
                                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                Save Knowledge
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
