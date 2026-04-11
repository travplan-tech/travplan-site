"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { Eye, Search, Filter, Mail, Phone, Trash2, X, MapPin, Calendar, Users, CreditCard } from "lucide-react"
import { useGetAdminBookingsQuery, useUpdateAdminBookingMutation, useDeleteAdminBookingMutation } from "@/lib/api/adminApi"

interface Booking {
    id: number
    bookingRef: string
    guestName: string
    guestEmail: string
    guestPhone: string
    numberOfPeople: number
    selectedDate: string
    departureCity: string
    specialRequests: string | null
    pricePerPerson: number
    totalPrice: number
    status: string
    paymentStatus: string
    paymentId: string | null
    createdAt: string
    user: {
        id: number
        name: string | null
        email: string
    }
    package: {
        id: number
        title: string
        duration: string
        destination: {
            name: string
        }
    } | null
}

const statusColors: Record<string, string> = {
    CONFIRMED: "bg-green-100 text-green-800 border-green-200",
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
    COMPLETED: "bg-blue-100 text-blue-800 border-blue-200",
}

const paymentStatusColors: Record<string, string> = {
    PAID: "bg-green-100 text-green-800 border-green-200",
    UNPAID: "bg-red-100 text-red-800 border-red-200",
    REFUNDED: "bg-gray-100 text-gray-800 border-gray-200",
}

export default function AdminBookings() {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [paymentFilter, setPaymentFilter] = useState("ALL")
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
    const [showDetailModal, setShowDetailModal] = useState(false)

    // RTK Query hooks
    const { data: bookings = [], isLoading: loading } = useGetAdminBookingsQuery()
    const [updateBookingMutation] = useUpdateAdminBookingMutation()
    const [deleteBookingMutation] = useDeleteAdminBookingMutation()

    const updateBooking = async (bookingId: number, data: { status?: string; paymentStatus?: string }) => {
        try {
            await updateBookingMutation({ id: bookingId, data }).unwrap()
        } catch (error) {
            console.error("Failed to update booking:", error)
        }
    }

    const deleteBooking = async (id: number) => {
        if (!confirm("Are you sure you want to delete this booking?")) return

        try {
            await deleteBookingMutation(id).unwrap()
            setShowDetailModal(false)
        } catch (error) {
            console.error("Failed to delete booking:", error)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const filteredBookings = (bookings as Booking[]).filter((booking) => {
        const matchesSearch =
            (booking.bookingRef?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
            booking.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.guestEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (booking.package?.title.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
        const matchesStatus = statusFilter === "ALL" || booking.status === statusFilter
        const matchesPayment = paymentFilter === "ALL" || booking.paymentStatus === paymentFilter
        return matchesSearch && matchesStatus && matchesPayment
    })

    const stats = {
        total: bookings.length,
        totalRevenue: (bookings as Booking[]).filter((b) => b.paymentStatus === "PAID").reduce((sum, b) => sum + b.totalPrice, 0),
        confirmed: (bookings as Booking[]).filter((b) => b.status === "CONFIRMED").length,
        pending: (bookings as Booking[]).filter((b) => b.status === "PENDING").length,
        completed: (bookings as Booking[]).filter((b) => b.status === "COMPLETED").length,
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Bookings Management</h1>
                    <p className="text-muted-foreground mt-2">Manage all customer bookings and payments</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Total Bookings</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-4">
                        <p className="text-sm text-green-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-700">{formatCurrency(stats.totalRevenue)}</p>
                    </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-4">
                        <p className="text-sm text-blue-600">Confirmed</p>
                        <p className="text-2xl font-bold text-blue-700">{stats.confirmed}</p>
                    </CardContent>
                </Card>
                <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="pt-4">
                        <p className="text-sm text-yellow-600">Pending</p>
                        <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
                    </CardContent>
                </Card>
                <Card className="bg-emerald-50 border-emerald-200">
                    <CardContent className="pt-4">
                        <p className="text-sm text-emerald-600">Completed</p>
                        <p className="text-2xl font-bold text-emerald-700">{stats.completed}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-border">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <Input
                                placeholder="Search by reference, name, email, or package..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <Filter size={16} className="mr-2" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Status</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <CreditCard size={16} className="mr-2" />
                                    <SelectValue placeholder="Payment" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Payments</SelectItem>
                                    <SelectItem value="UNPAID">Unpaid</SelectItem>
                                    <SelectItem value="PAID">Paid</SelectItem>
                                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bookings Table */}
            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="text-foreground">
                        All Bookings ({filteredBookings.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading bookings...</div>
                    ) : filteredBookings.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No bookings found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Booking</th>
                                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Customer</th>
                                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Package</th>
                                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Details</th>
                                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBookings.map((booking) => (
                                        <tr key={booking.id} className="border-b border-border hover:bg-muted/50">
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-mono font-bold text-primary">{booking.bookingRef || `#${booking.id}`}</p>
                                                    <p className="text-xs text-muted-foreground">{formatDate(booking.createdAt)}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">{booking.guestName || booking.user?.name || "N/A"}</p>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Mail size={12} />
                                                        {booking.guestEmail || booking.user?.email}
                                                    </p>
                                                    {booking.guestPhone && (
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Phone size={12} />
                                                            {booking.guestPhone}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {booking.package ? (
                                                    <div>
                                                        <p className="text-sm font-medium">{booking.package.title}</p>
                                                        <p className="text-xs text-muted-foreground">{booking.package.destination.name}</p>
                                                        <p className="text-xs text-muted-foreground">{booking.package.duration}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">Package Deleted</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="space-y-1 text-xs">
                                                    {booking.selectedDate && (
                                                        <p className="flex items-center gap-1">
                                                            <Calendar size={12} />
                                                            {booking.selectedDate}
                                                        </p>
                                                    )}
                                                    {booking.departureCity && (
                                                        <p className="flex items-center gap-1">
                                                            <MapPin size={12} />
                                                            {booking.departureCity}
                                                        </p>
                                                    )}
                                                    <p className="flex items-center gap-1">
                                                        <Users size={12} />
                                                        {booking.numberOfPeople} guest{booking.numberOfPeople > 1 ? "s" : ""}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-bold">{formatCurrency(booking.totalPrice)}</p>
                                                <Badge variant="outline" className={paymentStatusColors[booking.paymentStatus] || ""}>
                                                    {booking.paymentStatus}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <Select
                                                    value={booking.status}
                                                    onValueChange={(value) => updateBooking(booking.id, { status: value })}
                                                >
                                                    <SelectTrigger className={`w-[120px] h-8 text-xs ${statusColors[booking.status] || ""}`}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="PENDING">Pending</SelectItem>
                                                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                                        <SelectItem value="COMPLETED">Completed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedBooking(booking)
                                                            setShowDetailModal(true)
                                                        }}
                                                    >
                                                        <Eye size={16} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => deleteBooking(booking.id)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Detail Modal */}
            {showDetailModal && selectedBooking && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <CardHeader className="border-b">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Booking Details</CardTitle>
                                    <p className="text-primary font-mono font-bold">{selectedBooking.bookingRef || `#${selectedBooking.id}`}</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setShowDetailModal(false)}>
                                    <X size={20} />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-medium mb-3">Customer Information</h3>
                                    <div className="bg-muted rounded-lg p-4 space-y-2">
                                        <p><span className="text-muted-foreground">Name:</span> <span className="font-medium">{selectedBooking.guestName}</span></p>
                                        <p><span className="text-muted-foreground">Email:</span> <a href={`mailto:${selectedBooking.guestEmail}`} className="text-primary">{selectedBooking.guestEmail}</a></p>
                                        <p><span className="text-muted-foreground">Phone:</span> <a href={`tel:${selectedBooking.guestPhone}`} className="text-primary">{selectedBooking.guestPhone}</a></p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium mb-3">Package Details</h3>
                                    <div className="bg-muted rounded-lg p-4 space-y-2">
                                        {selectedBooking.package ? (
                                            <>
                                                <p><span className="text-muted-foreground">Package:</span> <span className="font-medium">{selectedBooking.package.title}</span></p>
                                                <p><span className="text-muted-foreground">Destination:</span> <span className="font-medium">{selectedBooking.package.destination.name}</span></p>
                                                <p><span className="text-muted-foreground">Duration:</span> <span className="font-medium">{selectedBooking.package.duration}</span></p>
                                            </>
                                        ) : (
                                            <p className="text-muted-foreground">Package has been deleted</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium mb-3">Trip Details</h3>
                                <div className="bg-muted rounded-lg p-4 grid md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-muted-foreground text-sm">Travel Date</p>
                                        <p className="font-medium">{selectedBooking.selectedDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-sm">Departure City</p>
                                        <p className="font-medium">{selectedBooking.departureCity}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-sm">Number of Guests</p>
                                        <p className="font-medium">{selectedBooking.numberOfPeople}</p>
                                    </div>
                                </div>
                            </div>

                            {selectedBooking.specialRequests && (
                                <div>
                                    <h3 className="font-medium mb-3">Special Requests</h3>
                                    <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
                                        <p>{selectedBooking.specialRequests}</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="font-medium mb-3">Payment Details</h3>
                                <div className="bg-muted rounded-lg p-4 space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Price per person</span>
                                        <span>{formatCurrency(selectedBooking.pricePerPerson)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Number of guests</span>
                                        <span>× {selectedBooking.numberOfPeople}</span>
                                    </div>
                                    <hr />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total Amount</span>
                                        <span className="text-primary">{formatCurrency(selectedBooking.totalPrice)}</span>
                                    </div>
                                    {selectedBooking.paymentId && (
                                        <div className="pt-2">
                                            <span className="text-muted-foreground text-sm">Payment ID: </span>
                                            <span className="font-mono text-sm">{selectedBooking.paymentId}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Booking Status</label>
                                    <Select
                                        value={selectedBooking.status}
                                        onValueChange={(value) => {
                                            updateBooking(selectedBooking.id, { status: value })
                                            setSelectedBooking({ ...selectedBooking, status: value })
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PENDING">Pending</SelectItem>
                                            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                            <SelectItem value="COMPLETED">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Payment Status</label>
                                    <Select
                                        value={selectedBooking.paymentStatus}
                                        onValueChange={(value) => {
                                            updateBooking(selectedBooking.id, { paymentStatus: value })
                                            setSelectedBooking({ ...selectedBooking, paymentStatus: value })
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UNPAID">Unpaid</SelectItem>
                                            <SelectItem value="PAID">Paid</SelectItem>
                                            <SelectItem value="REFUNDED">Refunded</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <a
                                    href={`mailto:${selectedBooking.guestEmail}`}
                                    className="flex-1"
                                >
                                    <Button className="w-full gap-2">
                                        <Mail size={18} />
                                        Email Customer
                                    </Button>
                                </a>
                                <a
                                    href={`tel:${selectedBooking.guestPhone}`}
                                    className="flex-1"
                                >
                                    <Button variant="outline" className="w-full gap-2 bg-green-600 text-white hover:bg-green-700">
                                        <Phone size={18} />
                                        Call Customer
                                    </Button>
                                </a>
                            </div>

                            <p className="text-sm text-muted-foreground text-center">
                                Booked on {formatDate(selectedBooking.createdAt)}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
