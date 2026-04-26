'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
    Plus,
    Search,
    Filter,
    Edit2,
    Trash2,
    AlertCircle,
    X,
    Upload,
    Loader2
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from 'sonner'
import { parseCSV, generateCSVTemplate } from '@/utils/csvParser'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { uploadProductImage } from './actions'

export default function InventoryPage() {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [allCategories, setAllCategories] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [mounted, setMounted] = useState(false)

    const [editingProduct, setEditingProduct] = useState<any>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const [sellerData, setSellerData] = useState<any>(null)
    const [designerData, setDesignerData] = useState<any>(null)
    const [serviceData, setServiceData] = useState<any>(null)
    const [savingDesign, setSavingDesign] = useState(false)
    const [savingService, setSavingService] = useState(false)
    const [localDesignSpecs, setLocalDesignSpecs] = useState<string[]>([])
    const [localServiceTypes, setLocalServiceTypes] = useState<string[]>([])
    const [activeTab, setActiveTab] = useState<string | null>(null)

    const supabase = createClient()

    useEffect(() => {
        setMounted(true)
        fetchData()
    }, [])

    async function fetchData() {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const [sellerRes, designerRes, serviceRes] = await Promise.all([
                supabase.from('sellers').select('id').eq('user_id', user.id).single(),
                supabase.from('designers').select('*').eq('user_id', user.id).single(),
                supabase.from('service_providers').select('*').eq('user_id', user.id).single()
            ])

            if (sellerRes.data) {
                setSellerData(sellerRes.data)
                const { data: prods } = await supabase
                    .from('products')
                    .select('*')
                    .eq('seller_id', sellerRes.data.id)
                    .order('created_at', { ascending: false })
                setProducts(prods || [])
            }

            if (designerRes.data) {
                setDesignerData(designerRes.data)
                setLocalDesignSpecs(designerRes.data.active_specializations?.length ? designerRes.data.active_specializations : (designerRes.data.specializations || []))
            }

            if (serviceRes.data) {
                setServiceData(serviceRes.data)
                setLocalServiceTypes(serviceRes.data.active_service_types?.length ? serviceRes.data.active_service_types : (serviceRes.data.service_types || []))
            }

            // Set initial active tab based on availability
            if (sellerRes.data) setActiveTab("products")
            else if (serviceRes.data) setActiveTab("services")
            else if (designerRes.data) setActiveTab("design")

            // Fetch ALL categories for the partner's allowed types
            const allowedTypes = []
            if (sellerRes.data) allowedTypes.push('product')
            if (serviceRes.data) allowedTypes.push('service')
            if (designerRes.data) allowedTypes.push('design')

            if (allowedTypes.length > 0) {
                const { data: cats } = await supabase
                    .from('product_categories')
                    .select('id, name, name_bn, type')
                    .in('type', allowedTypes)
                setAllCategories(cats || [])
            }

            // Set initial active tab based on availability
            if (sellerRes.data) setActiveTab("products")
            else if (serviceRes.data) setActiveTab("services")
            else if (designerRes.data) setActiveTab("design")
        }
        setLoading(false)
    }

    const handleDownloadTemplate = () => {
        const csvContent = generateCSVTemplate();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'dalankotha_product_template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            toast.error('Please login first');
            setLoading(false);
            return;
        }

        const { data: seller } = await supabase.from('sellers').select('id').eq('user_id', user.id).single();
        if (!seller) {
            toast.error('Seller profile not found');
            setLoading(false);
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            try {
                const parsedData = parseCSV(text);
                if (parsedData.length === 0) {
                    toast.error('No data found in CSV');
                    setLoading(false);
                    return;
                }

                const productsToInsert = parsedData.map(row => ({
                    seller_id: seller.id,
                    title: row.title || 'Untitled Product',
                    sku: row.sku || `SKU-${Math.random().toString(36).substring(7).toUpperCase()}`,
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
                    toast.error(`Failed to import: ${error.message}`);
                } else {
                    toast.success(`Imported ${productsToInsert.length} products!`);
                    fetchData();
                }
            } catch (err) {
                toast.error('CSV Parse Error');
            } finally {
                setLoading(false);
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
        if (!seller) return

        let finalImageUrl = editingProduct?.images?.[0] || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800';

        if (imageFile) {
            const uploadData = new FormData();
            uploadData.append('file', imageFile);
            const result = await uploadProductImage(uploadData);
            if (result.error) {
                toast.error('Error uploading image');
                setSubmitting(false);
                return;
            }
            if (result.publicUrl) finalImageUrl = result.publicUrl;
        }

        const productData = {
            seller_id: seller.id,
            sku: formData.get('sku') || 'SKU-' + Math.random().toString(36).substring(7).toUpperCase(),
            title: formData.get('title'),
            description: formData.get('description'),
            category_id: formData.get('category'),
            base_price: parseFloat(formData.get('price') as string) || 0,
            stock_quantity: parseInt(formData.get('stock') as string) || 0,
            is_quote_only: formData.get('is_quote') === 'on',
            images: [finalImageUrl],
            status: 'active'
        }

        let error;
        if (editingProduct) {
            const result = await supabase.from('products').update(productData).eq('id', editingProduct.id)
            error = result.error
        } else {
            const result = await supabase.from('products').insert(productData)
            error = result.error
        }

        if (!error) {
            fetchData()
            setShowAddForm(false)
            setEditingProduct(null)
            toast.success('Product saved!')
        } else {
            toast.error('Error saving: ' + error.message)
        }
        setSubmitting(false)
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this product?')) return
        const { error } = await supabase.from('products').delete().eq('id', id)
        if (!error) {
            setProducts(products.filter(p => p.id !== id))
            toast.success('Deleted')
        }
    }

    const toggleDesignSpec = (spec: string) => {
        setLocalDesignSpecs(prev => prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec])
    }

    const toggleServiceType = (type: string) => {
        setLocalServiceTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
    }

    async function handleSaveDesign() {
        setSavingDesign(true)
        const { error } = await supabase.from('designers').update({ active_specializations: localDesignSpecs }).eq('id', designerData.id)
        if (!error) {
            toast.success('Design coverages updated!')
            setDesignerData({ ...designerData, active_specializations: localDesignSpecs })
        } else {
            toast.error('Error updating: ' + error.message)
        }
        setSavingDesign(false)
    }

    async function handleSaveService() {
        setSavingService(true)
        const { error } = await supabase.from('service_providers').update({ active_service_types: localServiceTypes }).eq('id', serviceData.id)
        if (!error) {
            toast.success('Service offerings updated!')
            setServiceData({ ...serviceData, active_service_types: localServiceTypes })
        } else {
            toast.error('Error updating: ' + error.message)
        }
        setSavingService(false)
    }

    const filteredProducts = products.filter(p =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-[#F0F2F5] pb-20">
            <div className="max-w-[1600px] mx-auto p-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-neutral-900 tracking-tight italic uppercase font-sans">Warehouse Inventory</h1>
                        <p className="text-neutral-500 font-bold uppercase text-[10px] tracking-widest mt-2 font-sans">Manage your catalog and service coverages</p>
                    </div>
                </div>

                {!mounted ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 font-sans">Initializing Dashboard...</p>
                    </div>
                ) : !activeTab ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <AlertCircle className="w-10 h-10 text-neutral-300" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 font-sans">No Authorized Scope Found</p>
                        <p className="text-neutral-400 text-xs font-medium">Please contact admin if your agreement is signed.</p>
                    </div>
                ) : (
                    <>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="mb-8 flex justify-start h-14 bg-white rounded-2xl p-2 gap-2 shadow-sm border border-neutral-100 overflow-x-auto w-max">
                                {sellerData && <TabsTrigger value="products" className="h-full px-8 rounded-xl font-bold data-[state=active]:bg-neutral-900 data-[state=active]:text-white transition-all text-neutral-500 hover:text-neutral-900 uppercase text-[10px] tracking-widest font-sans">Product</TabsTrigger>}
                                {serviceData && <TabsTrigger value="services" className="h-full px-8 rounded-xl font-bold data-[state=active]:bg-neutral-900 data-[state=active]:text-white transition-all text-neutral-500 hover:text-neutral-900 uppercase text-[10px] tracking-widest font-sans">Service</TabsTrigger>}
                                {designerData && <TabsTrigger value="design" className="h-full px-8 rounded-xl font-bold data-[state=active]:bg-neutral-900 data-[state=active]:text-white transition-all text-neutral-500 hover:text-neutral-900 uppercase text-[10px] tracking-widest font-sans">Design</TabsTrigger>}
                            </TabsList>

                            <TabsContent value="products" className="mt-0 outline-none">
                                <div className="flex justify-between items-center mb-6">
                                    <p className="text-neutral-500 font-bold uppercase text-xs tracking-widest leading-none mt-2 font-sans">{products.length} Products Types</p>
                                    <Button onClick={() => {
                                        setEditingProduct(null);
                                        setImageFile(null);
                                        setImagePreview(null);
                                        setShowAddForm(true);
                                    }} className="h-12 px-8 bg-neutral-900 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl hover:bg-black transition-all font-sans">
                                        <Plus className="w-4 h-4 mr-2" /> Add New Item
                                    </Button>
                                </div>

                                <Card className="p-4 mb-8 bg-white rounded-3xl border-none shadow-sm flex flex-col md:flex-row gap-4 items-center">
                                    <div className="relative flex-1 w-full">
                                        <Input
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-12 h-14 bg-neutral-50 border-none rounded-2xl font-bold font-sans"
                                            placeholder="Search by SKU or Name..."
                                        />
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="h-14 px-6 rounded-2xl border-neutral-200 font-bold text-neutral-600 gap-2 font-sans">
                                            <Filter className="w-4 h-4" /> Filters
                                        </Button>
                                        <div className="flex gap-2">
                                            <input type="file" id="csv-upload" accept=".csv" className="hidden" onChange={handleBulkUpload} />
                                            <Button variant="outline" onClick={() => document.getElementById('csv-upload')?.click()} className="h-14 px-6 rounded-2xl border-neutral-200 font-bold text-neutral-600 gap-2 hover:bg-neutral-900 hover:text-white transition-colors font-sans">
                                                <Upload className="w-4 h-4" /> Import CSV
                                            </Button>
                                            <Button variant="ghost" onClick={handleDownloadTemplate} className="h-14 px-4 rounded-2xl text-neutral-400 hover:text-neutral-900 font-bold text-xs uppercase tracking-widest font-sans">Template</Button>
                                        </div>
                                    </div>
                                </Card>

                                <div className="bg-white rounded-[40px] shadow-sm overflow-hidden border border-neutral-100 min-h-[400px]">
                                    <table className="w-full">
                                        <thead className="bg-neutral-50/50">
                                            <tr className="font-sans">
                                                <th className="px-8 py-6 text-left text-[10px] font-black text-neutral-400 uppercase tracking-widest w-20">Image</th>
                                                <th className="px-8 py-6 text-left text-[10px] font-black text-neutral-400 uppercase tracking-widest">Product Details</th>
                                                <th className="px-8 py-6 text-left text-[10px] font-black text-neutral-400 uppercase tracking-widest">Category</th>
                                                <th className="px-8 py-6 text-right text-[10px] font-black text-neutral-400 uppercase tracking-widest">Price (Unit)</th>
                                                <th className="px-8 py-6 text-center text-[10px] font-black text-neutral-400 uppercase tracking-widest">Stock</th>
                                                <th className="px-8 py-6 text-center text-[10px] font-black text-neutral-400 uppercase tracking-widest">Status</th>
                                                <th className="px-8 py-6 text-right text-[10px] font-black text-neutral-400 uppercase tracking-widest">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100 font-sans">
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
                                                                <div className="w-full h-full flex items-center justify-center text-neutral-300 font-black text-[10px]">NO IMG</div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <div>
                                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">{product.sku || 'NO SKU'}</p>
                                                            <p className="font-bold text-neutral-900 text-base">{product.title}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <Badge variant="secondary" className="bg-neutral-100 text-neutral-600 font-bold border-none text-[10px] px-3 py-1 uppercase tracking-wider">
                                                            {allCategories.find(c => c.id === product.category_id)?.name || 'General'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-8 py-4 text-right">
                                                        <p className="font-black text-neutral-900">৳{product.base_price}</p>
                                                    </td>
                                                    <td className="px-8 py-4 text-center">
                                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black ${product.stock_quantity > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {product.stock_quantity}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-4 text-center">
                                                        <Badge className={product.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-neutral-50 text-neutral-400'} variant="outline">
                                                            {product.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-8 py-4 text-right">
                                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-neutral-200" onClick={() => {
                                                                setEditingProduct(product);
                                                                setImagePreview(product.images?.[0] || null);
                                                                setShowAddForm(true);
                                                            }}><Edit2 className="w-4 h-4" /></Button>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-red-50 text-red-500" onClick={() => handleDelete(product.id)}><Trash2 className="w-4 h-4" /></Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </TabsContent>

                            {designerData && (
                                <TabsContent value="design" className="mt-0 outline-none">
                                    <Card className="p-8 bg-white rounded-[40px] border border-neutral-100 shadow-sm">
                                        <h2 className="text-2xl font-black text-neutral-900 uppercase italic tracking-tight mb-2 font-sans">Active Design Coverages</h2>
                                        <p className="text-neutral-500 font-bold text-sm mb-8 font-sans italic">Select categories to showcase on your profile</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 font-sans">
                                            {(designerData.specializations || []).map((specId: string) => {
                                                const cat = allCategories.find(c => c.id === specId)
                                                const label = cat ? (cat.name_bn ? `${cat.name} (${cat.name_bn})` : cat.name) : specId
                                                return (
                                                    <label key={specId} className="flex items-start space-x-3 p-5 rounded-[25px] bg-neutral-50 hover:bg-neutral-100 transition-all border border-transparent hover:border-neutral-200 cursor-pointer">
                                                        <Checkbox
                                                            id={`design-${specId}`}
                                                            checked={localDesignSpecs.includes(specId)}
                                                            onCheckedChange={() => toggleDesignSpec(specId)}
                                                            className="mt-1"
                                                        />
                                                        <span className="text-xs font-black text-neutral-800 uppercase tracking-widest">{label}</span>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                        <div className="flex justify-end pt-6 border-t border-neutral-100">
                                            <Button onClick={handleSaveDesign} disabled={savingDesign} className="h-12 px-10 bg-neutral-900 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl font-sans">
                                                {savingDesign ? 'Saving...' : 'Sync Design Scope'}
                                            </Button>
                                        </div>
                                    </Card>
                                </TabsContent>
                            )}

                            {serviceData && (
                                <TabsContent value="services" className="mt-0 outline-none">
                                    <Card className="p-8 bg-white rounded-[40px] border border-neutral-100 shadow-sm">
                                        <h2 className="text-2xl font-black text-neutral-900 uppercase italic tracking-tight mb-2 font-sans">Active Service Offerings</h2>
                                        <p className="text-neutral-500 font-bold text-sm mb-8 font-sans italic tracking-wide">Manage your available services in the marketplace</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 font-sans">
                                            {(serviceData.service_types || []).map((typeId: string) => {
                                                const cat = allCategories.find(c => c.id === typeId)
                                                const label = cat ? (cat.name_bn ? `${cat.name} (${cat.name_bn})` : cat.name) : typeId
                                                return (
                                                    <label key={typeId} className="flex items-start space-x-3 p-5 rounded-[25px] bg-neutral-50 hover:bg-neutral-100 transition-all border border-transparent hover:border-neutral-200 cursor-pointer">
                                                        <Checkbox
                                                            id={`service-${typeId}`}
                                                            checked={localServiceTypes.includes(typeId)}
                                                            onCheckedChange={() => toggleServiceType(typeId)}
                                                            className="mt-1"
                                                        />
                                                        <span className="text-xs font-black text-neutral-800 uppercase tracking-widest">{label}</span>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                        <div className="flex justify-end pt-6 border-t border-neutral-100">
                                            <Button onClick={handleSaveService} disabled={savingService} className="h-12 px-10 bg-neutral-900 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl font-sans">
                                                {savingService ? 'Saving...' : 'Sync Service Scope'}
                                            </Button>
                                        </div>
                                    </Card>
                                </TabsContent>
                            )}
                        </Tabs>

                        {showAddForm && (
                            <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
                                <Card className="w-full max-w-2xl bg-white rounded-[40px] p-0 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] font-sans">
                                    <div className="p-8 border-b border-neutral-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                        <h2 className="text-2xl font-black text-neutral-900 uppercase italic tracking-tighter">{editingProduct ? 'Edit Catalog Item' : 'New Catalog Item'}</h2>
                                        <Button variant="ghost" onClick={() => setShowAddForm(false)} className="rounded-full w-10 h-10 p-0 hover:bg-neutral-100">
                                            <X className="w-5 h-5 text-neutral-400" />
                                        </Button>
                                    </div>

                                    <div className="overflow-y-auto p-8 flex-1">
                                        <form id="product-form" action={handleSaveProduct as any} className="space-y-6">
                                            <div onClick={() => document.getElementById('image-upload')?.click()} className="h-48 border-2 border-dashed border-neutral-200 rounded-3xl bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer relative overflow-hidden group">
                                                {imagePreview ? (
                                                    <img src={imagePreview} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-300">
                                                        <Upload className="w-8 h-8 mb-2" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest">Upload Photo</p>
                                                    </div>
                                                )}
                                                <input type="file" id="image-upload" accept="image/*" className="hidden" onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
                                                }} />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2 space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest pl-1">Title</label>
                                                    <Input name="title" defaultValue={editingProduct?.title} required className="h-12 rounded-xl" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest pl-1">SKU</label>
                                                    <Input name="sku" defaultValue={editingProduct?.sku} className="h-12 rounded-xl" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest pl-1">Category</label>
                                                    <Select name="category" defaultValue={editingProduct?.category_id}>
                                                        <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                                                        <SelectContent className="z-[200]">
                                                            {allCategories.filter(c => c.type === 'product').map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest pl-1">Price (৳)</label>
                                                    <Input name="price" type="number" defaultValue={editingProduct?.base_price} step="0.01" className="h-12 rounded-xl" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest pl-1">Stock</label>
                                                    <Input name="stock" type="number" defaultValue={editingProduct?.stock_quantity} className="h-12 rounded-xl" />
                                                </div>
                                                <div className="col-span-2 flex items-center space-x-2 bg-neutral-50 p-4 rounded-xl">
                                                    <Checkbox id="is_quote" name="is_quote" defaultChecked={editingProduct?.is_quote_only} />
                                                    <label htmlFor="is_quote" className="text-xs font-bold text-neutral-600">Requires manual quotation</label>
                                                </div>
                                                <div className="col-span-2 space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest pl-1">Description</label>
                                                    <textarea name="description" defaultValue={editingProduct?.description} className="w-full h-32 p-4 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900" />
                                                </div>
                                            </div>
                                        </form>
                                    </div>

                                    <div className="p-8 border-t border-neutral-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                                        <Button variant="ghost" onClick={() => setShowAddForm(false)} className="h-12 px-8 uppercase text-[10px] font-black tracking-widest text-neutral-400">Cancel</Button>
                                        <Button onClick={() => (document.getElementById('product-form') as any)?.requestSubmit()} disabled={submitting} className="h-12 px-10 bg-neutral-900 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-neutral-100">
                                            {submitting ? 'Syncing...' : 'Save Catalog Item'}
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
