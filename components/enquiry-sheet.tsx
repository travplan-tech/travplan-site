"use client"

import { useCallback, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { CheckCircle, Loader2, Send, X } from "lucide-react"
import { track } from "@/lib/analytics"

export interface EnquirySheetProps {
    open: boolean
    onClose: () => void
    /** What the visitor is enquiring about, e.g. "Kerala" or a package title. */
    context?: string | null
    /** Set when the enquiry is about a specific package. */
    packageId?: number
}

/**
 * Slide-up enquiry form.
 *
 * Rises from the bottom on phones, where it follows the thumb from the CTA
 * that opened it, and centres as a dialog from md up. EnquiryDialog already
 * does this for a package, but it requires a packageId — a destination page
 * has no single package to name, so this one takes a free-text context and
 * sends the enquiry without one.
 */
export default function EnquirySheet({ open, onClose, context, packageId }: EnquirySheetProps) {
    const { data: session } = useSession()

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        numberOfTravelers: "2",
        message: "",
    })
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState("")

    // Mounts translated down, then transitions up on the next frame —
    // animating straight from mount does nothing, because the browser has no
    // previous value to transition from.
    const [shown, setShown] = useState(false)

    const close = useCallback(() => {
        setShown(false)
        setTimeout(onClose, 200)
    }, [onClose])

    useEffect(() => {
        if (!open) return
        const raf = requestAnimationFrame(() => setShown(true))
        return () => cancelAnimationFrame(raf)
    }, [open])

    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && close()
        document.addEventListener("keydown", onKey)
        const previous = document.body.style.overflow
        document.body.style.overflow = "hidden"
        return () => {
            document.removeEventListener("keydown", onKey)
            document.body.style.overflow = previous
        }
    }, [open, close])

    // Signed-in visitors should not retype what we already know.
    useEffect(() => {
        if (!session?.user) return
        setForm((prev) => ({
            ...prev,
            name: prev.name || session.user?.name || "",
            email: prev.email || session.user?.email || "",
        }))
    }, [session])

    if (!open) return null

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name.trim()) return setError("Please enter your name")
        if (!form.email.includes("@")) return setError("Please enter a valid email address")
        if (form.phone.trim().length < 7) return setError("Please enter your phone number")

        setError("")
        setSending(true)
        try {
            const res = await fetch("/api/enquiry", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    packageId,
                    packageName: context || undefined,
                    message: form.message || `Enquiry from ${context || "the website"}`,
                }),
            })
            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                throw new Error(body.error || "Something went wrong")
            }
            track("enquiry_submitted", { context: context || "site", packageId })
            setSent(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not send. Please try again.")
        } finally {
            setSending(false)
        }
    }

    const field =
        "w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-[16px] text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"

    return (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Send an enquiry">
            <button
                type="button"
                aria-label="Close"
                onClick={close}
                className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${shown ? "opacity-100" : "opacity-0"}`}
            />

            <div
                className={`absolute inset-x-0 bottom-0 md:inset-0 md:m-auto md:h-fit md:max-w-lg rounded-t-3xl md:rounded-3xl bg-white shadow-2xl transition-transform duration-200 ease-out max-h-[92vh] overflow-y-auto ${shown ? "translate-y-0" : "translate-y-full md:translate-y-4"
                    }`}
            >
                {/* Grab handle: the affordance that says this panel can be pulled away. */}
                <div className="md:hidden flex justify-center pt-2.5 pb-1">
                    <span className="h-1.5 w-10 rounded-full bg-gray-300" aria-hidden="true" />
                </div>

                <div className="flex items-start justify-between gap-4 px-5 pt-3 md:pt-5">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {sent ? "Enquiry sent" : "Send an enquiry"}
                        </h2>
                        {!sent && (
                            <p className="mt-0.5 text-sm text-gray-600">
                                {context
                                    ? `About ${context}. We usually reply within a few hours.`
                                    : "Tell us what you are planning and we will reply within a few hours."}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={close}
                        aria-label="Close"
                        className="shrink-0 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                {sent ? (
                    <div className="px-5 pb-8 pt-6 text-center">
                        <CheckCircle size={48} className="mx-auto text-green-500" aria-hidden="true" />
                        <p className="mt-4 font-semibold text-gray-900">Thanks — we have your details.</p>
                        <p className="mt-1 text-sm text-gray-600">
                            One of our travel experts will call or email you shortly.
                        </p>
                        <button
                            type="button"
                            onClick={close}
                            className="mt-6 w-full rounded-xl bg-primary py-3 font-semibold text-white hover:bg-primary/90"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <form onSubmit={submit} className="space-y-3 px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4">
                        <input
                            className={field}
                            placeholder="Your name"
                            autoComplete="name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                        <input
                            className={field}
                            type="tel"
                            inputMode="tel"
                            placeholder="Phone number"
                            autoComplete="tel"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                        <input
                            className={field}
                            type="email"
                            inputMode="email"
                            placeholder="Email address"
                            autoComplete="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                        <div className="flex gap-3">
                            <select
                                className={`${field} flex-1`}
                                value={form.numberOfTravelers}
                                onChange={(e) => setForm({ ...form, numberOfTravelers: e.target.value })}
                                aria-label="Number of travellers"
                            >
                                {["1", "2", "3", "4", "5", "6+"].map((n) => (
                                    <option key={n} value={n}>
                                        {n} {n === "1" ? "traveller" : "travellers"}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <textarea
                            className={`${field} min-h-[84px] resize-none`}
                            placeholder="Travel dates, budget, anything else (optional)"
                            value={form.message}
                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                        />

                        {error && (
                            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={sending}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
                        >
                            {sending ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                                    Sending…
                                </>
                            ) : (
                                <>
                                    <Send size={18} aria-hidden="true" />
                                    Send enquiry
                                </>
                            )}
                        </button>
                        <p className="text-center text-xs text-gray-500">
                            No spam. We only use your details to answer this enquiry.
                        </p>
                    </form>
                )}
            </div>
        </div>
    )
}
