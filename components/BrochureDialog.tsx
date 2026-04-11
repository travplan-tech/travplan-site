"use client"

import { useState } from "react"
import { X, Mail, Download, Gift, CheckCircle, Percent } from "lucide-react"
import { useRequestBrochureMutation } from "@/lib/api/publicApi"

interface BrochureDialogProps {
    isOpen: boolean
    onClose: () => void
    packageId: number
    packageName: string
    brochureUrl?: string | null
}

export default function BrochureDialog({
    isOpen,
    onClose,
    packageId,
    packageName,
    brochureUrl
}: BrochureDialogProps) {
    const [email, setEmail] = useState("")
    const [needsCallback, setNeedsCallback] = useState<"yes" | "no" | null>(null)
    const [agreedToTerms, setAgreedToTerms] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")
    const [couponCode, setCouponCode] = useState("")

    // RTK Query mutation
    const [requestBrochure, { isLoading: loading }] = useRequestBrochureMutation()

    const handleSubmit = async () => {
        if (!email || !email.includes("@")) {
            setError("Please enter a valid email address")
            return
        }

        if (!agreedToTerms) {
            setError("Please agree to the Terms of Use and Data Policy")
            return
        }

        setError("")

        try {
            const result = await requestBrochure({
                email,
                packageId,
                packageName,
            }).unwrap()

            // Store coupon code from response
            if (result.couponCode) {
                setCouponCode(result.couponCode)
            }

            // If brochure URL exists, trigger download
            if (brochureUrl) {
                window.open(brochureUrl, '_blank');
            }

            setSuccess(true)
        } catch (err) {
            console.error("Brochure request error:", err)
            setError("Something went wrong. Please try again.")
        }
    }

    const handleClose = () => {
        setEmail("")
        setNeedsCallback(null)
        setAgreedToTerms(false)
        setSuccess(false)
        setError("")
        setCouponCode("")
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
                >
                    <X size={24} />
                </button>

                {success ? (
                    /* Success State */
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="text-green-600" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
                        <p className="text-gray-600 mb-4">
                            {brochureUrl
                                ? "Your brochure download has started. We've also sent a copy to your email."
                                : "We've received your request and will send you the brochure shortly."}
                        </p>

                        {/* Coupon Code Display */}
                        {couponCode && (
                            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-dashed border-primary rounded-xl p-4 mb-4">
                                <div className="flex items-center justify-center gap-2 text-primary mb-2">
                                    <Gift size={20} />
                                    <span className="font-semibold text-sm">Your Exclusive 5% Off Coupon</span>
                                </div>
                                <p className="text-2xl font-bold text-primary tracking-widest mb-2">
                                    {couponCode}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Valid for 5 days • Sent to your email
                                </p>
                            </div>
                        )}

                        {needsCallback === "yes" && (
                            <p className="text-sm text-primary mb-4">
                                One of our trip consultants will call you soon!
                            </p>
                        )}
                        <div className="flex flex-col gap-3">
                            {brochureUrl && (
                                <a
                                    href={brochureUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2"
                                >
                                    <Download size={18} />
                                    Download Brochure Now
                                </a>
                            )}
                            <button
                                onClick={handleClose}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Form State */
                    <div className="p-6">
                        {/* Coupon Banner */}
                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg p-3 mb-4 flex items-center gap-3">
                            <div className="bg-white/20 rounded-full p-2">
                                <Percent size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-sm">Get 5% OFF Instantly!</p>
                                <p className="text-xs opacity-90">Enter your email to receive an exclusive coupon code</p>
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 mb-1">
                            Get Trip Brochure & Exclusive Discount
                        </h2>
                        <p className="text-gray-600 text-sm mb-6">
                            Enter your email to receive a comprehensive PDF brochure with all trip details and a <strong className="text-primary">5% discount coupon code</strong> for <strong>{packageName}</strong> tour.
                        </p>

                        {/* Email Input */}
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            </div>
                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                <Gift size={12} />
                                You'll receive a 5% discount coupon valid for 5 days
                            </p>
                        </div>

                        {/* Callback Preference */}
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm font-semibold text-gray-800 mb-3">
                                Do you need help from our trip consultants?
                            </p>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="callback"
                                        checked={needsCallback === "yes"}
                                        onChange={() => setNeedsCallback("yes")}
                                        className="w-4 h-4 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-gray-700">Yes, please call me</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="callback"
                                        checked={needsCallback === "no"}
                                        onChange={() => setNeedsCallback("no")}
                                        className="w-4 h-4 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-gray-700">No thanks</span>
                                </label>
                            </div>
                        </div>

                        {/* Terms Checkbox */}
                        <label className="flex items-start gap-2 mb-4 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                className="w-4 h-4 mt-0.5 text-primary focus:ring-primary rounded"
                            />
                            <span className="text-sm text-gray-600">
                                I agree to the{" "}
                                <a href="/terms" className="text-primary hover:underline">Terms of Use</a>
                                {" "}and{" "}
                                <a href="/privacy" className="text-primary hover:underline">Data Policy</a>
                            </span>
                        </label>

                        {error && (
                            <p className="text-red-600 text-sm mb-4">{error}</p>
                        )}

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Download size={18} />
                                    Get Brochure & 5% Coupon
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
