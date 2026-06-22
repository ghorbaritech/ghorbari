"use client"

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, Trash2, Save, Download, Megaphone, FileText, CheckCircle2, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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

export default function AdminNoticePage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<"banner" | "form" | "submissions">("banner");
  
  // Notice Banner State
  const [bannerActive, setBannerActive] = useState(false);
  const [bannerText, setBannerText] = useState("");
  const [bannerTextBn, setBannerTextBn] = useState("");
  const [actionLink, setActionLink] = useState("/notice/lead-form");
  const [actionText, setActionText] = useState("Apply Now");
  const [actionTextBn, setActionTextBn] = useState("আবেদন করুন");

  // Form Builder State
  const [formTitle, setFormTitle] = useState("Information Request Form");
  const [formTitleBn, setFormTitleBn] = useState("তথ্য অনুরোধ ফর্ম");
  const [formDesc, setFormDesc] = useState("Please fill out this form to submit your request.");
  const [formDescBn, setFormDescBn] = useState("আপনার অনুরোধ জমা দিতে অনুগ্রহ করে এই ফর্মটি পূরণ করুন।");
  const [formFields, setFormFields] = useState<FormField[]>([]);

  // Submissions State
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNoticeBanner();
    fetchFormConfig();
    fetchSubmissions();
  }, []);

  const fetchNoticeBanner = async () => {
    try {
      const { data, error } = await supabase
        .from("home_content")
        .select("*")
        .eq("section_key", "notice_banner")
        .single();
      
      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setBannerActive(data.is_active);
        setBannerText(data.content?.text || "");
        setBannerTextBn(data.content?.text_bn || "");
        setActionLink(data.content?.action_link || "/notice/lead-form");
        setActionText(data.content?.action_text || "Apply Now");
        setActionTextBn(data.content?.action_text_bn || "আবেদন করুন");
      }
    } catch (err: any) {
      console.error("Error fetching notice banner settings:", err.message);
    }
  };

  const fetchFormConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("home_content")
        .select("*")
        .eq("section_key", "notice_landing_page")
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setFormTitle(data.content?.title || "Information Request Form");
        setFormTitleBn(data.content?.title_bn || "তথ্য অনুরোধ ফর্ম");
        setFormDesc(data.content?.description || "");
        setFormDescBn(data.content?.description_bn || "");
        setFormFields(data.content?.fields || []);
      }
    } catch (err: any) {
      console.error("Error fetching landing page config:", err.message);
    }
  };

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("notice_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        // Table might not exist yet, handle gracefully
        if (error.code === "PGRST116" || error.message?.includes("does not exist")) {
          setSubmissions([]);
        } else {
          throw error;
        }
      } else {
        setSubmissions(data || []);
      }
    } catch (err: any) {
      console.error("Error fetching submissions:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBanner = async () => {
    try {
      const content = {
        text: bannerText,
        text_bn: bannerTextBn,
        action_link: actionLink,
        action_text: actionText,
        action_text_bn: actionTextBn
      };

      // Upsert home_content
      const { error } = await supabase
        .from("home_content")
        .upsert({
          section_key: "notice_banner",
          content: content,
          is_active: bannerActive,
          updated_at: new Date()
        }, { onConflict: "section_key" });

      if (error) throw error;
      toast.success("Notice Banner configuration saved successfully!");
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleSaveForm = async () => {
    try {
      const content = {
        title: formTitle,
        title_bn: formTitleBn,
        description: formDesc,
        description_bn: formDescBn,
        fields: formFields
      };

      const { error } = await supabase
        .from("home_content")
        .upsert({
          section_key: "notice_landing_page",
          content: content,
          is_active: true,
          updated_at: new Date()
        }, { onConflict: "section_key" });

      if (error) throw error;
      toast.success("Notice Landing Page form saved successfully!");
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleAddField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: "text",
      label: "New Field",
      label_bn: "নতুন ফিল্ড",
      placeholder: "Enter value",
      placeholder_bn: "তথ্য লিখুন",
      required: false
    };
    setFormFields([...formFields, newField]);
  };

  const handleRemoveField = (index: number) => {
    const updated = formFields.filter((_, i) => i !== index);
    setFormFields(updated);
  };

  const handleFieldChange = (index: number, key: keyof FormField, value: any) => {
    const updated = [...formFields];
    updated[index] = { ...updated[index], [key]: value };
    setFormFields(updated);
  };

  const handleDropdownOptionsChange = (index: number, isBn: boolean, text: string) => {
    const updated = [...formFields];
    const options = text.split(",").map(opt => opt.trim());
    if (isBn) {
      updated[index].options_bn = options;
    } else {
      updated[index].options = options;
    }
    setFormFields(updated);
  };

  const handleExportCSV = () => {
    if (submissions.length === 0) {
      toast.error("No submissions available to export.");
      return;
    }

    // Collect all unique field keys across all submissions
    const keys = Array.from(
      new Set(submissions.flatMap(sub => Object.keys(sub.form_data)))
    );

    // CSV header
    const csvHeader = ["Submitted At", ...keys].join(",");

    // CSV rows
    const csvRows = submissions.map(sub => {
      const date = new Date(sub.created_at).toLocaleString();
      const rowValues = keys.map(key => {
        const val = sub.form_data[key] || "";
        // Clean values to avoid CSV breakage
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      return [date, ...rowValues].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [csvHeader, ...csvRows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Notice_Form_Submissions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Notice Banner & Forms Manager</h1>
          <p className="text-neutral-500 mt-1">Configure your top-bar dynamic notice text, customize a dynamic lead collection landing page, and manage submissions.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 gap-6">
        <button
          onClick={() => setActiveTab("banner")}
          className={`pb-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "banner"
              ? "border-[#0D233A] text-[#0D233A]"
              : "border-transparent text-neutral-400 hover:text-neutral-600"
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Notice Banner
        </button>
        <button
          onClick={() => setActiveTab("form")}
          className={`pb-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "form"
              ? "border-[#0D233A] text-[#0D233A]"
              : "border-transparent text-neutral-400 hover:text-neutral-600"
          }`}
        >
          <FileText className="w-4 h-4" />
          Landing Page Builder
        </button>
        <button
          onClick={() => {
            setActiveTab("submissions");
            fetchSubmissions();
          }}
          className={`pb-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "submissions"
              ? "border-[#0D233A] text-[#0D233A]"
              : "border-transparent text-neutral-400 hover:text-neutral-600"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          View Submissions ({submissions.length})
        </button>
      </div>

      {/* Banner Settings Tab */}
      {activeTab === "banner" && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-lg font-bold text-neutral-900">Configure Top Notice</h2>
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-neutral-600">Active Status:</label>
              <input
                type="checkbox"
                checked={bannerActive}
                onChange={(e) => setBannerActive(e.target.checked)}
                className="w-4 h-4 text-emerald-600 border-neutral-300 rounded focus:ring-emerald-500"
              />
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bannerActive ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-600"}`}>
                {bannerActive ? "Visible" : "Hidden"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">Notice Text (English)</label>
              <textarea
                value={bannerText}
                onChange={(e) => setBannerText(e.target.value)}
                placeholder="Enter notice text in English..."
                className="w-full min-h-[80px] p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#0D233A]/20 focus:border-[#0D233A] text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">Notice Text (Bengali)</label>
              <textarea
                value={bannerTextBn}
                onChange={(e) => setBannerTextBn(e.target.value)}
                placeholder="Enter notice text in Bengali..."
                className="w-full min-h-[80px] p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#0D233A]/20 focus:border-[#0D233A] text-sm font-hind-siliguri"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-neutral-100">
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">Action Button Destination URL</label>
              <Input
                value={actionLink}
                onChange={(e) => setActionLink(e.target.value)}
                placeholder="/notice/lead-form"
                className="rounded-xl h-11 border-neutral-200"
              />
              <span className="text-[10px] text-neutral-400">Default landing form is located at `/notice/lead-form`</span>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">Action Link Label (English)</label>
              <Input
                value={actionText}
                onChange={(e) => setActionText(e.target.value)}
                placeholder="Apply Now"
                className="rounded-xl h-11 border-neutral-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">Action Link Label (Bengali)</label>
              <Input
                value={actionTextBn}
                onChange={(e) => setActionTextBn(e.target.value)}
                placeholder="আবেদন করুন"
                className="rounded-xl h-11 border-neutral-200 font-hind-siliguri"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSaveBanner}
              className="bg-[#0D233A] text-white hover:bg-[#0D233A]/90 px-6 rounded-xl h-11 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Notice settings
            </Button>
          </div>
        </div>
      )}

      {/* Landing Page Builder Tab */}
      {activeTab === "form" && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-neutral-900">Custom Dynamic Lead Form Configuration</h2>
            <p className="text-xs text-neutral-500 mt-1">Design the fields for the notice click action page dynamically.</p>
          </div>

          {/* Form Meta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">Page Header (English)</label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Information Request Form"
                  className="rounded-xl h-11 border-neutral-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">Page Description (English)</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Please complete this form..."
                  className="w-full min-h-[70px] p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#0D233A]/20 focus:border-[#0D233A] text-sm"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">Page Header (Bengali)</label>
                <Input
                  value={formTitleBn}
                  onChange={(e) => setFormTitleBn(e.target.value)}
                  placeholder="তথ্য অনুরোধ ফর্ম"
                  className="rounded-xl h-11 border-neutral-200 font-hind-siliguri"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">Page Description (Bengali)</label>
                <textarea
                  value={formDescBn}
                  onChange={(e) => setFormDescBn(e.target.value)}
                  placeholder="অনুরোধ জমা দিতে অনুগ্রহ করে ফর্মটি পূরণ করুন..."
                  className="w-full min-h-[70px] p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#0D233A]/20 focus:border-[#0D233A] text-sm font-hind-siliguri"
                />
              </div>
            </div>
          </div>

          {/* Form Fields Section */}
          <div className="pt-6 border-t border-neutral-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-bold text-neutral-900">Form Inputs / Fields ({formFields.length})</h3>
              <Button
                onClick={handleAddField}
                variant="outline"
                className="border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl h-10 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Input Field
              </Button>
            </div>

            {formFields.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-neutral-200 rounded-2xl text-neutral-400 text-sm">
                No fields added yet. Click "Add Input Field" above to start designing your form.
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {formFields.map((field, idx) => (
                  <div key={field.id} className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl flex flex-col md:flex-row gap-4 items-start md:items-center relative">
                    <button
                      onClick={() => handleRemoveField(idx)}
                      className="absolute top-2 right-2 md:relative md:top-auto md:right-auto text-neutral-400 hover:text-red-600 transition-colors p-1.5 rounded-full hover:bg-red-50"
                      aria-label="Delete field"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                      {/* Label EN */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Label (EN)</span>
                        <Input
                          value={field.label}
                          onChange={(e) => handleFieldChange(idx, "label", e.target.value)}
                          placeholder="Field Label"
                          className="h-9 border-neutral-200 rounded-lg text-xs"
                        />
                      </div>
                      
                      {/* Label BN */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Label (BN)</span>
                        <Input
                          value={field.label_bn}
                          onChange={(e) => handleFieldChange(idx, "label_bn", e.target.value)}
                          placeholder="লেবেল"
                          className="h-9 border-neutral-200 rounded-lg text-xs font-hind-siliguri"
                        />
                      </div>

                      {/* Type Selector */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Input Type</span>
                        <select
                          value={field.type}
                          onChange={(e: any) => handleFieldChange(idx, "type", e.target.value)}
                          className="w-full h-9 px-3 border border-neutral-200 bg-white rounded-lg text-xs focus:ring-[#0D233A]/20"
                        >
                          <option value="text">Text Box</option>
                          <option value="select">Dropdown Select</option>
                          <option value="email">Email</option>
                          <option value="phone">Phone Number</option>
                          <option value="number">Number Only</option>
                        </select>
                      </div>

                      {/* Required Toggle */}
                      <div className="space-y-1 flex flex-col justify-end pb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-1.5">Settings</span>
                        <label className="flex items-center gap-1.5 text-xs text-neutral-600 font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => handleFieldChange(idx, "required", e.target.checked)}
                            className="w-3.5 h-3.5 border-neutral-300 rounded text-[#0D233A] focus:ring-[#0D233A]"
                          />
                          Is Required Field
                        </label>
                      </div>
                    </div>

                    {/* Special Options panel for dropdown select */}
                    {field.type === "select" && (
                      <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4 border-t sm:border-t-0 sm:border-l border-neutral-200 pt-4 sm:pt-0 sm:pl-4">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">Options (EN, comma separated)</span>
                          <Input
                            value={field.options?.join(", ") || ""}
                            onChange={(e) => handleDropdownOptionsChange(idx, false, e.target.value)}
                            placeholder="Architect, Engineer, Contractor"
                            className="h-9 border-neutral-200 rounded-lg text-xs min-w-[200px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">Options (BN, comma separated)</span>
                          <Input
                            value={field.options_bn?.join(", ") || ""}
                            onChange={(e) => handleDropdownOptionsChange(idx, true, e.target.value)}
                            placeholder="স্থপতি, প্রকৌশলী, ঠিকাদার"
                            className="h-9 border-neutral-200 rounded-lg text-xs min-w-[200px] font-hind-siliguri"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-neutral-100">
            <Button
              onClick={handleSaveForm}
              className="bg-[#0D233A] text-white hover:bg-[#0D233A]/90 px-6 rounded-xl h-11 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Landing Page Form
            </Button>
          </div>
        </div>
      )}

      {/* Submissions Viewer Tab */}
      {activeTab === "submissions" && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Lead Form Submissions</h2>
              <p className="text-xs text-neutral-500 mt-1">Review all submissions captured by the custom form.</p>
            </div>
            <Button
              onClick={handleExportCSV}
              disabled={submissions.length === 0}
              variant="outline"
              className="border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl h-10 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Export to CSV
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-neutral-400 text-sm">
              Loading submissions...
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 text-sm">
              No submissions received yet. Custom notice forms will record values here.
            </div>
          ) : (
            <div className="overflow-x-auto border border-neutral-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider font-bold">
                    <th className="p-3">Submitted At</th>
                    <th className="p-3">Form Values</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-neutral-700">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-neutral-50/50">
                      <td className="p-3 font-semibold whitespace-nowrap">
                        {new Date(sub.created_at).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.entries(sub.form_data).map(([key, val]: any) => (
                            <div key={key} className="bg-neutral-100 p-1.5 rounded-lg border border-neutral-200/50 text-[11px]">
                              <strong className="text-neutral-500 capitalize">{key.replace(/_/g, " ")}:</strong>{" "}
                              <span className="font-medium text-neutral-800">{String(val)}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
