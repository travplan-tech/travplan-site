"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { Calendar, MapPin, Users, Clock, ArrowLeft, Printer, Ticket, Home } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useGetBookingByRefQuery } from "@/lib/api/userApi"

export default function BookingDetailsPage() {
    const params = useParams()
    const bookingRef = params.ref as string

    // RTK Query hook
    const { data: booking, isLoading: loading, error } = useGetBookingByRefQuery(bookingRef, {
        skip: !bookingRef,
    })

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F6F7F8]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F6F7F8]">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Booking not found</p>
                    <Link href="/profile" className="text-primary hover:underline">
                        Back to Profile
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F6F7F8] py-8">
            <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <Link href="/profile" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Profile
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                        <Printer className="w-4 h-4 mr-2" />
                        Print Details
                    </Button>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                    <div className="bg-primary px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-center md:text-left">
                            <h1 className="text-2xl font-bold text-white mb-1">Booking Details</h1>
                            <p className="text-white/80 text-sm">Review your trip information</p>
                        </div>
                        <div className="bg-white/10 px-4 py-2 rounded-lg text-center">
                            <p className="text-white/80 text-xs uppercase tracking-wider mb-1">Booking Reference</p>
                            <p className="text-white text-xl font-bold font-mono">{booking.bookingRef}</p>
                        </div>
                    </div>

                    {/* Package Info */}
                    {booking.package && (
                        <div className="p-6 border-b">
                            <div className="flex gap-4">
                                {booking.package.image && (
                                    <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden shrink-0">
                                        <Image
                                            src={booking.package.image}
                                            alt={booking.package.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                                <div>
                                    <h2 className="font-bold text-lg md:text-xl text-gray-900 mb-2">{booking.package.title}</h2>
                                    <div className="space-y-1">
                                        <p className="text-gray-600 flex items-center gap-2 text-sm">
                                            <MapPin size={16} className="text-primary" />
                                            {booking.package.destination.name}
                                        </p>
                                        <p className="text-gray-600 flex items-center gap-2 text-sm">
                                            <Clock size={16} className="text-primary" />
                                            {booking.package.duration}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Trip Details Grid */}
                    <div className="p-6 grid md:grid-cols-3 gap-6 border-b bg-gray-50/50">
                        <div>
                            <p className="text-gray-500 text-sm flex items-center gap-2 mb-1">
                                <Calendar size={16} />
                                Travel Date
                            </p>
                            <p className="font-semibold text-gray-900">{booking.selectedDate}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm flex items-center gap-2 mb-1">
                                <MapPin size={16} />
                                Departure
                            </p>
                            <p className="font-semibold text-gray-900">{booking.departureCity}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm flex items-center gap-2 mb-1">
                                <Users size={16} />
                                Travelers
                            </p>
                            <p className="font-semibold text-gray-900">{booking.numberOfPeople} Guest{booking.numberOfPeople > 1 ? "s" : ""}</p>
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
                                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Home className="w-4 h-4 text-primary" />
                                        Room Configuration
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4 grid md:grid-cols-2 gap-4">
                                        {rooms.map((room: any, i: number) => (
                                            <div key={i} className="flex justify-between items-center bg-white p-3 rounded border">
                                                <span className="text-gray-600 font-medium">
                                                    {room.roomType === 1 ? "Single Room" :
                                                        room.roomType === 2 ? "Double Room" :
                                                            room.roomType === 3 ? "Triple Room" :
                                                                "Quad Room"}
                                                    <span className="text-gray-400 text-xs ml-2">({room.count}x)</span>
                                                </span>
                                                <span className="font-semibold text-gray-900">
                                                    ₹{(room.count * room.pricePerRoom).toLocaleString("en-IN")}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        } catch { return null }
                    })()}

                    {/* Content Section */}
                    <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-b">
                        {/* Guest Info */}
                        <div className="p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Users className="w-4 h-4 text-primary" />
                                Guest Details
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-xs">Primary Guest</span>
                                    <span className="font-medium text-base">{booking.guestName}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-xs">Email Address</span>
                                    <span className="font-medium">{booking.guestEmail}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-xs">Phone Number</span>
                                    <span className="font-medium">{booking.guestPhone}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Ticket className="w-4 h-4 text-primary" />
                                Payment Summary
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Price per person</span>
                                    <span>₹{booking.pricePerPerson.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Number of guests</span>
                                    <span>× {booking.numberOfPeople}</span>
                                </div>

                                {booking.roomTotalPrice && booking.roomTotalPrice > 0 ? (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Room Charges</span>
                                        <span>+ ₹{booking.roomTotalPrice.toLocaleString("en-IN")}</span>
                                    </div>
                                ) : null}

                                {booking.discountAmount && booking.discountAmount > 0 ? (
                                    <div className="flex justify-between text-green-600 font-medium">
                                        <span>Discount {booking.couponCode && `(${booking.couponCode})`}</span>
                                        <span>- ₹{booking.discountAmount.toLocaleString("en-IN")}</span>
                                    </div>
                                ) : null}

                                <div className="pt-2 border-t mt-2">
                                    <div className="flex justify-between text-lg font-bold items-center">
                                        <span>Total Amount</span>
                                        <span className="text-primary">₹{booking.totalPrice.toLocaleString("en-IN")}</span>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-2">
                                        <div className={`px-2 py-1 rounded text-xs font-semibold ${booking.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                                            booking.paymentStatus === 'REFUNDED' ? 'bg-purple-100 text-purple-700' :
                                                'bg-orange-100 text-orange-700'
                                            }`}>
                                            {booking.paymentStatus}
                                        </div>
                                        <div className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700 uppercase">
                                            {booking.status}
                                        </div>
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
                    </div>
                </div>
            </div>
        </div>
    )
}
