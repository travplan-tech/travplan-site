"use client";

import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Clock, Loader2, CheckCircle } from 'lucide-react';
import Script from 'next/script';

// Schema.org structured data for Contact page
const contactPageSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": "https://Travplan.in/contact#contactpage",
  name: "Contact Travplan",
  description: "Get in touch with Travplan for tour bookings, inquiries, and support.",
  url: "https://Travplan.in/contact",
  mainEntity: {
    "@type": "Organization",
    "@id": "https://Travplan.in/#organization",
    name: "Travplan",
    url: "https://Travplan.in",
    logo: "https://Travplan.in/logo.webp",
    email: "Info@Travplan.in",
    telephone: "+91-7011990884",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Workingdom, Block A, Sector 7 Dwarka, Palam",
      addressLocality: "New Delhi",
      addressRegion: "Delhi",
      postalCode: "110077",
      addressCountry: "IN",
    },
    sameAs: [
      "https://www.instagram.com/Travplan.in",
      "https://wa.me/7011990884"
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+91-7011990884",
        contactType: "customer service",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
        hoursAvailable: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "09:00",
          closes: "18:00",
        },
      },
    ],
  },
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSubmitStatus('success');
      setFormData({ fullName: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Script
        id="contact-page-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
      />
      <div className="min-h-screen bg-gray-50 py-8 md:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* --- Header Section --- */}
          <div className="text-center mb-8 md:mb-10 lg:mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900">
              Get in Touch
            </h1>
            <p className="mt-3 md:mt-4 text-base md:text-lg lg:text-xl text-gray-600">
              We're here to help you plan your next unforgettable journey.
            </p>
          </div>

          {/* --- Main Content Grid: Form and Contact Info --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12">

            {/* --- Left/Middle Column: Contact Form --- */}
            <div className="lg:col-span-2 bg-white p-4 md:p-6 lg:p-8 rounded-xl shadow-lg border border-gray-200">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center">
                <MessageCircle className="w-5 h-5 md:w-6 md:h-6 mr-2 text-primary" /> Send Us a Message
              </h2>

              {/* Success Message */}
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  <p className="text-primary">Your message has been sent successfully! We'll get back to you soon.</p>
                </div>
              )}

              {/* Error Message */}
              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700">{errorMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label htmlFor="fullName" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      id="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-md p-2.5 md:p-3 text-sm md:text-base focus:ring-primary focus:border-primary transition"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-md p-2.5 md:p-3 text-sm md:text-base focus:ring-primary focus:border-primary transition"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md p-2.5 md:p-3 text-sm md:text-base focus:ring-primary focus:border-primary transition"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md p-2.5 md:p-3 text-sm md:text-base focus:ring-primary focus:border-primary transition"
                      placeholder="Inquiry about Kilimanjaro tour"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Your Message *</label>
                  <textarea
                    id="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md p-2.5 md:p-3 text-sm md:text-base focus:ring-primary focus:border-primary transition"
                    placeholder="How can we assist you today?"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary/85 hover:bg-primary disabled:bg-primary-light disabled:cursor-not-allowed text-white font-semibold py-2.5 md:py-3 text-sm md:text-base rounded-md transition duration-200 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Submit Inquiry'
                  )}
                </button>
              </form>
            </div>

            {/* --- Right Column: Key Contact Details --- */}
            <div className="lg:col-span-1 space-y-6 md:space-y-8">

              {/* Direct Contact Info */}
              <div className="bg-white p-4 md:p-5 lg:p-6 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Direct Contact</h3>
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-start text-gray-700">
                    <Phone className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 mt-1 text-primary shrink-0" />
                    <div>
                      <p className="font-semibold text-sm md:text-base">Phone</p>
                      <p className="text-xs md:text-sm">+91 7011990884</p>
                      <a href="https://wa.me/7011990884" target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm text-primary hover:underline">WhatsApp</a>
                    </div>
                  </div>
                  <div className="flex items-start text-gray-700">
                    <Mail className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 mt-1 text-primary shrink-0" />
                    <div>
                      <p className="font-semibold text-sm md:text-base">Email Support</p>
                      <p className="text-xs md:text-sm">Info@Travplan.in</p>
                    </div>
                  </div>
                  <div className="flex items-start text-gray-700">
                    <Clock className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 mt-1 text-primary shrink-0" />
                    <div>
                      <p className="font-semibold text-sm md:text-base">Operating Hours</p>
                      <p className="text-xs md:text-sm">Mon - Sat: 9:00 AM - 6:00 PM IST</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Office Location */}
              <div className="bg-white p-4 md:p-5 lg:p-6 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Our Office</h3>
                <div className="flex items-start text-gray-700">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 mt-1 text-primary shrink-0" />
                  <div>
                    <p className="font-semibold text-sm md:text-base">Travplan</p>
                    <p className="text-xs md:text-sm">Workingdom, Block A, Sector 7 Dwarka,</p>
                    <p className="text-xs md:text-sm">Palam, New Delhi, Delhi - 110077</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
