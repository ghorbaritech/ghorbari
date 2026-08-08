import React from "react";
import Image from "next/image";
import { X, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface LineItem {
    description: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

interface ProposalInvoiceProps {
    isOpen: boolean;
    onClose: () => void;
    booking: any;
    offer: {
        amount: number;
        notes?: string;
        date: string;
        line_items?: LineItem[];
    } | null;
}

export function ProposalInvoice({ isOpen, onClose, booking, offer }: ProposalInvoiceProps) {
    if (!offer) return null;

    const lineItems = offer.line_items || [
        {
            description: offer.notes || "Design & Consultancy Services Quote",
            unit: "Project",
            quantity: 1,
            unitPrice: offer.amount,
            total: offer.amount
        }
    ];

    const customer = booking.profiles || {};
    const bookingId = booking.id ? booking.id.slice(0, 8) : "";
    const dateFormatted = offer.date ? new Date(offer.date).toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : new Date().toLocaleDateString("en-US");

    const handlePrint = () => {
        const printContent = document.getElementById("invoice-print-area");
        if (!printContent) return;

        const originalBody = document.body.innerHTML;
        const printHTML = printContent.outerHTML;

        // Open a new print window to avoid ruining the current page state
        const printWindow = window.open("", "_blank");
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Quotation - ${bookingId}</title>
                    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                    <style>
                        body {
                            background-color: white;
                            color: black;
                            font-family: system-ui, -apple-system, sans-serif;
                            padding: 40px;
                        }
                        @media print {
                            body {
                                padding: 0;
                            }
                            .no-print {
                                display: none;
                            }
                        }
                    </style>
                </head>
                <body>
                    ${printHTML}
                    <script>
                        window.onload = function() {
                            window.print();
                            window.close();
                        }
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-3xl bg-neutral-900 border-neutral-800 text-white rounded-3xl p-0 overflow-hidden">
                <DialogHeader className="p-6 border-b border-neutral-800 flex flex-row justify-between items-center bg-neutral-900/50">
                    <div className="space-y-1">
                        <DialogTitle className="text-base font-black uppercase tracking-widest text-blue-400">Proposal Invoice View</DialogTitle>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Review and print the line-item based price quotation.</p>
                    </div>
                </DialogHeader>

                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    {/* Invoice Card Print Area */}
                    <div id="invoice-print-area" className="bg-white text-neutral-900 p-8 rounded-2xl shadow-sm border border-neutral-100">
                        {/* Invoice Header */}
                        <div className="flex justify-between items-start mb-8 pb-8 border-b border-neutral-200">
                            <div>
                                <div className="relative w-44 h-11 mb-3">
                                    <img
                                        src="/logo-dalankotha-dark.png"
                                        alt="Dalan Kotha Logo"
                                        className="object-contain object-left w-full h-full"
                                    />
                                </div>
                                <p className="text-xs text-neutral-500 font-bold uppercase tracking-wide">Premium Design & Engineering Solutions</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-xl font-black uppercase tracking-wider text-neutral-800">PRICE QUOTATION</h2>
                                <p className="text-xs text-neutral-400 font-bold uppercase mt-1">Ref: #DK-DSN-${bookingId}</p>
                                <p className="text-xs text-neutral-400 font-bold uppercase">Date: {dateFormatted}</p>
                            </div>
                        </div>

                        {/* Customer & Company Details */}
                        <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-neutral-200">
                            <div>
                                <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">QUOTED TO:</h3>
                                <p className="font-extrabold text-sm text-neutral-800">{customer.full_name || "Valued Client"}</p>
                                {customer.email && <p className="text-xs text-neutral-500 font-medium mt-0.5">{customer.email}</p>}
                                {customer.phone_number && <p className="text-xs text-neutral-500 font-medium mt-0.5">{customer.phone_number}</p>}
                                {booking.details?.projectAddress && (
                                    <p className="text-xs text-neutral-500 font-medium mt-1">Site: {booking.details.projectAddress}</p>
                                )}
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">PREPARED BY:</h3>
                                <p className="font-extrabold text-sm text-neutral-800">Dalan Kotha Limited</p>
                                <p className="text-xs text-neutral-500 font-medium mt-0.5">Dhaka Office, Bangladesh</p>
                                <p className="text-xs text-neutral-500 font-medium mt-0.5">Email: support@dalan-kotha.com</p>
                                <p className="text-xs text-neutral-500 font-medium mt-0.5">Phone: +8801944543098</p>
                            </div>
                        </div>

                        {/* Line Items Table */}
                        <table className="w-full text-left border-collapse mb-8">
                            <thead>
                                <tr className="border-b border-neutral-300 bg-neutral-50 text-[10px] font-black text-neutral-500 uppercase tracking-wider">
                                    <th className="py-3 px-4">#</th>
                                    <th className="py-3 px-4">Item Description</th>
                                    <th className="py-3 px-4">Unit</th>
                                    <th className="py-3 px-4 text-right">Qty</th>
                                    <th className="py-3 px-4 text-right">Unit Price</th>
                                    <th className="py-3 px-4 text-right">Total Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lineItems.map((item, idx) => (
                                    <tr key={idx} className="border-b border-neutral-100 text-xs font-semibold text-neutral-800 hover:bg-neutral-50/50">
                                        <td className="py-4 px-4 text-neutral-400">{idx + 1}</td>
                                        <td className="py-4 px-4 font-bold">{item.description}</td>
                                        <td className="py-4 px-4 text-neutral-500 uppercase tracking-wide">{item.unit || "-"}</td>
                                        <td className="py-4 px-4 text-right font-medium">{item.quantity}</td>
                                        <td className="py-4 px-4 text-right font-medium">৳{Number(item.unitPrice).toLocaleString()}</td>
                                        <td className="py-4 px-4 text-right font-bold text-neutral-900">৳{Number(item.total).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Grand Total */}
                        <div className="flex justify-between items-start">
                            <div className="max-w-md">
                                {offer.notes && (
                                    <>
                                        <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">Proposal Notes:</h4>
                                        <p className="text-xs text-neutral-500 leading-relaxed font-medium">{offer.notes}</p>
                                    </>
                                )}
                            </div>
                            <div className="text-right min-w-[200px] bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">TOTAL AMOUNT DUE</span>
                                <span className="text-2xl font-black text-neutral-900">৳{offer.amount.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="mt-12 pt-6 border-t border-neutral-200 text-center">
                            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                                Thank you for choosing Dalan Kotha. This quotation is valid for 30 days from date of issue.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-neutral-800 bg-neutral-950/60 flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="h-11 border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl font-bold uppercase tracking-wider text-[10px]"
                    >
                        Close
                    </Button>
                    <Button
                        type="button"
                        onClick={handlePrint}
                        className="h-11 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase tracking-wider text-[10px] flex items-center gap-2 shadow-lg shadow-blue-900/40"
                    >
                        <Printer className="w-4 h-4" />
                        Print Proposal
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
