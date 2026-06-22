"use client"

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { createClient } from "@/utils/supabase/client";
import { CheckCircle2, ChevronLeft, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";

interface FormField {
  id: string;
  type: "text" | "select" | "email" | "phone" | "number";
  label: string;
  label_bn: string;
  placeholder: string;
  placeholder_bn: string;
  required: boolean;
  options?: string[];
  options_bn?: string[];
}

export default function NoticeLeadFormPage() {
  const { language, t } = useLanguage();
  const supabase = createClient();
  const [logoUrl, setLogoUrl] = useState<string>("/logo-dalankotha-white-bg.png");

  // Form Details State
  const [formTitle, setFormTitle] = useState("");
  const [formTitleBn, setFormTitleBn] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDescBn, setFormDescBn] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  
  // Loading & Submission State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchFormConfig();
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    const { data } = await supabase.from("branding_settings").select("logo_dark_url").eq("id", 1).single();
    if (data?.logo_dark_url) setLogoUrl(data.logo_dark_url);
  };

  const fetchFormConfig = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("home_content")
        .select("*")
        .eq("section_key", "notice_landing_page")
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setFormTitle(data.content?.title || "Lead Form");
        setFormTitleBn(data.content?.title_bn || "লিড ফর্ম");
        setFormDesc(data.content?.description || "");
        setFormDescBn(data.content?.description_bn || "");
        setFields(data.content?.fields || []);
        
        // Initialize form data
        const initialData: Record<string, any> = {};
        data.content?.fields?.forEach((f: FormField) => {
          initialData[f.id] = "";
        });
        setFormData(initialData);
      }
    } catch (err: any) {
      console.error("Error loading form configuration:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData({
      ...formData,
      [fieldId]: value
    });
    // Clear validation error when typing
    if (errors[fieldId]) {
      setErrors({
        ...errors,
        [fieldId]: ""
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    fields.forEach(field => {
      const val = formData[field.id]?.trim();
      
      if (field.required && !val) {
        newErrors[field.id] = language === "EN" ? "This field is required" : "এই তথ্যটি প্রদান করা আবশ্যক";
        return;
      }

      if (val) {
        if (field.type === "email" && !/\S+@\S+\.\S+/.test(val)) {
          newErrors[field.id] = language === "EN" ? "Please enter a valid email address" : "সঠিক ইমেইল ঠিকানা প্রদান করুন";
        }
        if (field.type === "phone" && !/^\+?[0-9\s-]{8,15}$/.test(val)) {
          newErrors[field.id] = language === "EN" ? "Please enter a valid phone number" : "সঠিক ফোন নম্বর প্রদান করুন";
        }
        if (field.type === "number" && isNaN(Number(val))) {
          newErrors[field.id] = language === "EN" ? "Please enter numbers only" : "শুধুমাত্র সংখ্যা প্রদান করুন";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      const response = await fetch("/api/notice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData })
      });

      if (!response.ok) {
        throw new Error(language === "EN" ? "Failed to submit form responses." : "ফরম জমা দিতে ব্যর্থ হয়েছে।");
      }

      setSubmitted(true);
      toast.success(language === "EN" ? "Submitted successfully!" : "সফলভাবে জমা দেওয়া হয়েছে!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D233A]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-between font-sans">
      {/* Mini header */}
      <header className="bg-white border-b border-neutral-200 py-4 shadow-sm">
        <div className="section-container flex items-center justify-between">
          <Link href="/" className="relative w-40 h-10 block">
            <Image src={logoUrl} alt="Dalankotha Logo" fill className="object-contain object-left" />
          </Link>
          <Link href="/" className="text-xs font-semibold text-neutral-600 hover:text-[#0D233A] flex items-center gap-1 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            {language === "EN" ? "Back to Home" : "হোমপেজে ফিরুন"}
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6 my-10">
        <div className="w-full max-w-lg bg-white border border-neutral-200 rounded-3xl shadow-sm overflow-hidden">
          {/* Header highlight bar matching brand colors */}
          <div className="h-2 bg-[#0D233A] w-full" />
          
          <div className="p-8">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center md:text-left">
                  <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 leading-tight">
                    {language === "EN" ? formTitle : formTitleBn}
                  </h1>
                  {(formDesc || formDescBn) && (
                    <p className="text-sm text-neutral-500 mt-2 font-medium">
                      {language === "EN" ? formDesc : formDescBn}
                    </p>
                  )}
                </div>

                {fields.length === 0 ? (
                  <div className="text-center py-6 text-neutral-400 text-sm border border-dashed rounded-2xl">
                    {language === "EN" 
                      ? "Form inputs are currently being set up. Please try again later."
                      : "ফরম ইনপুটগুলো কনফিগার করা হচ্ছে। অনুগ্রহ করে একটু পরে আবার চেষ্টা করুন।"}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {fields.map((field) => {
                      const fieldLabel = language === "EN" ? field.label : field.label_bn;
                      const fieldPlaceholder = language === "EN" ? field.placeholder : field.placeholder_bn;
                      
                      return (
                        <div key={field.id} className="space-y-1.5">
                          <label className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                            {fieldLabel}
                            {field.required && <span className="text-red-500 font-bold">*</span>}
                          </label>

                          {field.type === "select" ? (
                            <select
                              value={formData[field.id] || ""}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                              className={`w-full h-11 px-3.5 bg-neutral-50 border ${
                                errors[field.id] ? "border-red-500 focus:ring-red-500/20" : "border-neutral-200 focus:ring-[#0D233A]/20 focus:border-[#0D233A]"
                              } rounded-xl text-sm transition-all focus:ring-2`}
                            >
                              <option value="" disabled>
                                {language === "EN" ? "Select an option..." : "নির্বাচন করুন..."}
                              </option>
                              {(language === "EN" ? field.options : field.options_bn)?.map((opt: string) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <Input
                              type={field.type === "number" ? "text" : field.type}
                              value={formData[field.id] || ""}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                              placeholder={fieldPlaceholder}
                              className={`bg-neutral-50 border h-11 rounded-xl text-sm ${
                                errors[field.id] ? "border-red-500 focus:ring-red-500/20" : "border-neutral-200"
                              }`}
                            />
                          )}

                          {errors[field.id] && (
                            <p className="text-[11px] text-red-500 font-semibold pl-1">{errors[field.id]}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {fields.length > 0 && (
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#0D233A] text-white hover:bg-[#0D233A]/90 h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {language === "EN" ? "Submit Details" : "তথ্য জমা দিন"}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                )}
              </form>
            ) : (
              <div className="text-center py-8 space-y-5 flex flex-col items-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-bounce" />
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">
                    {language === "EN" ? "Submission Successful!" : "সফলভাবে জমা দেওয়া হয়েছে!"}
                  </h2>
                  <p className="text-sm text-neutral-500 mt-2 font-medium px-4">
                    {language === "EN" 
                      ? "Thank you! We have received your submission and will get in touch soon."
                      : "ধন্যবাদ! আমরা আপনার তথ্য পেয়েছি এবং শীঘ্রই আপনার সাথে যোগাযোগ করব।"}
                  </p>
                </div>
                <div className="w-full pt-4">
                  <Button asChild className="w-full bg-[#0D233A] text-white hover:bg-[#0D233A]/90 h-12 rounded-xl text-sm font-bold">
                    <Link href="/">
                      {language === "EN" ? "Return to Homepage" : "হোমপেজে ফিরে যান"}
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mini footer */}
      <footer className="bg-neutral-950 text-neutral-400 py-6 border-t border-neutral-800 text-xs text-center font-medium">
        <div className="section-container">
          <p>© {new Date().getFullYear()} Dalankotha. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
