"use client"

import { useState, useEffect, Suspense, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { MapPin, Calendar, Users, Clock, CreditCard, MessageSquare, ArrowLeft, Shield, Check, Tag, Loader2, X, BedDouble } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useGetPackageQuery } from "@/lib/api/packagesApi"
import { useGetUserProfileQuery, useCreateBookingMutation, useApplyCouponMutation, useCreatePaymentOrderMutation, useVerifyPaymentMutation } from "@/lib/api/userApi"

interface PackageDetails {
    id: number
    title: string
    description: string
    price: number
    originalPrice: number | null
    duration: string
    image: string | null
    destination: {
        name: string
        country: string
    }
    departurePoints: string | null
    upcomingDepartures?: DepartureDate[]
    tourCategory?: string
    maxPersons?: number
    tourDateSlots?: TourDateSlot[]
}

interface DepartureDate {
    date: string
    seatsRemaining: number | null
    price: number | null
}

interface RoomAvailability {
    id: number
    roomType: number
    totalRooms: number
    availableRooms: number
    pricePerRoom: number
}

interface TourDateSlot {
    id: number
    startDate: string
    dateLabel: string
    price: number | null
    availableSeats: number
    roomAvailability: RoomAvailability[]
}

interface RoomSelection {
    roomType: number
    count: number
    pricePerRoom: number
}

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => RazorpayInstance
    }
}

interface RazorpayOptions {
    key: string
    amount: number
    currency: string
    name: string
    description: string
    order_id: string
    handler: (response: RazorpayResponse) => void
    prefill: {
        name: string
        email: string
        contact: string
    }
    theme: {
        color: string
    }
    modal?: {
        ondismiss?: () => void
    }
}

interface RazorpayInstance {
    open: () => void
    close: () => void
}

interface RazorpayResponse {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
}

const ROOM_TYPE_LABELS: Record<number, string> = {
    1: "Single Room (1 Person)",
    2: "Double Room (2 Persons)",
    3: "Triple Room (3 Persons)",
    4: "Quad Room (4 Persons)"
}

// Helper function to generate valid room configurations
function generateRoomConfigurations(
    travelers: number,
    roomAvailability: RoomAvailability[]
): RoomSelection[][] {
    const configurations: RoomSelection[][] = []

    // Sort room types by capacity (descending)
    const sortedRooms = [...roomAvailability]
        .filter(r => r.availableRooms > 0)
        .sort((a, b) => b.roomType - a.roomType)

    function findConfigurations(
        remaining: number,
        currentConfig: RoomSelection[],
        startIndex: number
    ) {
        if (remaining === 0) {
            configurations.push([...currentConfig])
            return
        }
        if (remaining < 0 || startIndex >= sortedRooms.length) {
            return
        }

        const room = sortedRooms[startIndex]
        const maxRoomsToUse = Math.min(
            Math.floor(remaining / room.roomType),
            room.availableRooms
        )

        for (let count = maxRoomsToUse; count >= 0; count--) {
            if (count > 0) {
                currentConfig.push({
                    roomType: room.roomType,
                    count: count,
                    pricePerRoom: room.pricePerRoom
                })
            }
            findConfigurations(
                remaining - (count * room.roomType),
                currentConfig,
                startIndex + 1
            )
            if (count > 0) {
                currentConfig.pop()
            }
        }
    }

    findConfigurations(travelers, [], 0)

    // Sort configurations by total price (ascending)
    configurations.sort((a, b) => {
        const priceA = a.reduce((sum, r) => sum + r.count * r.pricePerRoom, 0)
        const priceB = b.reduce((sum, r) => sum + r.count * r.pricePerRoom, 0)
        return priceA - priceB
    })

    return configurations
}

function CheckoutContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data: session, status } = useSession()

    const packageId = searchParams.get("packageId") || searchParams.get("package")
    const selectedDate = searchParams.get("date")
    const travelers = parseInt(searchParams.get("travelers") || "2")
    const departureCity = searchParams.get("departure") || ""

    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")

    // Pricing State
    const [pricePerPerson, setPricePerPerson] = useState(0)

    // Room Selection State
    const [selectedRoomConfig, setSelectedRoomConfig] = useState<RoomSelection[] | null>(null)

    // Coupon State
    const [couponCode, setCouponCode] = useState("")
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)
    const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        guestName: "",
        guestEmail: "",
        guestPhone: "",
        specialRequests: "",
        numberOfPeople: travelers,
        departureCity: departureCity,
    })

    // RTK Query hooks
    const { data: packageData, isLoading: packageLoading, error: packageError } = useGetPackageQuery(packageId || "", {
        skip: !packageId
    })
    const { data: userProfile } = useGetUserProfileQuery(undefined, {
        skip: !session?.user
    })
    const [createBooking] = useCreateBookingMutation()
    const [applyCouponMutation, { isLoading: validatingCoupon }] = useApplyCouponMutation()
    const [createPaymentOrder] = useCreatePaymentOrderMutation()
    const [verifyPayment] = useVerifyPaymentMutation()

    const packageDetails = packageData as PackageDetails | undefined
    const loading = packageLoading

    // Get the selected tour date slot with room availability
    const selectedTourDate = useMemo(() => {
        if (!packageDetails?.tourDateSlots || !selectedDate) return null
        return packageDetails.tourDateSlots.find(slot => {
            // 1. Direct match
            if (slot.dateLabel === selectedDate) return true

            // 2. Start Date match (ISO)
            if (slot.startDate) {
                const dateStr = typeof slot.startDate === 'string' ? slot.startDate : new Date(slot.startDate).toISOString()
                if (dateStr.startsWith(selectedDate)) return true
            }

            // 3. Fuzzy Date Match (Day/Month) handling "Jan 28" vs "28 Jan"
            try {
                const searchDate = new Date(selectedDate)
                if (!isNaN(searchDate.getTime())) {
                    // Check against startDate
                    if (slot.startDate) {
                        const slotDate = new Date(slot.startDate)
                        if (slotDate.getDate() === searchDate.getDate() && slotDate.getMonth() === searchDate.getMonth()) {
                            return true
                        }
                    }
                    // Check against dateLabel
                    const labelDate = new Date(slot.dateLabel)
                    if (!isNaN(labelDate.getTime())) {
                        if (labelDate.getDate() === searchDate.getDate() && labelDate.getMonth() === searchDate.getMonth()) {
                            return true
                        }
                    }
                }
            } catch (e) { }

            return false
        }) || null
    }, [packageDetails, selectedDate])

    // Get available room configurations based on number of travelers
    const roomConfigurations = useMemo(() => {
        if (!selectedTourDate?.roomAvailability || selectedTourDate.roomAvailability.length === 0) {
            return []
        }
        return generateRoomConfigurations(formData.numberOfPeople, selectedTourDate.roomAvailability)
    }, [selectedTourDate, formData.numberOfPeople])

    // Check if rooms are available for this tour date
    const hasRoomAvailability = selectedTourDate?.roomAvailability && selectedTourDate.roomAvailability.length > 0

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`)
        }
    }, [status, router])

    useEffect(() => {
        if (session?.user) {
            setFormData(prev => ({
                ...prev,
                guestName: session.user?.name || "",
                guestEmail: session.user?.email || "",
            }))
        }
    }, [session])

    // Set phone from user profile
    useEffect(() => {
        if (userProfile && (userProfile as { phone?: string }).phone) {
            setFormData(prev => ({ ...prev, guestPhone: (userProfile as { phone: string }).phone }))
        }
    }, [userProfile])

    useEffect(() => {
        if (!packageId) {
            setError("No package specified")
        }
    }, [packageId])

    // Update price when package details or selected date changes
    useEffect(() => {
        if (packageDetails) {
            let price = packageDetails.price

            if (selectedDate && packageDetails.upcomingDepartures) {
                const match = packageDetails.upcomingDepartures.find((d) => d.date === selectedDate)
                if (match && match.price) {
                    price = match.price
                }
            }

            // Also check tourDateSlots for price
            if (selectedTourDate?.price) {
                price = selectedTourDate.price
            }

            setPricePerPerson(price)
        }
    }, [packageDetails, selectedDate, selectedTourDate])

    // Reset room selection when travelers count changes
    useEffect(() => {
        setSelectedRoomConfig(null)
    }, [formData.numberOfPeople])

    // Reset coupon if total price changes
    const baseTotalPrice = pricePerPerson * formData.numberOfPeople

    useEffect(() => {
        if (appliedCoupon) {
            setAppliedCoupon(null)
            setCouponMessage(null)
            setCouponCode("")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.numberOfPeople, pricePerPerson, selectedRoomConfig])

    // Calculate room total price
    const roomTotalPrice = useMemo(() => {
        if (!selectedRoomConfig) return 0
        return selectedRoomConfig.reduce((sum, room) => sum + room.count * room.pricePerRoom, 0)
    }, [selectedRoomConfig])

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return

        setCouponMessage(null)

        try {
            const data = await applyCouponMutation({
                code: couponCode,
                packageId: packageDetails?.id,
            }).unwrap()

            setAppliedCoupon({
                code: data.code,
                discount: data.discountAmount
            })
            setCouponMessage({ type: 'success', text: `Coupon applied! You saved ₹${data.discountAmount.toLocaleString("en-IN")}` })
        } catch (err: unknown) {
            setAppliedCoupon(null)
            const errorMessage = (err as { data?: { error?: string } })?.data?.error || "Invalid coupon"
            setCouponMessage({ type: 'error', text: errorMessage })
        }
    }

    const removeCoupon = () => {
        setAppliedCoupon(null)
        setCouponMessage(null)
        setCouponCode("")
    }

    const loadRazorpayScript = () => {
        return new Promise<boolean>((resolve) => {
            const script = document.createElement("script")
            script.src = "https://checkout.razorpay.com/v1/checkout.js"
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.guestName || !formData.guestEmail || !formData.guestPhone) {
            setError("Please fill in all required fields")
            return
        }

        // Validate room selection if rooms are available
        if (hasRoomAvailability && !selectedRoomConfig) {
            setError("Please select a room configuration")
            return
        }

        setSubmitting(true)
        setError("")

        try {
            // Create booking with PENDING status (Razorpay disabled)
            const booking = await createBooking({
                packageId: parseInt(packageId!),
                guestName: formData.guestName,
                guestEmail: formData.guestEmail,
                guestPhone: formData.guestPhone,
                numberOfPeople: formData.numberOfPeople,
                selectedDate: selectedDate || "Flexible",
                departureCity: formData.departureCity,
                specialRequests: formData.specialRequests,
                couponCode: appliedCoupon?.code,
                roomSelection: selectedRoomConfig ? JSON.stringify(selectedRoomConfig) : undefined,
                roomTotalPrice: roomTotalPrice > 0 ? roomTotalPrice : undefined,
                tourDateId: selectedTourDate?.id
            }).unwrap()

            // Razorpay is disabled - redirect to success page with pending payment message
            // The backend will send emails to admin for manual payment collection
            router.push(`/checkout/success?ref=${booking.bookingRef}&pending=true`)

        } catch (err) {
            console.error("Checkout error:", err)
            setError(err instanceof Error ? err.message : "Something went wrong")
            setSubmitting(false)
        }
    }

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if ((error && !packageDetails) || packageError) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error || "Package not found"}</p>
                    <Link href="/tours" className="text-primary hover:underline">
                        Browse Tours
                    </Link>
                </div>
            </div>
        )
    }

    const finalTotalPrice = baseTotalPrice + roomTotalPrice - (appliedCoupon?.discount || 0)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <Link href={`/destinations/trip/${packageId}`} className="flex items-center gap-2 text-gray-600 hover:text-primary">
                        <ArrowLeft size={20} />
                        <span>Back to Package</span>
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h1 className="text-2xl font-bold mb-6">Complete Your Booking</h1>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Guest Details */}
                                <div>
                                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <Users size={20} className="text-primary" />
                                        Primary Contact Details
                                    </h2>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Full Name *</label>
                                            <input
                                                type="text"
                                                value={formData.guestName}
                                                onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
                                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Email *</label>
                                            <input
                                                type="email"
                                                value={formData.guestEmail}
                                                onChange={(e) => setFormData(prev => ({ ...prev, guestEmail: e.target.value }))}
                                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Phone Number *</label>
                                            <input
                                                type="tel"
                                                value={formData.guestPhone}
                                                onChange={(e) => setFormData(prev => ({ ...prev, guestPhone: e.target.value }))}
                                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Number of Travelers
                                                {packageDetails?.maxPersons && (
                                                    <span className="text-xs text-gray-500 ml-1">(Max {packageDetails.maxPersons})</span>
                                                )}
                                            </label>
                                            <select
                                                value={formData.numberOfPeople}
                                                onChange={(e) => setFormData(prev => ({ ...prev, numberOfPeople: parseInt(e.target.value) }))}
                                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            >
                                                {Array.from({ length: packageDetails?.maxPersons || 10 }, (_, i) => i + 1).map(n => (
                                                    <option key={n} value={n}>{n} {n === 1 ? "Person" : "People"}</option>
                                                ))}n                                            </select>
                                        </div>
                                    </div>

                                    {/* Child Policy Notice */}
                                    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                                        <Users size={16} className="text-amber-600 mt-0.5 shrink-0" />
                                        <p className="text-sm text-amber-800">
                                            <span className="font-semibold">Child Policy:</span> Children aged 6-12 years may incur additional charges. Children below 6 years are complimentary.
                                        </p>
                                    </div>
                                </div>

                                {/* Room Selection - Only show if room availability exists */}
                                {hasRoomAvailability && (
                                    <div>
                                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <BedDouble size={20} className="text-primary" />
                                            Select Room Configuration
                                        </h2>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Choose a room combination that fits your group of {formData.numberOfPeople} {formData.numberOfPeople === 1 ? "person" : "people"}.
                                        </p>

                                        {roomConfigurations.length === 0 ? (
                                            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
                                                <p className="font-medium">No room configurations available</p>
                                                <p className="text-sm">Sorry, there are no room combinations available for {formData.numberOfPeople} travelers on this date. Please try a different number of travelers or select another date.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {roomConfigurations.map((config, configIndex) => {
                                                    const configTotal = config.reduce((sum, r) => sum + r.count * r.pricePerRoom, 0)
                                                    const isSelected = JSON.stringify(selectedRoomConfig) === JSON.stringify(config)

                                                    return (
                                                        <button
                                                            key={configIndex}
                                                            type="button"
                                                            onClick={() => setSelectedRoomConfig(config)}
                                                            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${isSelected
                                                                ? "border-primary bg-primary/5"
                                                                : "border-gray-200 hover:border-primary/50"
                                                                }`}
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                                        {config.map((room, roomIndex) => (
                                                                            <span
                                                                                key={roomIndex}
                                                                                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm"
                                                                            >
                                                                                <BedDouble size={14} />
                                                                                {room.count}× {ROOM_TYPE_LABELS[room.roomType]}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {config.map((room, i) => (
                                                                            <span key={i}>
                                                                                {i > 0 && " + "}
                                                                                {room.count} × ₹{room.pricePerRoom.toLocaleString("en-IN")}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="font-bold text-lg text-primary">
                                                                        ₹{configTotal.toLocaleString("en-IN")}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">room total</p>
                                                                </div>
                                                            </div>
                                                            {isSelected && (
                                                                <div className="mt-2 flex items-center gap-1 text-primary text-sm font-medium">
                                                                    <Check size={16} />
                                                                    Selected
                                                                </div>
                                                            )}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Departure */}
                                <div>
                                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <MapPin size={20} className="text-primary" />
                                        Departure City
                                    </h2>
                                    <input
                                        type="text"
                                        value={formData.departureCity}
                                        onChange={(e) => setFormData(prev => ({ ...prev, departureCity: e.target.value }))}
                                        placeholder="Enter your departure city"
                                        required
                                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>

                                {/* Special Requests */}
                                <div>
                                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <MessageSquare size={20} className="text-primary" />
                                        Special Requests (Optional)
                                    </h2>
                                    <textarea
                                        value={formData.specialRequests}
                                        onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                                        rows={4}
                                        placeholder="Any dietary requirements, accessibility needs, or other requests..."
                                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                        {error}
                                    </div>
                                )}

                                {/* Payment Information */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                                    <Shield className="text-blue-600 shrink-0" size={24} />
                                    <div>
                                        <p className="font-medium text-blue-800">Payment Collection</p>
                                        <p className="text-sm text-blue-700">After submitting your booking, our team will contact you to collect payment details and confirm your reservation.</p>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting || (hasRoomAvailability && !selectedRoomConfig)}
                                    className="w-full bg-primary text-white py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            Submitting Booking...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard size={20} />
                                            Submit Booking Request
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Summary Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl p-6 shadow-sm sticky top-8">
                            <h2 className="text-lg font-semibold mb-4">Booking Summary</h2>

                            {packageDetails && (
                                <>
                                    {/* Package Image */}
                                    {packageDetails.image && (
                                        <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
                                            <Image
                                                src={packageDetails.image}
                                                alt={packageDetails.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Package Info */}
                                    <h3 className="font-bold text-lg mb-2">{packageDetails.title}</h3>
                                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                                        <MapPin size={16} />
                                        <span>{packageDetails.destination.name}, {packageDetails.destination.country}</span>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-3 border-y py-4 mb-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-2 text-gray-600">
                                                <Clock size={16} />
                                                Duration
                                            </span>
                                            <span className="font-medium">{packageDetails.duration}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-2 text-gray-600">
                                                <Calendar size={16} />
                                                Travel Date
                                            </span>
                                            <span className="font-medium">{selectedDate || "Flexible"}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-2 text-gray-600">
                                                <Users size={16} />
                                                Travelers
                                            </span>
                                            <span className="font-medium">{formData.numberOfPeople}</span>
                                        </div>
                                    </div>

                                    {/* Coupon Input */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-2 text-gray-700">Promo Code</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                placeholder="Enter Code"
                                                className="flex-1 px-3 py-2 border rounded-lg text-sm uppercase focus:outline-none focus:ring-1 focus:ring-primary"
                                                disabled={!!appliedCoupon}
                                            />
                                            {appliedCoupon ? (
                                                <button
                                                    onClick={removeCoupon}
                                                    type="button"
                                                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg hover:text-red-700 transition"
                                                >
                                                    <X size={18} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleApplyCoupon}
                                                    type="button"
                                                    disabled={!couponCode || validatingCoupon}
                                                    className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm disabled:opacity-50 hover:bg-black transition flex items-center"
                                                >
                                                    {validatingCoupon ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
                                                </button>
                                            )}
                                        </div>
                                        {couponMessage && (
                                            <p className={`text-xs mt-2 flex items-center gap-1 ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                                {couponMessage.type === 'success' && <Check size={12} />}
                                                {couponMessage.text}
                                            </p>
                                        )}
                                    </div>

                                    {/* Price Breakdown */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Price per person</span>
                                            <span>₹{pricePerPerson.toLocaleString("en-IN")}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Number of travelers</span>
                                            <span>× {formData.numberOfPeople}</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-medium">
                                            <span className="text-gray-600">Tour Subtotal</span>
                                            <span>₹{baseTotalPrice.toLocaleString("en-IN")}</span>
                                        </div>
                                        {roomTotalPrice > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="flex items-center gap-1 text-gray-600">
                                                    <BedDouble size={12} /> Room Charges
                                                </span>
                                                <span>+ ₹{roomTotalPrice.toLocaleString("en-IN")}</span>
                                            </div>
                                        )}
                                        {appliedCoupon && (
                                            <div className="flex justify-between text-sm text-green-600 font-medium">
                                                <span className="flex items-center gap-1"><Tag size={12} /> Discount ({appliedCoupon.code})</span>
                                                <span>- ₹{appliedCoupon.discount.toLocaleString("en-IN")}</span>
                                            </div>
                                        )}
                                    </div>

                                    <hr className="mb-4" />

                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span className="text-primary">₹{finalTotalPrice.toLocaleString("en-IN")}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    )
}
