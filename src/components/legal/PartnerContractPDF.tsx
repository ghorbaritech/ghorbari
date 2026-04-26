'use client'

import React from 'react'
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer'

// Define the Bengali font registration if needed
// Font.register({ family: 'Hind Siliguri', src: 'https://fonts.gstatic.com/s/hindsiliguri/v11/ijwb9D-99Y_S3eXZ70O4yvBv.ttf' });

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        fontFamily: 'Helvetica', // Fallback
        lineHeight: 1.5,
    },
    header: {
        textAlign: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 20,
        color: '#666',
    },
    section: {
        marginBottom: 15,
        paddingBottom: 5,
        borderBottom: '1 solid #EEE',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 10,
        backgroundColor: '#F9F9F9',
        padding: 4,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    label: {
        width: 150,
        fontWeight: 'bold',
    },
    value: {
        flex: 1,
    },
    footer: {
        marginTop: 50,
        borderTop: '1 solid #000',
        paddingTop: 10,
        textAlign: 'center',
        fontSize: 8,
        color: '#999',
    },
    signatureContainer: {
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureBox: {
        width: '45%',
        borderTop: '1 solid #000',
        paddingTop: 5,
        textAlign: 'center',
    },
    signatureImage: {
        width: 150,
        height: 50,
        marginBottom: 5,
    }
})

export const PartnerContractPDF = ({ data, signature }: { data: any, signature: string }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>দালানকোঠা (Dalankotha)</Text>
                <Text style={styles.subtitle}>পার্টনার অনবোর্ডিং এবং সেবার সাধারণ চুক্তিপত্র</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>ধারা ১ — পক্ষগণের তথ্য (Contracting Parties)</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>প্রথম পক্ষ (প্ল্যাটফর্ম):</Text>
                    <Text style={styles.value}>দালানকোঠা টেকনোলজিস লিমিটেড (Dalankotha)</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>দ্বিতীয় পক্ষ (পার্টনার):</Text>
                    <Text style={styles.value}>{data.partnerName}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>এনআইডি / পাসপোর্ট:</Text>
                    <Text style={styles.value}>{data.nidPassport}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>মোবাইল নং:</Text>
                    <Text style={styles.value}>{data.phone}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>ধারা ২ — ব্যবসায়ের বিবরণ (Business Scope)</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>ব্যবসায়ের নাম:</Text>
                    <Text style={styles.value}>{data.businessName || 'ব্যক্তিগত সেবা'}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>ট্রেড লাইসেন্স নং:</Text>
                    <Text style={styles.value}>{data.tradeLicense || 'প্রযোজ্য নয়'}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>নির্বাচিত সেবাসমূহ:</Text>
                    <Text style={styles.value}>{data.selectedServices?.join(', ') || 'সাধারণ সেবা'}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>ধারা ৩ — আর্থিক লেনদেনের তথ্য (Payment Terms)</Text>
                {data.bankName && (
                    <View style={styles.row}>
                        <Text style={styles.label}>ব্যাংকের নাম ও শাখা:</Text>
                        <Text style={styles.value}>{data.bankName}</Text>
                    </View>
                )}
                {data.bankAccount && (
                    <View style={styles.row}>
                        <Text style={styles.label}>অ্যাকাউন্ট নম্বর:</Text>
                        <Text style={styles.value}>{data.bankAccount}</Text>
                    </View>
                )}
                {data.mobilePayment && (
                    <View style={styles.row}>
                        <Text style={styles.label}>মোবাইল ব্যাংকিং (MFS):</Text>
                        <Text style={styles.value}>{data.mobilePayment}</Text>
                    </View>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>ধারা ৪ — সাধারণ শর্তাবলী (Standard Terms)</Text>
                <Text>১. গুণগত মান: পার্টনার দালানকোঠা প্ল্যাটফর্মের মাধ্যমে প্রদত্ত সকল সেবার গুণগত মান এবং স্বচ্ছতা বজায় রাখতে বাধ্য থাকিবেন।</Text>
                <Text>২. গোপনীয়তা: প্ল্যাটফর্মের অভ্যন্তরীণ তথ্য এবং গ্রাহকদের ব্যক্তিগত তথ্য সম্পূর্ণ গোপনীয় রাখিতে হইবে।</Text>
                <Text>৩. দায়বদ্ধতা: নির্মাণ কাজের ক্ষেত্রে পার্টনার বাংলাদেশ ন্যাশনাল বিল্ডিং কোড (BNBC) এবং স্থানীয় আইন মেনে চলিতে দায়বদ্ধ।</Text>
                <Text>৪. পেমেন্ট: সার্ভিস চার্জ এবং অর্থ লেনদেন দালানকোঠা প্ল্যাটফর্মের নির্ধারিত নীতি অনুযায়ী সম্পন্ন হইবে।</Text>
            </View>

            <View style={styles.signatureContainer}>
                <View style={styles.signatureBox}>
                    <Text style={{ marginBottom: 5 }}>প্রথম পক্ষ (দালানকোঠা)</Text>
                    {data.repSignature && <Image src={data.repSignature} style={styles.signatureImage} />}
                    <Text style={{ borderBottom: '1 solid #EEE', paddingBottom: 2 }}>{data.repName || 'অনুমোদিত প্রতিনিধি'}</Text>
                    <Text style={{ fontSize: 8 }}>Authorized Signatory</Text>
                </View>
                <View style={styles.signatureBox}>
                    <Text style={{ marginBottom: 5 }}>দ্বিতীয় পক্ষ (পার্টনার)</Text>
                    {signature && <Image src={signature} style={styles.signatureImage} />}
                    <Text style={{ borderBottom: '1 solid #EEE', paddingBottom: 2 }}>{data.partnerName}</Text>
                    <Text style={{ fontSize: 8 }}>Digital Signature & Date</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Text>© 2026 দালানকোঠা টেকনোলজিস লিমিটেড | legal@dalankotha.com</Text>
                <Text>এটি একটি ইলেকট্রনিকভাবে জেনারেটেড নথি। প্রদানের তারিখ: {new Date().toLocaleDateString('bn-BD')}</Text>
                <Text style={{ marginTop: 2 }}>Reference ID: {data.contractId || 'DK_GEN_2026'}</Text>
            </View>
        </Page>
    </Document>
)
