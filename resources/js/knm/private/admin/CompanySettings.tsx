/* eslint-disable import/consistent-type-specifier-style */
/* eslint-disable import/order */
import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Button, Card, CardBody, CardHeader, FormField, toast } from '@/knm/shared/ui';

interface Settings {
    id: number;
    firm_name: string;
    firm_code: string;
    tagline: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    po_box: string | null;
    business_hours: string | null;
    website: string | null;
    footer_disclaimer: string | null;
    facebook_url: string | null;
    twitter_url: string | null;
    instagram_url: string | null;
    linkedin_url: string | null;
    tiktok_url: string | null;
    youtube_url: string | null;
    whatsapp_number: string | null;
    google_business_url: string | null;
    logo_path: string | null;
    primary_color: string | null;
    secondary_color: string | null;
    registration_number: string | null;
    tax_pin: string | null;
    vat_number: string | null;
    jurisdiction: string | null;
    currency: string | null;
    bank_name: string | null;
    bank_account_number: string | null;
    bank_branch: string | null;
    swift_code: string | null;
    file_number_format: string | null;
    file_number_sequence_length: number;
}

interface Props {
    settings: Settings;
}

const textareaClasses =
    'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors duration-200 hover:border-slate-400 focus:border-[#891920] focus:outline-none focus:ring-2 focus:ring-[#891920]/20';

export default function CompanySettings({ settings }: Props) {
    const form = useForm({
        firm_name: settings.firm_name ?? '',
        firm_code: settings.firm_code ?? '',
        tagline: settings.tagline ?? '',
        email: settings.email ?? '',
        phone: settings.phone ?? '',
        address: settings.address ?? '',
        po_box: settings.po_box ?? '',
        business_hours: settings.business_hours ?? '',
        website: settings.website ?? '',
        footer_disclaimer: settings.footer_disclaimer ?? '',
        facebook_url: settings.facebook_url ?? '',
        twitter_url: settings.twitter_url ?? '',
        instagram_url: settings.instagram_url ?? '',
        linkedin_url: settings.linkedin_url ?? '',
        tiktok_url: settings.tiktok_url ?? '',
        youtube_url: settings.youtube_url ?? '',
        whatsapp_number: settings.whatsapp_number ?? '',
        google_business_url: settings.google_business_url ?? '',
        logo_path: settings.logo_path ?? '',
        primary_color: settings.primary_color ?? '#891920',
        secondary_color: settings.secondary_color ?? '#D4AF37',
        registration_number: settings.registration_number ?? '',
        tax_pin: settings.tax_pin ?? '',
        vat_number: settings.vat_number ?? '',
        jurisdiction: settings.jurisdiction ?? '',
        currency: settings.currency ?? 'KES',
        bank_name: settings.bank_name ?? '',
        bank_account_number: settings.bank_account_number ?? '',
        bank_branch: settings.bank_branch ?? '',
        swift_code: settings.swift_code ?? '',
        file_number_format: settings.file_number_format ?? '{firm_code}/{practice_code}/{year}/{sequence}',
        file_number_sequence_length: settings.file_number_sequence_length ?? 3,
    });

    // Live preview of the file number format
    const previewFileNumber = () => {
        const seqLen = Number(form.data.file_number_sequence_length) || 3;
        return (form.data.file_number_format || '{firm_code}/{practice_code}/{year}/{sequence}')
            .replaceAll('{firm_code}', (form.data.firm_code || 'KAA').toUpperCase())
            .replaceAll('{practice_code}', 'CV')
            .replaceAll('{year}', String(new Date().getFullYear()))
            .replaceAll('{sequence}', '1'.padStart(seqLen, '0'));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put('/private/admin/settings', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Settings saved', {
                    description: 'Company details have been updated across the system.',
                });
            },
            onError: (errors) => {
                toast.error('Could not save settings', {
                    description: Object.values(errors).flat().join(' '),
                });
            },
        });
    };

    return (
        <>
            <Head title="Company Settings" />

            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-900">Company Settings</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Firm identity, branding, and system-wide defaults.
                    </p>
                </div>
                <Button variant="primary" onClick={submit} isLoading={form.processing}>
                    Save Changes
                </Button>
            </div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <form onSubmit={submit} className="space-y-6">
                    {/* Firm Identity */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-serif font-bold text-slate-900">Firm Identity</h2>
                            <p className="text-xs text-slate-500">How the firm appears on documents, letters, and the public site.</p>
                        </CardHeader>
                        <CardBody>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    label="Firm Name"
                                    value={form.data.firm_name}
                                    onChange={(e) => form.setData('firm_name', e.target.value)}
                                    error={form.errors.firm_name}
                                />
                                <FormField
                                    label="Firm Code (used in file numbers)"
                                    value={form.data.firm_code}
                                    onChange={(e) => form.setData('firm_code', e.target.value)}
                                    error={form.errors.firm_code}
                                    placeholder="e.g. KAA"
                                />
                                <FormField
                                    label="Tagline (optional)"
                                    value={form.data.tagline}
                                    onChange={(e) => form.setData('tagline', e.target.value)}
                                    error={form.errors.tagline}
                                    placeholder="e.g. Excellence in Law"
                                />
                                <FormField
                                    label="Registration Number (optional)"
                                    value={form.data.registration_number}
                                    onChange={(e) => form.setData('registration_number', e.target.value)}
                                    error={form.errors.registration_number}
                                />
                            </div>
                        </CardBody>
                    </Card>

                    {/* Contact & Address */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-serif font-bold text-slate-900">Contact & Address</h2>
                            <p className="text-xs text-slate-500">Displayed on the public contact page and client portal.</p>
                        </CardHeader>
                        <CardBody>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    label="Email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    error={form.errors.email}
                                />
                                <FormField
                                    label="Phone"
                                    value={form.data.phone}
                                    onChange={(e) => form.setData('phone', e.target.value)}
                                    error={form.errors.phone}
                                />
                                <FormField
                                    label="P.O. Box (optional)"
                                    value={form.data.po_box}
                                    onChange={(e) => form.setData('po_box', e.target.value)}
                                    error={form.errors.po_box}
                                    placeholder="e.g. P.O. Box 12345-00100"
                                />
                                <FormField
                                    label="Business Hours (optional)"
                                    value={form.data.business_hours}
                                    onChange={(e) => form.setData('business_hours', e.target.value)}
                                    error={form.errors.business_hours}
                                    placeholder="e.g. Mon-Fri: 8:00 AM - 5:00 PM"
                                />
                                <FormField
                                    label="Website (optional)"
                                    value={form.data.website}
                                    onChange={(e) => form.setData('website', e.target.value)}
                                    error={form.errors.website}
                                />
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Physical Address</label>
                                    <textarea
                                        rows={3}
                                        className={textareaClasses}
                                        value={form.data.address}
                                        onChange={(e) => form.setData('address', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Social Media & Presence */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-serif font-bold text-slate-900">Social Media & Presence</h2>
                            <p className="text-xs text-slate-500">Links shown on the public site footer and contact page.</p>
                        </CardHeader>
                        <CardBody>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField label="Facebook URL" value={form.data.facebook_url} onChange={(e) => form.setData('facebook_url', e.target.value)} placeholder="https://facebook.com/…" />
                                <FormField label="Twitter / X URL" value={form.data.twitter_url} onChange={(e) => form.setData('twitter_url', e.target.value)} placeholder="https://x.com/…" />
                                <FormField label="Instagram URL" value={form.data.instagram_url} onChange={(e) => form.setData('instagram_url', e.target.value)} placeholder="https://instagram.com/…" />
                                <FormField label="LinkedIn URL" value={form.data.linkedin_url} onChange={(e) => form.setData('linkedin_url', e.target.value)} placeholder="https://linkedin.com/company/…" />
                                <FormField label="TikTok URL" value={form.data.tiktok_url} onChange={(e) => form.setData('tiktok_url', e.target.value)} placeholder="https://tiktok.com/@…" />
                                <FormField label="YouTube URL" value={form.data.youtube_url} onChange={(e) => form.setData('youtube_url', e.target.value)} placeholder="https://youtube.com/@…" />
                                <FormField label="WhatsApp Number" value={form.data.whatsapp_number} onChange={(e) => form.setData('whatsapp_number', e.target.value)} placeholder="+254 7XX XXX XXX" />
                                <FormField label="Google Business Profile" value={form.data.google_business_url} onChange={(e) => form.setData('google_business_url', e.target.value)} placeholder="https://g.page/…" />
                            </div>
                        </CardBody>
                    </Card>

                    {/* Branding */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-serif font-bold text-slate-900">Branding</h2>
                            <p className="text-xs text-slate-500">Colors used across the internal workspace and public site.</p>
                        </CardHeader>
                        <CardBody>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-slate-700">Primary Color (Maroon)</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={form.data.primary_color}
                                            onChange={(e) => form.setData('primary_color', e.target.value)}
                                            className="h-10 w-14 rounded-lg border border-slate-300 cursor-pointer"
                                        />
                                        <FormField
                                            value={form.data.primary_color}
                                            onChange={(e) => form.setData('primary_color', e.target.value)}
                                            placeholder="#891920"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-slate-700">Secondary Color (Gold)</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={form.data.secondary_color}
                                            onChange={(e) => form.setData('secondary_color', e.target.value)}
                                            className="h-10 w-14 rounded-lg border border-slate-300 cursor-pointer"
                                        />
                                        <FormField
                                            value={form.data.secondary_color}
                                            onChange={(e) => form.setData('secondary_color', e.target.value)}
                                            placeholder="#D4AF37"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Legal & Financial */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-serif font-bold text-slate-900">Legal & Financial</h2>
                            <p className="text-xs text-slate-500">Used on invoices and official correspondence.</p>
                        </CardHeader>
                        <CardBody>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField label="Jurisdiction" value={form.data.jurisdiction} onChange={(e) => form.setData('jurisdiction', e.target.value)} />
                                <FormField label="Currency" value={form.data.currency} onChange={(e) => form.setData('currency', e.target.value)} placeholder="KES" />
                                <FormField label="Tax PIN" value={form.data.tax_pin} onChange={(e) => form.setData('tax_pin', e.target.value)} />
                                <FormField label="VAT Number (optional)" value={form.data.vat_number} onChange={(e) => form.setData('vat_number', e.target.value)} />
                                <FormField label="Bank Name (optional)" value={form.data.bank_name} onChange={(e) => form.setData('bank_name', e.target.value)} />
                                <FormField label="Bank Account Number (optional)" value={form.data.bank_account_number} onChange={(e) => form.setData('bank_account_number', e.target.value)} />
                                <FormField label="Bank Branch (optional)" value={form.data.bank_branch} onChange={(e) => form.setData('bank_branch', e.target.value)} />
                                <FormField label="SWIFT Code (optional)" value={form.data.swift_code} onChange={(e) => form.setData('swift_code', e.target.value)} />
                            </div>
                        </CardBody>
                    </Card>

                    {/* File Number Format */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-serif font-bold text-slate-900">File Number Format</h2>
                            <p className="text-xs text-slate-500">Controls how new matter file numbers are generated.</p>
                        </CardHeader>
                        <CardBody>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    label="Format Pattern"
                                    value={form.data.file_number_format}
                                    onChange={(e) => form.setData('file_number_format', e.target.value)}
                                    error={form.errors.file_number_format}
                                    hint="Tokens: {firm_code} {practice_code} {year} {sequence}"
                                />
                                <FormField
                                    label="Sequence Length (digits)"
                                    type="number"
                                    value={String(form.data.file_number_sequence_length)}
                                    onChange={(e) => form.setData('file_number_sequence_length', Number(e.target.value))}
                                    error={form.errors.file_number_sequence_length}
                                />
                            </div>
                            <div className="mt-4 p-4 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                                <p className="text-xs font-semibold text-[#891920] mb-1">Live Preview</p>
                                <p className="font-mono text-lg font-bold text-slate-900">{previewFileNumber()}</p>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Footer Disclaimer */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-serif font-bold text-slate-900">Public Site Disclaimer</h2>
                            <p className="text-xs text-slate-500">Legal disclaimer shown in the public site footer.</p>
                        </CardHeader>
                        <CardBody>
                            <textarea
                                rows={4}
                                className={textareaClasses}
                                value={form.data.footer_disclaimer}
                                onChange={(e) => form.setData('footer_disclaimer', e.target.value)}
                                placeholder="e.g. The information on this website does not constitute legal advice…"
                            />
                        </CardBody>
                    </Card>

                    {/* Bottom Save */}
                    <div className="flex justify-end">
                        <Button type="submit" variant="primary" isLoading={form.processing}>
                            Save Changes
                        </Button>
                    </div>
                </form>
            </motion.div>
        </>
    );
}
