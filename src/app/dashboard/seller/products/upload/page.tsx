"use client"

import { useState } from "react";
import { Upload, FileUp, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseCSV, uploadProducts } from "@/services/bulkUploadService";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function BulkUploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<{ success: number; errors: any[] } | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const f = e.target.files[0];
            setFile(f);
            const data = await parseCSV(f);
            setPreview(data.slice(0, 5)); // Preview first 5
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        try {
            const data = await parseCSV(file);
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data: seller } = await supabase.from('sellers').select('id').eq('user_id', user.id).single();
            if (!seller) throw new Error("Seller profile not found");

            const res = await uploadProducts(data, seller.id);
            setResult(res);
            if (res.success > 0) {
                setFile(null);
                setPreview([]);
            }
        } catch (error: any) {
            alert("Upload failed: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = () => {
        const headers = "title,description,base_price,stock_quantity,sku,category_slug,unit,image_url";
        const sample = "Cement Bag,Premium cement,550,100,CEM-001,construction-material,bag,https://example.com/cement.jpg";
        const content = `${headers}\n${sample}`;
        const blob = new Blob([content], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "ghorbari_product_template.csv";
        a.click();
    };

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                    Bulk Product Upload
                </h1>
                <p className="text-neutral-500 mt-1">Upload multiple products via CSV.</p>
            </div>

            <Card className="border-dashed border-2 border-neutral-300 bg-neutral-50">
                <CardContent className="p-12 flex flex-col items-center justify-center space-y-4">
                    <div className="bg-white p-4 rounded-full shadow-sm">
                        <Upload className="w-8 h-8 text-neutral-400" />
                    </div>
                    <div className="text-center">
                        <h3 className="font-bold text-lg">Click to select or drag CSV file</h3>
                        <p className="text-neutral-500 text-sm">Max file size 5MB</p>
                    </div>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                        id="csv-upload"
                    />
                    <label htmlFor="csv-upload">
                        <Button variant="outline" className="cursor-pointer" asChild>
                            <span>Select File</span>
                        </Button>
                    </label>
                    <Button variant="link" onClick={downloadTemplate} className="text-primary-600">
                        Download Template CSV
                    </Button>
                </CardContent>
            </Card>

            {file && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="font-bold flex items-center gap-2">
                            <FileUp className="w-4 h-4" />
                            {file.name}
                        </div>
                        <Button onClick={handleUpload} disabled={uploading}>
                            {uploading ? "Uploading..." : "Start Upload"}
                        </Button>
                    </div>

                    <div className="bg-white rounded border overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-neutral-50 border-b">
                                <tr>
                                    <th className="p-3">Title</th>
                                    <th className="p-3">SKU</th>
                                    <th className="p-3">Price</th>
                                    <th className="p-3">Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {preview.map((row, i) => (
                                    <tr key={i} className="border-b last:border-0 hover:bg-neutral-50/50">
                                        <td className="p-3 font-medium">{row.title}</td>
                                        <td className="p-3 text-neutral-500">{row.sku}</td>
                                        <td className="p-3">৳{row.base_price}</td>
                                        <td className="p-3">{row.stock_quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-2 text-center text-xs text-neutral-400 bg-neutral-50 border-t">
                            Showing first {preview.length} rows
                        </div>
                    </div>
                </div>
            )}

            {result && (
                <div className="space-y-4">
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">Upload Completed</AlertTitle>
                        <AlertDescription className="text-green-700">
                            Successfully uploaded {result.success} products.
                        </AlertDescription>
                    </Alert>

                    {result.errors.length > 0 && (
                        <Alert className="border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertTitle className="text-red-800">Some products failed</AlertTitle>
                            <AlertDescription>
                                <ul className="list-disc pl-4 mt-2 text-xs text-red-700 max-h-32 overflow-y-auto">
                                    {result.errors.map((err, i) => (
                                        <li key={i}>SKU {err.sku}: {err.error}</li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            )}
        </div>
    );
}
