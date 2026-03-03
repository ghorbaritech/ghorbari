"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, Trash2, Edit2, Loader2, Save, X, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight italic flex items-center gap-3">
                        <Bot className="w-8 h-8 text-primary-600" />
                        AI Training Data
                    </h1>
                    <p className="text-neutral-500 font-medium mt-1">
                        Teach your Ghorbari Assistant how to reply. Enter an expected question and its matching answer.
                    </p>
                </div>
                <Button onClick={() => handleOpenModal()} className="bg-primary-950 text-white flex items-center gap-2 rounded-xl">
                    <Plus className="w-4 h-4" /> Add New Prompt
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                </div>
            ) : data.length === 0 ? (
                <div className="bg-white rounded-3xl border border-neutral-100 p-12 text-center text-neutral-500 shadow-sm font-medium">
                    No training data configured yet. Click "Add New Prompt" to start teaching the AI.
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-neutral-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-100 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-black">
                                <th className="p-6">Expected Question (EN)</th>
                                <th className="p-6">Answer (EN)</th>
                                <th className="p-6">Expected Question (BN)</th>
                                <th className="p-6">Answer (BN)</th>
                                <th className="p-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {data.map((item) => (
                                <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors">
                                    <td className="p-6 align-top text-sm font-bold text-neutral-900 w-1/5 leading-relaxed">{item.question}</td>
                                    <td className="p-6 align-top text-sm text-neutral-500 w-1/4 leading-relaxed font-medium">{item.answer}</td>
                                    <td className="p-6 align-top text-sm font-bold text-neutral-900 w-1/5 leading-relaxed">{item.question_bn || <span className="text-neutral-200 italic font-black">Not set</span>}</td>
                                    <td className="p-6 align-top text-sm text-neutral-500 w-1/4 leading-relaxed font-medium">{item.answer_bn || <span className="text-neutral-200 italic font-black">Not set</span>}</td>
                                    <td className="p-6 align-top">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => handleOpenModal(item)}
                                                className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-400 hover:text-primary-600 hover:bg-primary-50 transition-all border border-transparent hover:border-primary-100"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Editing Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-neutral-100">
                        <div className="px-8 py-6 border-b border-neutral-50 flex items-center justify-between bg-neutral-50/30">
                            <h2 className="text-xl font-black italic text-neutral-900 tracking-tight">
                                {editingId ? "Update Training Prompt" : "Teach New Prompt"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-white border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-900 shadow-sm transition-all hover:scale-110">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Question (English) *</label>
                                    <Input
                                        value={formData.question}
                                        onChange={e => setFormData({ ...formData, question: e.target.value })}
                                        placeholder="e.g. How to order?"
                                        className="h-12 rounded-xl border-neutral-100 font-bold focus:ring-primary-600"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Question (Bengali)</label>
                                    <Input
                                        value={formData.question_bn}
                                        onChange={e => setFormData({ ...formData, question_bn: e.target.value })}
                                        placeholder="e.g. কীভাবে অর্ডার করব?"
                                        className="h-12 rounded-xl border-neutral-100 font-bold focus:ring-primary-600"
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Answer (English) *</label>
                                    <textarea
                                        value={formData.answer}
                                        onChange={e => setFormData({ ...formData, answer: e.target.value })}
                                        placeholder="e.g. You can browse products..."
                                        className="w-full h-24 p-4 rounded-2xl border border-neutral-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-600 resize-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Answer (Bengali)</label>
                                    <textarea
                                        value={formData.answer_bn}
                                        onChange={e => setFormData({ ...formData, answer_bn: e.target.value })}
                                        placeholder="e.g. আপনি পণ্যগুলো..."
                                        className="w-full h-24 p-4 rounded-2xl border border-neutral-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-600 resize-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="px-8 py-6 border-t border-neutral-50 bg-neutral-50/30 flex items-center justify-end gap-3">
                            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl font-bold uppercase text-xs tracking-widest text-neutral-400">Cancel</Button>
                            <Button className="bg-primary-950 text-white rounded-xl h-12 px-8 font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-primary-200" onClick={handleModalSubmit} disabled={isSaving}>
                                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                Save Knowledge
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
