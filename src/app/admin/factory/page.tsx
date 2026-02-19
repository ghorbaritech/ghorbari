'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductFactory } from "@/components/admin/ProductFactory"
import { ServiceFactory } from "@/components/admin/ServiceFactory"

export default function FactoryPage() {
    return (
        <div className="min-h-screen pb-20">
            <header className="mb-10">
                <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight italic">Factory Operations</h1>
                <p className="text-neutral-500 font-medium">Centralized control for Products & Services fulfillment.</p>
            </header>

            <Tabs defaultValue="product" className="space-y-8">
                <TabsList className="bg-white p-1 rounded-2xl h-16 shadow-sm border border-neutral-100 inline-flex">
                    <TabsTrigger
                        value="product"
                        className="h-14 px-8 rounded-xl font-bold text-neutral-500 data-[state=active]:bg-neutral-900 data-[state=active]:text-white transition-all text-xs uppercase tracking-widest"
                    >
                        Product Factory
                    </TabsTrigger>
                    <TabsTrigger
                        value="service"
                        className="h-14 px-8 rounded-xl font-bold text-neutral-500 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all text-xs uppercase tracking-widest"
                    >
                        Service Factory
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="product" className="outline-none">
                    <ProductFactory />
                </TabsContent>

                <TabsContent value="service" className="outline-none">
                    <ServiceFactory />
                </TabsContent>
            </Tabs>
        </div>
    )
}
