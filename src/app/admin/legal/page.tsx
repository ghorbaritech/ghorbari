'use client'

import PartnerLegalContractForm from '@/components/forms/PartnerLegalContractForm'
import ContractLogsPanel from '@/components/legal/ContractLogsPanel'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Gavel, Plus, FileStack } from 'lucide-react'

export default function LegalPage() {
    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700 min-h-screen bg-[#050505]">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter flex items-center">
                        <Gavel className="w-10 h-10 mr-4 text-primary-500" />
                        Dalankotha <span className="text-primary-500 ml-2">LegalSign</span>
                    </h1>
                    <p className="text-neutral-500 font-medium">Generate and manage electronic partner onboarding agreements.</p>
                </div>
            </div>

            <Tabs defaultValue="logs" className="space-y-8 w-full">
                <TabsList className="bg-neutral-900/50 border border-white/5 p-1 h-auto rounded-2xl inline-flex gap-2">
                    <TabsTrigger value="logs" className="rounded-xl px-6 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-neutral-400 font-bold flex items-center gap-2">
                        <FileStack className="w-4 h-4" />
                        Contract Logs
                    </TabsTrigger>
                    <TabsTrigger value="generate" className="rounded-xl px-6 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-neutral-400 font-bold flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Generate New
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="logs" className="m-0">
                    <ContractLogsPanel />
                </TabsContent>

                <TabsContent value="generate" className="m-0">
                    <div className="grid grid-cols-1 gap-8">
                        <Card className="border border-white/5 shadow-2xl bg-neutral-900/50 backdrop-blur-xl relative overflow-hidden">
                            {/* Decorative element */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 blur-[100px] rounded-full -mr-32 -mt-32" />
                            
                            <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                                <CardTitle className="uppercase text-[10px] font-black tracking-[0.2em] text-primary-500/80">
                                    Create New Agreement
                                </CardTitle>
                                <CardDescription className="text-neutral-500">Fill in the partner details and capture their digital signature below.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-8">
                                <PartnerLegalContractForm />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
