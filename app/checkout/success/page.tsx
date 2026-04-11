"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Calendar, MapPin, Users, Mail, Home, Ticket, Clock } from "lucide-react"
import Image from "next/image"
import { useGetBookingByRefQuery } from "@/lib/api/userApi"

function SuccessContent() {
    const searchParams = useSearchParams()
    const bookingRef = searchParams.get("ref") || ""
    const isPending = searchParams.get("pending") === "true"

    // RTK Query hook
    const { data: booking, isLoading: loading, error } = useGetBookingByRefQuery(bookingRef, {
        skip: !bookingRef,
    })

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Booking not found</p>
                    <Link href="/" className="text-primary hover:underline">
                        Go to Homepage
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-green-50 to-white py-12">
            <div className="max-w-3xl mx-auto px-4">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className={`w-20 h-20 ${isPending ? 'bg-yellow-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-6`}>
                        <CheckCircle className={isPending ? 'text-yellow-600' : 'text-green-600'} size={48} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {isPending ? 'Booking Received!' : 'Booking Confirmed!'}
                    </h1>
                    <p className="text-gray-600">
                        {isPending
                            ? 'Thank you for your booking request. Our team will contact you soon!'
                            : 'Thank you for booking with Travplan. Your adventure awaits!'}
                    </p>
                </div>

                {/* Booking Reference */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                    <div className="bg-primary px-6 py-4 text-center">
                        <p className="text-white/80 text-sm">Booking Reference</p>
                        <p className="text-white text-2xl font-bold tracking-wider">{booking.bookingRef}</p>
                    </div>

                    {/* Package Info */}
                    {booking.package && (
                        <div className="p-6 border-b">
                            <div className="flex gap-4">
                                {booking.package.image && (
                                    <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
                                        <Image
                                            src={booking.package.image}
                                            alt={booking.package.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                                <div>
                                    <h2 className="font-bold text-lg">{booking.package.title}</h2>
                                    <p className="text-gray-600 flex items-center gap-1 text-sm">
                                        <MapPin size={14} />
                                        {booking.package.destination.name}
                                    </p>
                                    <p className="text-gray-600 flex items-center gap-1 text-sm">
                                        <Clock size={14} />
                                        {booking.package.duration}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Trip Details */}
                    <div className="p-6 grid md:grid-cols-3 gap-4 border-b">
                        <div>
                            <p className="text-gray-500 text-sm flex items-center gap-2">
                                <Calendar size={16} />
                                Travel Date
                            </p>
                            <p className="font-semibold">{booking.selectedDate}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm flex items-center gap-2">
                                <MapPin size={16} />
                                Departure
                            </p>
                            <p className="font-semibold">{booking.departureCity}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm flex items-center gap-2">
                                <Users size={16} />
                                Travelers
                            </p>
                            <p className="font-semibold">{booking.numberOfPeople} Guest{booking.numberOfPeople > 1 ? "s" : ""}</p>
                        </div>
                    </div>

                    {/* Guest Info */}
                    <div className="p-6 border-b">
                        <h3 className="font-semibold mb-3">Guest Details</h3>
                        <div className="space-y-2 text-sm">
                            <p><span className="text-gray-500">Name:</span> <span className="font-medium">{booking.guestName}</span></p>
                            <p><span className="text-gray-500">Email:</span> <span className="font-medium">{booking.guestEmail}</span></p>
                            <p><span className="text-gray-500">Phone:</span> <span className="font-medium">{booking.guestPhone}</span></p>
                        </div>
                    </div>

                    {/* Room Details */}
                    {booking.roomSelection && (() => {
                        try {
                            const rooms = typeof booking.roomSelection === 'string'
                                ? JSON.parse(booking.roomSelection)
                                : booking.roomSelection

                            if (!Array.isArray(rooms) || rooms.length === 0) return null

                            return (
                                <div className="p-6 border-b">
                                    <h3 className="font-semibold mb-3">Room Configuration</h3>
                                    <div className="space-y-2 text-sm">
                                        {rooms.map((room: any, i: number) => (
                                            <div key={i} className="flex justify-between">
                                                <span className="text-gray-600">
                                                    {room.count}x {
                                                        room.roomType === 1 ? "Single Room (1 Person)" :
                                                            room.roomType === 2 ? "Double Room (2 Persons)" :
                                                                room.roomType === 3 ? "Triple Room (3 Persons)" :
                                                                    "Quad Room (4 Persons)"
                                                    }
                                                </span>
                                                <span className="font-medium">
                                                    ₹{(room.count * room.pricePerRoom).toLocaleString("en-IN")}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        } catch { return null }
                    })()}

                    {/* Payment Summary */}
                    <div className="p-6 bg-gray-50">
                        <h3 className="font-semibold mb-3">Payment Summary</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Price per person</span>
                                <span>₹{booking.pricePerPerson.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Number of guests</span>
                                <span>× {booking.numberOfPeople}</span>
                            </div>
                            {(booking.roomTotalPrice || 0) > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Room Charges</span>
                                    <span>+ ₹{(booking.roomTotalPrice || 0).toLocaleString("en-IN")}</span>
                                </div>
                            )}
                            {booking.discountAmount && booking.discountAmount > 0 && (
                                <div className="flex justify-between text-green-600 font-medium">
                                    <span>Discount {booking.couponCode && `(${booking.couponCode})`}</span>
                                    <span>- ₹{booking.discountAmount.toLocaleString("en-IN")}</span>
                                </div>
                            )}
                            <hr className="my-2" />
                            <div className="flex justify-between text-lg font-bold">
                                <span>{isPending ? 'Total Amount' : 'Total Paid'}</span>
                                <span className="text-primary">₹{booking.totalPrice.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`${isPending ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'} px-3 py-1 rounded-full text-xs font-medium`}>
                                    {isPending ? '⏳ Payment Pending' : `✓ ${booking.paymentStatus}`}
                                </span>
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                                    {booking.status}
                                </span>
                            </div>
                            {booking.paymentId && (
                                <div className="mt-3 pt-2 border-t flex justify-between items-center text-xs">
                                    <span className="text-gray-500">Transaction ID:</span>
                                    <span className="font-mono text-gray-700 select-all">{booking.paymentId}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Confirmation Email Note */}
                <div className={`${isPending ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4 mb-6 flex items-start gap-3`}>
                    <Mail className={`${isPending ? 'text-yellow-600' : 'text-blue-600'} shrink-0 mt-0.5`} size={20} />
                    <div>
                        <p className={`font-medium ${isPending ? 'text-yellow-800' : 'text-blue-800'}`}>
                            {isPending ? 'Important: Payment Collection' : 'Confirmation Email Sent'}
                        </p>
                        <p className={`text-sm ${isPending ? 'text-yellow-700' : 'text-blue-700'}`}>
                            {isPending ? (
                                <>
                                    Our team will contact you shortly at <strong>{booking.guestEmail}</strong> or <strong>{booking.guestPhone}</strong> to collect payment and confirm your booking. Please keep your phone handy!
                                </>
                            ) : (
                                <>
                                    We've sent a confirmation email to <strong>{booking.guestEmail}</strong> with all your booking details.
                                </>
                            )}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        href="/"
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90"
                    >
                        <Home size={20} />
                        Back to Homepage
                    </Link>
                    <Link
                        href="/profile"
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/5"
                    >
                        <Ticket size={20} />
                        View My Bookings
                    </Link>
                </div>

                {/* Contact Info */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p className="mb-2">Need help with your booking?</p>
                    <p>
                        Contact us at{" "}
                        <a href="mailto:Info@Travplan.in" className="text-primary hover:underline">
                            Info@Travplan.in
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function SuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    )
}
