'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, Loader2, CheckCircle2, AlertCircle, Image as ImageIcon, Sun, Moon, Database, ShieldAlert, Copy } from 'lucide-react'
import { uploadBrandAsset, BrandingSettings, checkBrandingHealth } from '@/services/brandingService'
import Image from 'next/image'

interface LogoManagerProps {
    branding: BrandingSettings | null;
    onUpdate: (updatedSettings: BrandingSettings) => void;
}

const SETUP_SQL = `-- 1. Create the bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('brand-assets', 'brand-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set Public Read Access
DROP POLICY IF EXISTS "Branding Public Access" ON storage.objects;
CREATE POLICY "Branding Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'brand-assets');

-- 3. Set Admin Access
DROP POLICY IF EXISTS "Branding Admin Access" ON storage.objects;
CREATE POLICY "Branding Admin Access" ON storage.objects
FOR ALL TO authenticated USING (bucket_id = 'brand-assets');

-- 4. Create Branding Table
CREATE TABLE IF NOT EXISTS branding_settings (
    id BIGINT PRIMARY KEY,
    logo_light_url TEXT,
    logo_dark_url TEXT,
    favicon_url TEXT,
    primary_color TEXT DEFAULT '#f59e0b',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Seed Initial Row
INSERT INTO branding_settings (id, logo_light_url, logo_dark_url)
VALUES (1, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- 6. Enable RLS
ALTER TABLE branding_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Settings" ON branding_settings;
CREATE POLICY "Public Read Settings" ON branding_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin All Settings" ON branding_settings;
CREATE POLICY "Admin All Settings" ON branding_settings FOR ALL TO authenticated USING (true);`;

export function LogoManager({ branding, onUpdate }: LogoManagerProps) {
    const [uploadingType, setUploadingType] = useState<'logo_light' | 'logo_dark' | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [checkingHealth, setCheckingHealth] = useState(true)
    const [health, setHealth] = useState<{ tableStatus: boolean; bucketStatus: boolean; rowExists: boolean } | null>(null)
    
    const lightInputRef = useRef<HTMLInputElement>(null)
    const darkInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        async function runCheck() {
            const h = await checkBrandingHealth();
            setHealth(h);
            setCheckingHealth(false);
        }
        runCheck();
    }, []);

    const copySQL = () => {
        navigator.clipboard.writeText(SETUP_SQL);
        setSuccess('SQL copied to clipboard!');
        setTimeout(() => setSuccess(null), 3000);
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, type: 'logo_light' | 'logo_dark') {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            setError('Please upload a valid image file.')
            return
        }

        setUploadingType(type)
        setError(null)
        setSuccess(null)

        try {
            const publicUrl = await uploadBrandAsset(file, type)
            if (branding) {
                const updatedKey = type === 'logo_light' ? 'logo_light_url' : 'logo_dark_url';
                onUpdate({ ...branding, [updatedKey]: publicUrl })
            }
            setSuccess(`${type === 'logo_light' ? 'Dark Background' : 'Light Background'} logo updated successfully!`)
            setTimeout(() => setSuccess(null), 3000)
        } catch (err: any) {
            console.error('Upload failed', err)
            setError(err.message || 'Failed to upload logo.')
        } finally {
            setUploadingType(null)
        }
    }

    const isSystemReady = health?.tableStatus && health?.bucketStatus;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* System Health Check */}
            {!checkingHealth && !isSystemReady && (
                <Card className="p-8 border-rose-500/30 bg-rose-500/5 rounded-3xl space-y-6">
                    <div className="flex items-center gap-4 text-rose-500">
                        <ShieldAlert className="w-8 h-8" />
                        <div>
                            <h3 className="text-xl font-black italic uppercase tracking-tighter">Infrastructure Setup Required</h3>
                            <p className="text-xs font-bold text-rose-400 opacity-80 uppercase tracking-widest">Missing database tables or storage buckets</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className={`flex-1 p-4 rounded-xl border flex items-center justify-between ${health?.tableStatus ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500' : 'border-rose-500/20 bg-rose-500/5 text-rose-500'}`}>
                                <span className="text-[10px] font-black uppercase tracking-widest">Database Table</span>
                                {health?.tableStatus ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            </div>
                            <div className={`flex-1 p-4 rounded-xl border flex items-center justify-between ${health?.bucketStatus ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500' : 'border-rose-500/20 bg-rose-500/5 text-rose-500'}`}>
                                <span className="text-[10px] font-black uppercase tracking-widest">Storage Bucket</span>
                                {health?.bucketStatus ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            </div>
                        </div>

                        <div className="p-6 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Setup SQL (Run in Supabase Editor)</span>
                                <Button onClick={copySQL} variant="ghost" size="sm" className="h-8 text-neutral-400 hover:text-white px-3 gap-2 uppercase text-[9px] font-black">
                                    <Copy className="w-3 h-3" /> Copy SQL
                                </Button>
                            </div>
                            <pre className="text-[10px] text-neutral-400 font-mono overflow-x-auto p-4 bg-neutral-900 rounded-lg">
                                {SETUP_SQL}
                            </pre>
                        </div>
                    </div>
                </Card>
            )}

            <div className="flex flex-col md:flex-row gap-8">
                {/* Logo for Light Backgrounds (e.g. Website Header) */}
                <Card className={`flex-1 p-8 border-neutral-800 bg-neutral-900 rounded-3xl space-y-6 ${!isSystemReady ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="flex items-center gap-4 border-b border-neutral-800 pb-4">
                        <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-500">
                            <Sun className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">Light Backgrounds</h3>
                            <p className="text-[9px] font-black uppercase text-neutral-500 tracking-widest">For Consumer Web & Apps</p>
                        </div>
                    </div>

                    <div className="h-40 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center p-6 relative group overflow-hidden">
                        {branding?.logo_dark_url ? (
                            <Image 
                                src={branding.logo_dark_url} 
                                alt="Light BG Logo" 
                                width={180}
                                height={60}
                                className="object-contain max-h-full transition-transform group-hover:scale-105"
                                unoptimized
                            />
                        ) : (
                            <div className="text-neutral-300 font-black uppercase text-[9px] tracking-widest">No Asset</div>
                        )}
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <input type="file" ref={lightInputRef} onChange={(e) => handleFileChange(e, 'logo_dark')} className="hidden" accept="image/*" />
                    <Button
                        onClick={() => lightInputRef.current?.click()}
                        disabled={uploadingType === 'logo_dark'}
                        className="w-full h-12 bg-white text-black hover:bg-neutral-200 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                    >
                        {uploadingType === 'logo_dark' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Upload className="w-4 h-4" /> Upload Primary</>}
                    </Button>
                </Card>

                {/* Logo for Dark Backgrounds (e.g. Sidebar, Partner App) */}
                <Card className={`flex-1 p-8 border-neutral-800 bg-neutral-900 rounded-3xl space-y-6 ${!isSystemReady ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="flex items-center gap-4 border-b border-neutral-800 pb-4">
                        <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                            <Moon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">Dark Backgrounds</h3>
                            <p className="text-[9px] font-black uppercase text-neutral-500 tracking-widest">For Admin & Partner Dashboards</p>
                        </div>
                    </div>

                    <div className="h-40 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center p-6 relative group overflow-hidden">
                        {branding?.logo_light_url ? (
                            <Image 
                                src={branding.logo_light_url} 
                                alt="Dark BG Logo" 
                                width={180}
                                height={60}
                                className="object-contain max-h-full transition-transform group-hover:scale-105"
                                unoptimized
                            />
                        ) : (
                            <div className="text-neutral-700 font-black uppercase text-[9px] tracking-widest">No Asset</div>
                        )}
                    </div>

                    <input type="file" ref={darkInputRef} onChange={(e) => handleFileChange(e, 'logo_light')} className="hidden" accept="image/*" />
                    <Button
                        onClick={() => darkInputRef.current?.click()}
                        disabled={uploadingType === 'logo_light'}
                        className="w-full h-12 bg-neutral-800 text-white hover:bg-neutral-700 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 border border-neutral-700"
                    >
                        {uploadingType === 'logo_light' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Upload className="w-4 h-4" /> Upload Inverted</>}
                    </Button>
                </Card>
            </div>

            {(success || error) && (
                <div className={`p-4 rounded-xl flex items-center gap-3 font-bold text-[11px] uppercase tracking-wider animate-in slide-in-from-top-2 ${success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                    {success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {success || error}
                </div>
            )}
        </div>
    )
}
