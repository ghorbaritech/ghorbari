'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export default function DebugProductsPage() {
    const [products, setProducts] = useState<any[]>([])
    const [sections, setSections] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            const supabase = createClient()

            // 1. Fetch Products
            const { data: prods } = await supabase
                .from('products')
                .select('id, title, category_id, status, seller_id')
                .order('created_at', { ascending: false })
                .limit(20)

            setProducts(prods || [])

            // 2. Fetch Homepage Config
            const { data: home } = await supabase
                .from('home_content')
                .select('*')
                .filter('section_key', 'eq', 'product_sections')
                .single()

            setSections(home?.content || [])

            // 3. Fetch Categories
            const { data: cats } = await supabase
                .from('product_categories')
                .select('id, name')

            setCategories(cats || [])

            setLoading(false)
        }
        load()
    }, [])

    if (loading) return <div className="p-10">Loading Debug Info...</div>

    return (
        <div className="p-10 font-mono text-sm">
            <h1 className="text-xl font-bold mb-4">Debug: Product Visibility</h1>

            <div className="grid grid-cols-2 gap-8">
                <div className="border p-4">
                    <h2 className="font-bold mb-2">Homepage Sections (What is requested)</h2>
                    {sections.map((s: any, i) => (
                        <div key={i} className="mb-2 p-2 bg-gray-100">
                            <div>Title: {s.title}</div>
                            <div>Category ID Needed: {s.category_id}</div>
                            <div>Category Name: {categories.find(c => c.id === s.category_id)?.name || 'UNKNOWN'}</div>
                        </div>
                    ))}
                </div>

                <div className="border p-4">
                    <h2 className="font-bold mb-2">Latest Products (What exists)</h2>
                    {products.map((p) => {
                        const catName = categories.find(c => c.id === p.category_id)?.name || 'UNKNOWN ID';
                        return (
                            <div key={p.id} className="mb-2 p-2 bg-gray-100 border-l-4 border-blue-500">
                                <div className="font-bold">{p.title}</div>
                                <div>Status: {p.status}</div>
                                <div>Category ID: {p.category_id}</div>
                                <div className="text-blue-600">Category Name: {catName}</div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="mt-8 border p-4 bg-yellow-50">
                <h3 className="font-bold">Analysis</h3>
                <p>Check if "Category ID Needed" matches "Category ID" of the products you want to see.</p>
                <p>If IDs differ, you uploaded to the wrong category, or CMS is pointing to a subcategory.</p>
            </div>
        </div>
    )
}
