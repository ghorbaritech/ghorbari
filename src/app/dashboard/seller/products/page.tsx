'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
    Plus,
    Search,
    MoreVertical,
    Filter,
    Edit2,
    Trash2,
    AlertCircle,
    CheckCircle2,
    X,
    XCircle,
    Upload
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from 'sonner' // Assuming sonner is used, or alerts
import { parseCSV, generateCSVTemplate } from '@/utils/csvParser'

export default function InventoryPage() {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [categories, setCategories] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [submitting, setSubmitting] = useState(false)

    // Edit State
    const [editingProduct, setEditingProduct] = useState<any>(null)

    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            // Get Seller ID
            const { data: seller } = await supabase.from('sellers').select('id').eq('user_id', user.id).single()

            if (seller) {
                // Fetch Products
                const { data: prods } = await supabase
                    .from('products')
                    .select('*')
                    .eq('seller_id', seller.id)
                    .order('created_at', { ascending: false })
                setProducts(prods || [])

                // Fetch Categories (Top level for now)
                // In a real app we might want the full taxonomy, but let's start with what we have
                const { data: cats } = await supabase
                    .from('product_categories')
                    .select('id, name')
                    .is('parent_id', null)
                    .eq('type', 'product')
                setCategories(cats || [])
            }
        }
        setLoading(false)
    }

    const handleDownloadTemplate = () => {
        const csvContent = generateCSVTemplate();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'ghorbari_product_template.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            alert('Please login first');
            setLoading(false);
            return;
        }

        const { data: seller } = await supabase.from('sellers').select('id').eq('user_id', user.id).single();
        if (!seller) {
            alert('Seller profile not found');
            setLoading(false);
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            try {
                const parsedData = parseCSV(text);
                console.log('Parsed CSV Data:', parsedData);

                if (parsedData.length === 0) {
                    alert('No data found in CSV');
                    setLoading(false);
                    return;
                }

                // Map and Clean Data
                const productsToInsert = parsedData.map(row => ({
                    seller_id: seller.id,
                    title: row.title || 'Untitled Product',
                    sku: row.sku || `SKU-${Math.random().toString(36).substring(7).toUpperCase()}`,
                    // category: row.category, // Mapped to category_id below
                    base_price: parseFloat(row.base_price) || 0,
                    stock_quantity: parseInt(row.stock_quantity) || 0,
                    description: row.description || '',
                    is_quote_only: row.is_quote_only === 'true',
                    status: 'active',
                    images: row.image_url ? [row.image_url] : ['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800'],
                    category_id: categories.find(c => c.name === row.category)?.id || null
                }));

                const { error } = await supabase.from('products').insert(productsToInsert);

                if (error) {
                    console.error('Bulk upload error:', error);
                    alert(`Failed to import products: ${error.message}`);
                } else {
                    alert(`Successfully imported ${productsToInsert.length} products!`);
                    fetchData(); // Refresh list
                }
            } catch (err) {
                console.error('CSV Parse Error:', err);
                alert('Failed to parse CSV file. Please check the format.');
            } finally {
                setLoading(false);
                // Reset input
                event.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    async function handleSaveProduct(formData: FormData) {
        setSubmitting(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: seller } = await supabase.from('sellers').select('id').eq('user_id', user.id).single()
        if (!seller) return // Should warn

        const productData = {
            seller_id: seller.id,
            sku: formData.get('sku') || 'SKU-' + Math.random().toString(36).substring(7).toUpperCase(),
            title: formData.get('title'),
            description: formData.get('description'),
            category_id: formData.get('category'), // Select value is now ID
            base_price: parseFloat(formData.get('price') as string) || 0,
            stock_quantity: parseInt(formData.get('stock') as string) || 0,
            is_quote_only: formData.get('is_quote') === 'on',
            images: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800'],
            status: 'active'
        }

        let error;
        if (editingProduct) {
            const result = await supabase
                .from('products')
                .update(productData)
                .eq('id', editingProduct.id)
                .select()
            error = result.error
        } else {
            const result = await supabase
                .from('products')
                .insert(productData)
                .select()
            error = result.error
        }

        if (!error) {
            // Refresh
            fetchData()
            setShowAddForm(false)
            setEditingProduct(null)
        } else {
            alert('Error saving product: ' + error.message)
        }
        setSubmitting(false)
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this product?')) return

        const { error } = await supabase.from('products').delete().eq('id', id)
        if (!error) {
            setProducts(products.filter(p => p.id !== id))
        }
    }

    // Filter logic
    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-[#F0F2F5] pb-20">
            <div className="max-w-[1600px] mx-auto p-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-neutral-900 tracking-tight italic uppercase">Warehouse Inventory</h1>
                        <p className="text-neutral-500 font-bold uppercase text-xs tracking-widest mt-2">{products.length} Products Types • Full Catalog Management</p>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={() => { setEditingProduct(null); setShowAddForm(true) }} className="h-12 px-8 bg-neutral-900 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl hover:bg-black transition-all">
                            <Plus className="w-4 h-4 mr-2" /> Add New Item
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card className="p-4 mb-8 bg-white rounded-3xl border-none shadow-sm flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 h-14 bg-neutral-50 border-none rounded-2xl font-bold"
                            placeholder="Search by SKU or Name..."
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="h-14 px-6 rounded-2xl border-neutral-200 font-bold text-neutral-600 gap-2">
                            <Filter className="w-4 h-4" /> Filters
                        </Button>
                        <Button variant="outline" className="h-14 px-6 rounded-2xl border-neutral-200 font-bold text-neutral-600 gap-2">
                            Export CSV
                        </Button>
                        <div className="flex gap-2">
                            <input
                                type="file"
                                id="csv-upload"
                                accept=".csv"
                                className="hidden"
                                onChange={handleBulkUpload}
                            />
                            <Button variant="outline" onClick={() => document.getElementById('csv-upload')?.click()} className="h-14 px-6 rounded-2xl border-neutral-200 font-bold text-neutral-600 gap-2 hover:bg-neutral-900 hover:text-white transition-colors">
                                <Upload className="w-4 h-4" /> Import CSV
                            </Button>
                            <Button variant="ghost" onClick={handleDownloadTemplate} className="h-14 px-4 rounded-2xl text-neutral-400 hover:text-neutral-900 font-bold text-xs uppercase tracking-widest">
                                Template
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Table */}
                <div className="bg-white rounded-[40px] shadow-sm overflow-hidden border border-neutral-100 min-h-[400px]">
                    <table className="w-full">
                        <thead className="bg-neutral-50/50">
                            <tr>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-neutral-400 uppercase tracking-widest w-20">Image</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-neutral-400 uppercase tracking-widest">Product Details</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-neutral-400 uppercase tracking-widest">Category</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black text-neutral-400 uppercase tracking-widest">Price (Unit)</th>
                                <th className="px-8 py-6 text-center text-[10px] font-black text-neutral-400 uppercase tracking-widest">Stock</th>
                                <th className="px-8 py-6 text-center text-[10px] font-black text-neutral-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black text-neutral-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {loading ? (
                                <tr><td colSpan={7} className="p-20 text-center font-bold text-neutral-400 animate-pulse">Loading Inventory...</td></tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-300">
                                                <AlertCircle className="w-10 h-10" />
                                            </div>
                                            <p className="font-black text-neutral-900 uppercase">No Products Found</p>
                                            <p className="text-neutral-500 text-sm font-medium">Get started by adding your first product info.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-neutral-50/50 transition-colors group">
                                    <td className="px-8 py-4">
                                        <div className="w-16 h-16 bg-neutral-100 rounded-2xl overflow-hidden">
                                            {product.images?.[0] ? (
                                                <img src={product.images[0]} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-neutral-300 font-black text-xs">NO IMG</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div>
                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">{product.sku || 'NO SKU'}</p>
                                            <p className="font-bold text-neutral-900 text-lg">{product.title}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <Badge variant="secondary" className="bg-neutral-100 text-neutral-600 font-bold border-none">
                                            {categories.find(c => c.id === product.category_id)?.name || 'General'}
                                        </Badge>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <p className="font-black text-neutral-900">৳{product.base_price}</p>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black ${product.stock_quantity > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {product.stock_quantity}
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <div className="inline-flex items-center gap-1.5">
                                            <div className={`w-2 h-2 rounded-full ${product.status === 'active' ? 'bg-green-500' : 'bg-neutral-300'}`} />
                                            <span className="text-xs font-bold uppercase text-neutral-600">{product.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-neutral-200 rounded-lg" onClick={() => { setEditingProduct(product); setShowAddForm(true) }}>
                                                <Edit2 className="w-4 h-4 text-neutral-600" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-red-50 rounded-lg" onClick={() => handleDelete(product.id)}>
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Add/Edit Modal */}
                {showAddForm && (
                    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
                        <Card className="w-full max-w-2xl bg-white rounded-[40px] p-0 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-white sticky top-0 z-10">
                                <div>
                                    <h2 className="text-3xl font-black text-neutral-900 italic tracking-tighter uppercase">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                                    <p className="text-neutral-400 font-bold uppercase text-[10px] tracking-widest">Inventory Management</p>
                                </div>
                                <Button variant="ghost" onClick={() => setShowAddForm(false)} className="rounded-full w-12 h-12 hover:bg-neutral-100">
                                    <X className="w-6 h-6 text-neutral-400" />
                                </Button>
                            </div>

                            <div className="overflow-y-auto p-8 pt-4">
                                <form action={handleSaveProduct} id="product-form" className="space-y-8">
                                    {/* Image Upload Placeholder */}
                                    <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-neutral-200 rounded-3xl bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer group">
                                        <Upload className="w-10 h-10 text-neutral-300 group-hover:text-neutral-500 mb-2" />
                                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Click to upload product image</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Commercial Title</label>
                                            <Input name="title" defaultValue={editingProduct?.title} required className="h-14 rounded-2xl bg-neutral-50 border-none font-bold placeholder:text-neutral-300" placeholder="e.g. ULTRA-STRONG CEMENT" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">SKU (Optional)</label>
                                            <Input name="sku" defaultValue={editingProduct?.sku} className="h-14 rounded-2xl bg-neutral-50 border-none font-bold placeholder:text-neutral-300" placeholder="Auto-generated if empty" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Category</label>
                                            <Select name="category" defaultValue={editingProduct?.category_id}>
                                                <SelectTrigger className="h-14 rounded-2xl bg-neutral-50 border-none font-bold">
                                                    <SelectValue placeholder="Select Category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map(c => (
                                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Base Price (৳)</label>
                                            <Input name="price" type="number" defaultValue={editingProduct?.base_price} required className="h-14 rounded-2xl bg-neutral-50 border-none font-black" placeholder="0.00" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Opening Volume</label>
                                            <Input name="stock" type="number" defaultValue={editingProduct?.stock_quantity} required className="h-14 rounded-2xl bg-neutral-50 border-none font-bold" placeholder="100" />
                                        </div>

                                        <div className="flex items-center space-x-2 col-span-2 bg-neutral-50 p-4 rounded-2xl">
                                            <input type="checkbox" name="is_quote" id="is_quote" defaultChecked={editingProduct?.is_quote_only} className="w-5 h-5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900" />
                                            <label htmlFor="is_quote" className="text-sm font-bold text-neutral-700 cursor-pointer select-none">
                                                Requires Quotation (Hide Price & Add "Ask for Quote" button)
                                            </label>
                                        </div>

                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Description</label>
                                            <textarea name="description" defaultValue={editingProduct?.description} className="w-full h-32 p-4 rounded-2xl bg-neutral-50 border-none font-medium resize-none focus:outline-none focus:ring-2 focus:ring-neutral-200" placeholder="Product details..." />
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="p-8 border-t border-neutral-100 bg-white flex justify-end gap-4 sticky bottom-0 z-10">
                                <Button variant="ghost" onClick={() => setShowAddForm(false)} className="h-14 px-8 rounded-2xl font-bold uppercase text-xs tracking-widest text-neutral-500 hover:bg-neutral-100">Cancel</Button>
                                <Button onClick={() => (document.getElementById('product-form') as HTMLFormElement)?.requestSubmit()} disabled={submitting} className="h-14 px-10 bg-neutral-900 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-neutral-200 hover:bg-black transition-all">
                                    {submitting ? 'Saving...' : (editingProduct ? 'Update Item' : 'Create Item')}
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
