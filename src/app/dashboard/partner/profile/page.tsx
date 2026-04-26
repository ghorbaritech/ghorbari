'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
    User, MapPin, Phone, Mail, Globe, Calendar,
    Package, Star, Image as ImageIcon, FileText,
    CheckCircle2, Edit3, Save, ExternalLink, ShoppingBag, TrendingUp, X
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function SellerProfilePage() {
    const [seller, setSeller] = useState<any>(null)
    const [products, setProducts] = useState<any[]>([])
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [form, setForm] = useState<any>({})
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function load() {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Fetch from all possible role tables
            const [sellerRes, designerRes, serviceRes] = await Promise.all([
                supabase.from('sellers').select('*').eq('user_id', user.id).maybeSingle(),
                supabase.from('designers').select('*').eq('user_id', user.id).maybeSingle(),
                supabase.from('service_providers').select('*').eq('user_id', user.id).maybeSingle()
            ])

            const sel = sellerRes.data || designerRes.data || serviceRes.data
            
            if (sel) {
                const unifiedSeller = {
                    ...sel,
                    business_name: sel.business_name || sel.company_name || 'Your Business',
                    id: sel.id,
                    type: sellerRes.data ? 'seller' : designerRes.data ? 'designer' : 'service_provider'
                }

                setSeller(unifiedSeller)
                setForm({
                    bio: sel.bio || '',
                    shop_photo_url: sel.shop_photo_url || '',
                    gallery_urls: sel.gallery_urls?.join('\n') || '',
                    terms_and_conditions: sel.terms_and_conditions || '',
                    location: sel.location || '',
                    phone: sel.phone || '',
                    email: sel.email || '',
                    website: sel.website || sel.portfolio_url || sel.portfolio || '',
                    founded_year: sel.founded_year || sel.experience_years || '',
                })

                if (unifiedSeller.type === 'seller') {
                    const { data: prods } = await supabase.from('products').select('id, title, base_price, images, status').eq('seller_id', sel.id).limit(6)
                    setProducts(prods || [])
                }
            } else {
                // If no role record exists, use profile data as baseline
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
                setSeller({ business_name: profile?.full_name || 'New Partner', bio: '', location: '', onboarding_status: profile?.onboarding_status })
                setForm({ bio: '', location: '', phone: '', email: profile?.email || '' })
            }
            setLoading(false)
        }
        load()
    }, [])

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        if (!seller) return
        setSaving(true)
        const updates = {
            ...form,
            gallery_urls: form.gallery_urls.split('\n').map((u: string) => u.trim()).filter(Boolean),
            founded_year: parseInt(form.founded_year) || null,
        }
        const { error } = await supabase.from(seller.type === 'seller' ? 'sellers' : seller.type === 'designer' ? 'designers' : 'service_providers').update(updates).eq('id', seller.id)
        if (!error) {
            setSeller({ ...seller, ...updates })
            setSaved(true)
            setTimeout(() => { setSaved(false); setEditing(false) }, 1500)
        }
        setSaving(false)
    }

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
                <p className="text-xs font-black uppercase tracking-widest text-neutral-400">Loading Partner Profile...</p>
            </div>
        </div>
    )

    if (!seller) return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
            <User className="w-12 h-12 text-neutral-200 mb-4" />
            <h2 className="text-xl font-black uppercase italic tracking-tight text-neutral-900">Profile Not Found</h2>
            <p className="text-sm text-neutral-500 font-bold mt-2">We couldn't locate your partner record. Please contact support.</p>
        </div>
    )

    const galleryUrls = seller.gallery_urls?.length > 0 ? seller.gallery_urls : [
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=80',
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80',
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80',
    ]

    return (
        <div className="space-y-6 pb-10">
            {/* ── HEADER ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-neutral-900 uppercase italic tracking-tight">My Public Profile</h1>
                        <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mt-1">This is how customers see you</p>
                    </div>
                    {seller && (
                        <div className={`px-4 py-1.5 rounded-2xl border flex items-center gap-2 animate-in fade-in zoom-in duration-500 ${
                            seller.verification_status === 'verified' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                            seller.verification_status === 'in_review' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                            'bg-neutral-50 border-neutral-200 text-neutral-500'
                        }`}>
                            {seller.verification_status === 'verified' ? <CheckCircle2 className="w-4 h-4" /> : 
                             seller.verification_status === 'in_review' ? <ShoppingBag className="w-4 h-4" /> : 
                             <FileText className="w-4 h-4" />}
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {seller.verification_status?.replace('_', ' ') || 'Pending'}
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex gap-3">
                    {!editing ? (
                        <>
                            <Button
                                onClick={() => setEditing(true)}
                                className="bg-neutral-900 hover:bg-black text-white rounded-xl font-bold gap-2"
                            >
                                <Edit3 className="w-4 h-4" /> Edit Profile
                            </Button>
                            <Link href={`/partner/${seller.id}`} target="_blank">
                                <Button variant="outline" className="rounded-xl border-neutral-200 font-bold gap-2">
                                    <ExternalLink className="w-4 h-4" /> View Live Page
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button
                                onClick={() => setEditing(false)}
                                variant="outline"
                                className="rounded-xl border-neutral-200 gap-2"
                            >
                                <X className="w-4 h-4" /> Cancel
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* ── HERO PREVIEW / EDIT ── */}
            <Card className="overflow-hidden border-none shadow-sm rounded-3xl">
                <div className="relative h-48 bg-neutral-800">
                    {(editing ? form.shop_photo_url : seller.shop_photo_url) && (
                        <Image
                            src={editing ? form.shop_photo_url : seller.shop_photo_url}
                            alt="Shop banner"
                            fill
                            className="object-cover opacity-70"
                            onError={() => { }}
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                        <div>
                            <h2 className="text-2xl font-black text-white">{seller.business_name}</h2>
                            <p className="text-neutral-300 text-sm flex items-center gap-2 mt-1">
                                {(editing ? form.location : seller.location) && (
                                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{editing ? form.location : seller.location}</span>
                                )}
                                {(editing ? form.founded_year : seller.founded_year) && (
                                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Est. {editing ? form.founded_year : seller.founded_year}</span>
                                )}
                            </p>
                        </div>
                    </div>
                    {editing && (
                        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5" /> Paste banner URL below
                        </div>
                    )}
                </div>

                {/* Stats bar */}
                <div className="grid grid-cols-3 divide-x divide-neutral-100 bg-white">
                    <div className="p-5 text-center">
                        <div className="text-xl font-black text-neutral-900">{seller.total_orders || 0}</div>
                        <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1 mt-0.5"><ShoppingBag className="w-3 h-3" />Orders</div>
                    </div>
                    <div className="p-5 text-center">
                        <div className="text-xl font-black text-neutral-900">{products.length}</div>
                        <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1 mt-0.5"><Package className="w-3 h-3" />Products</div>
                    </div>
                    <div className="p-5 text-center">
                        <div className="text-xl font-black text-neutral-900">{seller.rating || '—'}</div>
                        <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1 mt-0.5"><Star className="w-3 h-3" />Rating</div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ── EDIT FORM (left) ── */}
                {editing && (
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="border-none shadow-sm rounded-3xl p-6 md:col-span-2 space-y-4">
                                <h3 className="font-black text-sm uppercase tracking-widest text-neutral-400 flex items-center gap-2"><Edit3 className="w-4 h-4" />Edit Details</h3>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1">Business Summary / Bio</label>
                                    <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} className="w-full p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-neutral-300" placeholder="Tell customers about your business..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1">Location</label>
                                        <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="rounded-xl bg-neutral-50 border-neutral-100" placeholder="e.g. Mirpur, Dhaka" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1">Founded Year</label>
                                        <Input value={form.founded_year} onChange={e => setForm({ ...form, founded_year: e.target.value })} className="rounded-xl bg-neutral-50 border-neutral-100" placeholder="e.g. 2018" type="number" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1">Phone</label>
                                        <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="rounded-xl bg-neutral-50 border-neutral-100" placeholder="+880 17XX XXXXXX" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1">Email</label>
                                        <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="rounded-xl bg-neutral-50 border-neutral-100" placeholder="contact@you.com" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1">Website URL</label>
                                        <Input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} className="rounded-xl bg-neutral-50 border-neutral-100" placeholder="https://yourbusiness.com" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1">Shop Banner Photo URL</label>
                                        <Input value={form.shop_photo_url} onChange={e => setForm({ ...form, shop_photo_url: e.target.value })} className="rounded-xl bg-neutral-50 border-neutral-100" placeholder="https://link-to-shop-photo.jpg" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1">Gallery URLs (one per line — max 6)</label>
                                        <textarea value={form.gallery_urls} onChange={e => setForm({ ...form, gallery_urls: e.target.value })} rows={4} className="w-full p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-neutral-300" placeholder={"https://photo1.jpg\nhttps://photo2.jpg"} />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1">Terms & Conditions</label>
                                        <textarea value={form.terms_and_conditions} onChange={e => setForm({ ...form, terms_and_conditions: e.target.value })} rows={4} className="w-full p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-neutral-300" placeholder="Return policy, delivery terms, etc..." />
                                    </div>
                                </div>
                                <Button type="submit" disabled={saving} className="w-full h-12 bg-neutral-900 text-white font-black uppercase tracking-widest rounded-xl">
                                    {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save All Changes'}
                                </Button>
                            </Card>
                        </form>
                    </div>
                )}

                {/* ── VIEW MODE ── */}
                {!editing && (
                    <>
                        {/* About */}
                        <Card className="border-none shadow-sm rounded-3xl p-6 space-y-3">
                            <h3 className="font-black text-sm uppercase tracking-widest text-neutral-400 flex items-center gap-2"><User className="w-4 h-4" />About</h3>
                            <p className="text-neutral-600 text-sm leading-relaxed">{seller.bio || <span className="text-neutral-300 italic">No bio yet — click Edit Profile to add one.</span>}</p>
                        </Card>

                        {/* Contact */}
                        <Card className="border-none shadow-sm rounded-3xl p-6 space-y-4">
                            <h3 className="font-black text-sm uppercase tracking-widest text-neutral-400">Contact Info</h3>
                            {seller.phone && <div className="flex items-center gap-3 text-sm text-neutral-600"><Phone className="w-4 h-4 text-blue-500" />{seller.phone}</div>}
                            {seller.email && <div className="flex items-center gap-3 text-sm text-neutral-600"><Mail className="w-4 h-4 text-purple-500" />{seller.email}</div>}
                            {seller.website && <div className="flex items-center gap-3 text-sm text-neutral-600"><Globe className="w-4 h-4 text-green-500" />{seller.website}</div>}
                            {!seller.phone && !seller.email && !seller.website && (
                                <p className="text-neutral-300 text-sm italic">No contact details — click Edit Profile.</p>
                            )}
                        </Card>

                        {/* Products preview */}
                        <Card className="border-none shadow-sm rounded-3xl p-6 lg:col-span-2 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-black text-sm uppercase tracking-widest text-neutral-400 flex items-center gap-2"><Package className="w-4 h-4" />Your Products</h3>
                                <Link href="/dashboard/partner/products" className="text-xs font-bold text-neutral-400 hover:text-neutral-900 uppercase tracking-widest">Manage →</Link>
                            </div>
                            {products.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {products.map((p: any) => (
                                        <div key={p.id} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-100 relative">
                                                <Image src={p.images?.[0] || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100'} alt={p.title} fill className="object-cover" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-neutral-900 text-xs truncate">{p.title}</p>
                                                <p className="text-neutral-500 text-xs">৳{parseFloat(p.base_price).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-neutral-300 text-sm italic text-center py-6">No products yet.</p>
                            )}
                        </Card>

                        {/* Gallery preview */}
                        <Card className="border-none shadow-sm rounded-3xl p-6 space-y-4">
                            <h3 className="font-black text-sm uppercase tracking-widest text-neutral-400 flex items-center gap-2"><ImageIcon className="w-4 h-4" />Delivery Gallery</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {galleryUrls.slice(0, 3).map((url: string, i: number) => (
                                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100">
                                        <Image src={url} alt={`Gallery ${i}`} fill className="object-cover" />
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* T&C preview */}
                        <Card className="border-none shadow-sm rounded-3xl p-6 space-y-3">
                            <h3 className="font-black text-sm uppercase tracking-widest text-neutral-400 flex items-center gap-2"><FileText className="w-4 h-4" />Terms & Conditions</h3>
                            {seller.terms_and_conditions ? (
                                <p className="text-neutral-600 text-sm leading-relaxed line-clamp-5">{seller.terms_and_conditions}</p>
                            ) : (
                                <p className="text-neutral-300 text-sm italic">No T&C set yet — click Edit Profile.</p>
                            )}
                        </Card>
                    </>
                )}
            </div>
        </div>
    )
}
