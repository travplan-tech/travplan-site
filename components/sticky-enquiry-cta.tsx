"use client"

import { useState } from "react"
import { Phone, Send } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import EnquirySheet from "@/components/enquiry-sheet"
import { PHONE_HREF, enquiryMessage, whatsappUrl } from "@/lib/contact"
import { track } from "@/lib/analytics"

/**
 * The conversion bar for destination and package pages.
 *
 * Two parts, deliberately separate:
 *
 *  - A full-width "Send enquiry" bar replacing the phone navigation. On a page
 *    the visitor reached with intent, a row of navigation icons competes with
 *    the one action worth taking; a single button does not.
 *  - Round WhatsApp and call buttons pinned bottom-right on every screen size,
 *    for visitors who would rather talk than fill in a form.
 *
 * The navigation bar is hidden on these routes by MobileBottomBar itself, so
 * the two never stack.
 */
export default function StickyEnquiryCta({
    context,
    packageId,
}: {
    /** Named in the form heading and the WhatsApp message. */
    context?: string | null
    packageId?: number
}) {
    const [open, setOpen] = useState(false)
    const message = enquiryMessage(context)

    return (
        <>
            {/* Round actions: above the enquiry bar on phones, bottom-right on desktop. */}
            <div className="fixed right-4 z-50 flex flex-col gap-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-6">
                <a
                    href={whatsappUrl(message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track("whatsapp_click", { context: context || "site" })}
                    aria-label="Chat with us on WhatsApp"
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition hover:scale-105 hover:bg-[#1ebe5b]"
                >
                    <FaWhatsapp size={26} aria-hidden="true" />
                </a>
                <a
                    href={PHONE_HREF}
                    onClick={() => track("phone_click", { context: context || "site" })}
                    aria-label="Call us"
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-black/20 transition hover:scale-105 hover:bg-primary/90"
                >
                    <Phone size={20} aria-hidden="true" />
                </a>
            </div>

            {/* Replaces the phone navigation bar on these pages. */}
            <div className="md:hidden fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    aria-haspopup="dialog"
                    aria-expanded={open}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-white transition active:scale-[0.99]"
                >
                    <Send size={18} aria-hidden="true" />
                    Send enquiry
                </button>
            </div>

            {/* Keeps the last section clear of the fixed bar. */}
            <div className="md:hidden h-24" aria-hidden="true" />

            <EnquirySheet
                open={open}
                onClose={() => setOpen(false)}
                context={context}
                packageId={packageId}
            />
        </>
    )
}
