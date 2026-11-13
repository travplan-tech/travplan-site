"use client"

import { useState } from "react"
import { CheckCircle, Clock, Loader2, Phone, ShieldCheck, Sparkles } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import { PHONE_HREF, PHONE_NUMBER, enquiryMessage, whatsappUrl } from "@/lib/contact"
import { track } from "@/lib/analytics"

/**
 * Inline lead capture for a destination page.
 *
 * The sticky bar catches visitors who are ready at any point; this catches the
 * ones who read to the end of the guide, which is a different and warmer
 * moment. Asking only for name, phone and dates — an itinerary request is the
 * start of a conversation, not an application form, and every extra field
 * costs completions.
 */
export default function DestinationLeadForm({ destination }: { destination: string }) {
    const [form, setForm] = useState({ name: "", phone: "", email: "", month: "", travellers: "2" })
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState("")

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name.trim()) return setError("Please enter your name")
        if (form.phone.trim().length < 7) return setError("Please enter your phone number")
        if (!form.email.includes("@")) return setError("Please enter a valid email address")

        setError("")
        setSending(true)
        try {
            const res = await fetch("/api/enquiry", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    packageName: `${destination} (destination page)`,
                    preferredDate: form.month,
                    numberOfTravelers: form.travellers,
                    message: `Itinerary request for ${destination}${form.month ? `, travelling around ${form.month}` : ""}.`,
                }),
            })
            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                throw new Error(body.error || "Something went wrong")
            }
            track("lead_form_submitted", { destination })
            setSent(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not send. Please try again.")
        } finally {
            setSending(false)
        }
    }

    const field =
        "w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-[16px] text-gray-900 placeholder:text-gray-400 transition focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"

    const labelClass = "block text-sm font-semibold text-gray-800 mb-1.5"

    return (
        <section className="w-full bg-gray-50 py-14 md:py-20" id="plan-trip">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm lg:grid lg:grid-cols-[1fr_1.15fr]">
                    {/* The case for filling it in, kept to things we can actually honour. */}
                    <div className="bg-gradient-to-br from-primary to-primary/80 p-8 text-white md:p-11">
                        <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] backdrop-blur-sm">
                            <Sparkles size={13} aria-hidden="true" />
                            Free, no obligation
                        </p>
                        <h2 className="mt-4 font-heading text-[2.1rem] font-bold leading-[1.1] sm:text-[2.6rem]">
                            Get a free {destination} itinerary
                        </h2>
                        <p className="mt-4 text-base text-white/85 md:text-lg">
                            Tell us roughly when you want to travel and how many of you there are.
                            A travel expert will put together a plan and a price, built around
                            what you actually want to do.
                        </p>

                        <ul className="mt-8 space-y-4 text-[15px]">
                            {[
                                { icon: Clock, text: "A reply within a few hours, not days" },
                                { icon: ShieldCheck, text: "No advance payment to get a quote" },
                                { icon: Sparkles, text: "Changed as often as you like until it fits" },
                            ].map(({ icon: Icon, text }) => (
                                <li key={text} className="flex items-start gap-2.5">
                                    <Icon size={17} className="mt-0.5 shrink-0 text-white/80" aria-hidden="true" />
                                    <span className="text-white/90">{text}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <a
                                href={whatsappUrl(enquiryMessage(destination))}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => track("whatsapp_click", { context: destination })}
                                className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/25"
                            >
                                <FaWhatsapp size={18} aria-hidden="true" />
                                WhatsApp us
                            </a>
                            <a
                                href={PHONE_HREF}
                                onClick={() => track("phone_click", { context: destination })}
                                className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/25"
                            >
                                <Phone size={16} aria-hidden="true" />
                                {PHONE_NUMBER}
                            </a>
                        </div>
                    </div>

                    <div className="p-8 md:p-11">
                        {sent ? (
                            <div className="flex h-full flex-col items-center justify-center py-8 text-center">
                                <CheckCircle size={52} className="text-green-500" aria-hidden="true" />
                                <h3 className="mt-4 text-xl font-bold text-gray-900">Request received</h3>
                                <p className="mt-2 max-w-sm text-gray-600">
                                    We are putting together your {destination} itinerary. Expect a call
                                    or email from one of our travel experts shortly.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={submit} className="space-y-5">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Plan my {destination} trip</h3>
                                    <p className="mt-1 text-sm text-gray-600">Takes under a minute.</p>
                                </div>

                                <div>
                                    <label htmlFor="lead-name" className={labelClass}>Your name</label>
                                    <input
                                        id="lead-name"
                                        className={field}
                                        placeholder="e.g. Priya Sharma"
                                        autoComplete="name"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lead-phone" className={labelClass}>Phone number</label>
                                    <input
                                        id="lead-phone"
                                        className={field}
                                        type="tel"
                                        inputMode="tel"
                                        placeholder="We will call or WhatsApp you"
                                        autoComplete="tel"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lead-email" className={labelClass}>Email address</label>
                                    <input
                                        id="lead-email"
                                        className={field}
                                        type="email"
                                        inputMode="email"
                                        placeholder="Where we send the itinerary"
                                        autoComplete="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="lead-month" className={labelClass}>Month of travel</label>
                                        <input
                                            id="lead-month"
                                            className={field}
                                            placeholder="e.g. December"
                                            value={form.month}
                                            onChange={(e) => setForm({ ...form, month: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="lead-travellers" className={labelClass}>Travellers</label>
                                        <select
                                            id="lead-travellers"
                                            className={field}
                                            value={form.travellers}
                                            onChange={(e) => setForm({ ...form, travellers: e.target.value })}
                                        >
                                            {["1", "2", "3", "4", "5", "6+"].map((n) => (
                                                <option key={n} value={n}>
                                                    {n} {n === "1" ? "traveller" : "travellers"}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {error && (
                                    <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                                        {error}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-lg font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary/90 active:scale-[0.99] disabled:opacity-60"
                                >
                                    {sending ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                                            Sending…
                                        </>
                                    ) : (
                                        "Get my free itinerary"
                                    )}
                                </button>
                                <p className="text-center text-xs text-gray-500">
                                    No spam, no payment details. We only use this to plan your trip.
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
