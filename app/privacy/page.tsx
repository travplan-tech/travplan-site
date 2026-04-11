import React from 'react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export const metadata = {
    title: 'Privacy Policy | Travplan',
    description: 'Learn how Travplan collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 md:py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                        <Shield size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-gray-500">
                        <p>Effective Date: <span className="font-semibold">06/06/25</span></p>
                        <span className="hidden md:inline text-gray-300">|</span>
                        <p>Last Updated: <span className="font-semibold">21/02/26</span></p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 prose prose-blue max-w-none">
                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                <FileText size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 m-0">Introduction</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            Travplan (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) values your trust and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, interact with us, or use our travel-related services. By accessing our website or using our services, you agree to the terms outlined in this Privacy Policy.
                        </p>
                    </section>

                    <hr className="border-gray-100 my-8" />

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Travplan may collect personal information that you voluntarily provide when making inquiries, booking travel packages, subscribing to newsletters, filling out contact forms, or communicating with us via phone, email, or messaging platforms such as WhatsApp. This information may include your full name, phone number, email address, residential address, passport details for international travel, travel preferences, and other relevant details necessary to complete your booking.
                        </p>
                    </section>

                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                                <Lock size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 m-0">Payment Information</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            In certain cases, payment-related information may be required to process bookings. Travplan does not store your debit or credit card details. All payments are processed securely through authorized third-party payment gateways that comply with applicable security standards.
                        </p>
                    </section>

                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                                <Eye size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 m-0">Automatically Collected Information</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            In addition to personal information, we may automatically collect certain non-personal information when you access our website. This may include your IP address, browser type, device information, operating system, pages visited, time spent on the website, and other analytical data collected through cookies and similar tracking technologies. This data helps us improve website functionality and user experience.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Travplan uses the collected information to process bookings, arrange travel services, communicate itinerary details, provide customer support, send booking confirmations, and respond to inquiries. If you have opted in, we may also send promotional offers, marketing communications, or travel updates. Additionally, we may use your data to comply with legal obligations, resolve disputes, enforce policies, and protect our business interests.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Sharing of Information</h2>
                        <p className="text-gray-600 leading-relaxed">
                            We do not sell, trade, or rent your personal information. However, we may share necessary information with trusted third-party service providers such as airlines, hotels, transportation companies, visa processing agencies, payment gateway providers, and government authorities where legally required. These parties receive only the information necessary to perform their services and are obligated to maintain confidentiality.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking Technologies</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Our website uses cookies and similar technologies to enhance user experience, analyze website traffic, and improve marketing efforts. Cookies allow us to recognize returning users and tailor content according to preferences. You may disable cookies in your browser settings, but certain website features may not function properly as a result.
                        </p>
                    </section>

                    <section className="mb-10 text-primary bg-primary/5 p-6 rounded-xl border border-primary/10">
                        <h2 className="text-2xl font-bold text-primary mb-4 mt-0">Data Security</h2>
                        <p className="text-gray-700 leading-relaxed m-0">
                            Travplan implements reasonable administrative, technical, and physical safeguards to protect your personal information against unauthorized access, alteration, disclosure, or destruction. We use secure hosting environments, encrypted connections (SSL), and restricted access protocols. However, no online transmission or storage system can be guaranteed as completely secure.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
                        <p className="text-gray-600 leading-relaxed">
                            We retain personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, including satisfying legal, regulatory, tax, or reporting requirements. Once data is no longer required, it is securely deleted or anonymized.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
                        <p className="text-gray-600 leading-relaxed">
                            You have the right to request access to your personal data, request correction of inaccurate information, request deletion of your data where applicable, and withdraw consent at any time. Requests related to personal data can be made using the contact details provided below.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Links</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Our website may contain links to third-party websites for your convenience. Travplan is not responsible for the privacy practices or content of external websites. We encourage users to review the privacy policies of those websites before sharing personal information.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Children’s Privacy</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Travplan&rsquo;s services are not directed toward individuals under the age of 18, and we do not knowingly collect personal information from minors without appropriate parental or guardian consent.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">International Data Transfers</h2>
                        <p className="text-gray-600 leading-relaxed">
                            If you book international travel services, your information may be transferred to service providers located outside your country of residence. Such transfers are conducted in compliance with applicable data protection laws and only for the purpose of delivering travel services.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Travplan reserves the right to update or modify this Privacy Policy at any time. Any changes will be reflected on this page with an updated effective date. We encourage users to review this page periodically.
                        </p>
                    </section>

                    <section className="p-8 bg-gray-50 rounded-2xl border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-0">Contact Information</h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Travplan</p>
                                    <p className="text-gray-600">Workingdom, Block A, Sector 7 Dwarka, Palam, New Delhi, Delhi, 110077</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <a href="mailto:info@travplan.in" className="text-gray-600 hover:text-primary transition-colors">info@travplan.in</a>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <a href="tel:+917011990884" className="text-gray-600 hover:text-primary transition-colors">+91 7011990884</a>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function Mail(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
    );
}

function Phone(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
    );
}
