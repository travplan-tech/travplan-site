"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { X, Send, CheckCircle, User, Mail, Phone, Users, MessageSquare } from "lucide-react"
import { useSubmitEnquiryMutation } from "@/lib/api/publicApi"

interface EnquiryDialogProps {
    isOpen: boolean
    onClose: () => void
    packageId: number
    packageName: string
}

export default function EnquiryDialog({
    isOpen,
    onClose,
    packageId,
    packageName
}: EnquiryDialogProps) {
    const { data: session } = useSession()

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        numberOfTravelers: "2",
        message: ""
    })
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")

    // RTK Query mutation
    const [submitEnquiry, { isLoading: loading }] = useSubmitEnquiryMutation()

    // Auto-fill user details when session is available
    useEffect(() => {
        if (session?.user) {
            setFormData(prev => ({
                ...prev,
                name: session.user.name || "",
                email: session.user.email || "",
            }))
        }
    }, [session])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!formData.name.trim()) {
            setError("Please enter your name")
            return
        }
        if (!formData.email.trim() || !formData.email.includes("@")) {
            setError("Please enter a valid email address")
            return
        }
        if (!formData.phone.trim()) {
            setError("Please enter your phone number")
            return
        }

        setError("")

        try {
            await submitEnquiry({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                packageId,
                packageName,
                numberOfTravelers: formData.numberOfTravelers,
                message: formData.message,
            }).unwrap()

            setSuccess(true)
        } catch (err) {
            console.error("Enquiry submission error:", err)
            setError("Something went wrong. Please try again.")
        }
    }

    const handleClose = () => {
        // Reset form when closing
        if (!session?.user) {
            setFormData({
                name: "",
                email: "",
                phone: "",
                numberOfTravelers: "2",
                message: ""
            })
        } else {
            setFormData(prev => ({
                ...prev,
                numberOfTravelers: "2",
                message: ""
            }))
        }
        setSuccess(false)
        setError("")
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
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Enquiry Submitted!</h3>
                        <p className="text-gray-600 mb-4">
                            Thank you for your interest in <strong>{packageName}</strong>. Our team will get back to you within 24 hours.
                        </p>
                        <button
                            onClick={handleClose}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    /* Form State */
                    <form onSubmit={handleSubmit} className="p-6">
                        {/* Header */}
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-1">
                                Make an Enquiry
                            </h2>
                            <p className="text-gray-600 text-sm">
                                Interested in <strong>{packageName}</strong>? Fill in your details and we'll get back to you shortly.
                            </p>
                        </div>

                        {/* Name Input */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name *
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter your name"
                                    className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address *
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="Enter your email"
                                    className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            </div>
                        </div>

                        {/* Phone Input */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number *
                            </label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    placeholder="Enter your phone number"
                                    className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            </div>
                        </div>

                        {/* Number of Travelers */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Number of Travelers
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.numberOfTravelers}
                                    onChange={(e) => setFormData(prev => ({ ...prev, numberOfTravelers: e.target.value }))}
                                    className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-white"
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                        <option key={num} value={num}>{num} {num === 1 ? "Traveler" : "Travelers"}</option>
                                    ))}
                                    <option value="10+">10+ Travelers</option>
                                </select>
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            </div>
                        </div>

                        {/* Message Input */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Your Message (Optional)
                            </label>
                            <div className="relative">
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                    placeholder="Tell us about your travel plans, preferred dates, special requirements..."
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <p className="text-red-600 text-sm mb-4">{error}</p>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Submit Enquiry
                                </>
                            )}
                        </button>

                        {/* Privacy Note */}
                        <p className="mt-4 text-xs text-gray-500 text-center">
                            By submitting, you agree to our{" "}
                            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
                            {" "}and authorize us to contact you regarding your enquiry.
                        </p>
                    </form>
                )}
            </div>
        </div>
    )
}
