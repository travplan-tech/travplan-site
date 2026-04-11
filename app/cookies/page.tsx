import React from 'react';
import { Cookie, Info, Settings, ShieldCheck } from 'lucide-react';

export const metadata = {
    title: 'Cookie Policy | Travplan',
    description: 'Learn how Travplan uses cookies and tracking technologies to improve your travel planning experience.',
};

export default function CookiePolicyPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 md:py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                        <Cookie size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
                    <p className="text-gray-500 max-w-2xl mx-auto italic">
                        Ensuring a smooth and personalized journey through our digital gateway.
                    </p>
                </div>

                {/* Content Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 prose prose-blue max-w-none">
                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                <Info size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 m-0">Introduction</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            This Cookie Policy explains how Travplan (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) uses cookies and similar tracking technologies when you visit our website. By continuing to browse or use our website, you agree to the use of cookies in accordance with this policy.
                        </p>
                    </section>

                    <hr className="border-gray-100 my-8" />

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Why We Use Cookies</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Travplan uses cookies to improve website functionality, enhance your browsing experience, analyze traffic patterns, personalize content, and support our marketing efforts. Cookies allow us to understand how visitors interact with our website and help us optimize performance and usability.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">Types of Cookies We Use</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-blue-50/50 rounded-xl border border-blue-100">
                                <h3 className="text-lg font-bold text-blue-900 mb-2 mt-0">Essential Cookies</h3>
                                <p className="text-sm text-blue-800 leading-relaxed m-0">
                                    Necessary for the proper functioning of our website. These cookies enable basic features such as page navigation, secure areas access, and booking form functionality.
                                </p>
                            </div>

                            <div className="p-6 bg-green-50/50 rounded-xl border border-green-100">
                                <h3 className="text-lg font-bold text-green-900 mb-2 mt-0">Performance & Analytics</h3>
                                <p className="text-sm text-green-800 leading-relaxed m-0">
                                    Help us understand how visitors use our website by collecting information such as pages visited and error messages. This data is aggregated and anonymous.
                                </p>
                            </div>

                            <div className="p-6 bg-purple-50/50 rounded-xl border border-purple-100">
                                <h3 className="text-lg font-bold text-purple-900 mb-2 mt-0">Functional Cookies</h3>
                                <p className="text-sm text-purple-800 leading-relaxed m-0">
                                    Allow the website to remember your preferences, such as language settings or previously entered information, to provide a more personalized experience.
                                </p>
                            </div>

                            <div className="p-6 bg-red-50/50 rounded-xl border border-red-100">
                                <h3 className="text-lg font-bold text-red-900 mb-2 mt-0">Marketing & Advertising</h3>
                                <p className="text-sm text-red-800 leading-relaxed m-0">
                                    Used to deliver relevant advertisements and promotional content based on your browsing behavior and help measure the effectiveness of marketing campaigns.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Some cookies may be placed by third-party service providers, such as analytics providers (e.g., Google Analytics) or advertising platforms. These third parties may collect information about your online activities over time and across different websites. Travplan does not control these cookies, and we encourage you to review the respective third-party privacy policies for more information.
                        </p>
                    </section>

                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-600">
                                <Settings size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 m-0">How You Can Control Cookies</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            You have the right to accept or reject cookies. Most web browsers automatically accept cookies, but you can modify your browser settings to decline cookies if you prefer. You may also delete cookies stored on your device at any time.
                        </p>
                        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-100 italic">
                            Please note that disabling certain cookies may affect the functionality of our website, and some features may not work as intended.
                        </div>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Cookie Policy</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Travplan reserves the right to update or modify this Cookie Policy at any time. Any changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically to stay informed.
                        </p>
                    </section>

                    <section className="p-8 bg-primary/5 rounded-2xl border border-primary/10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                                <ShieldCheck size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 m-0">Contact Information</h2>
                        </div>
                        <div className="space-y-4">
                            <p className="text-gray-700 m-0">If you have any questions about our use of cookies or this Cookie Policy, please contact:</p>
                            <div className="flex flex-col gap-2">
                                <a href="mailto:info@travplan.in" className="text-primary font-bold hover:underline">info@travplan.in</a>
                                <a href="tel:+917011990884" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">+91 7011990884</a>
                                <p className="text-gray-500 text-sm m-0">Workingdom, Block A, Sector 7 Dwarka, Palam, New Delhi, Delhi, 110077</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
