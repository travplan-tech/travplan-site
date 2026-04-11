"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    Mail,
    Phone,
    Package,
    Edit,
    ChevronRight,
    Loader2,
    Save,
    X,
    Trash2,
    Calendar,
    MapPin,
    User,
    Clock,
    Star,
    CreditCard,
    Heart
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import CloudinaryUpload from "@/components/admin/cloudinary-upload"
import FavoriteButton from "@/components/FavoriteButton"
import { useGetUserProfileQuery, useUpdateUserProfileMutation, useGetUserBookingsQuery, useGetUserFavoritesQuery } from "@/lib/api/userApi"

interface UserProfile {
    id: number
    name: string | null
    email: string
    image: string | null
    phone: string | null
}

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
    createdAt: string
    hasReviewed: boolean
    package: {
        id: number
        title: string
        image: string | null
        duration: string
        destination: {
            name: string
        }
    } | null
}

export default function ProfilePage() {
    const { data: session, status, update: updateSession } = useSession()
    const router = useRouter()

    // Edit Profile State
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editName, setEditName] = useState("")
    const [editPhone, setEditPhone] = useState("")
    const [editImage, setEditImage] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [activeTab, setActiveTab] = useState<"bookings" | "favorites">("bookings")

    // RTK Query hooks
    const { data: userProfile, isLoading: profileLoading } = useGetUserProfileQuery(undefined, {
        skip: !session?.user
    })
    const { data: bookings = [], isLoading: bookingsLoading } = useGetUserBookingsQuery(undefined, {
        skip: !session?.user
    })
    const { data: favorites = [], isLoading: favoritesLoading } = useGetUserFavoritesQuery(undefined, {
        skip: !session?.user
    })
    const [updateProfile] = useUpdateUserProfileMutation()

    const loading = profileLoading || bookingsLoading

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin")
        }
    }, [status, router])

    // Update edit form when profile data loads
    useEffect(() => {
        if (userProfile) {
            setEditName((userProfile as UserProfile).name || "")
            setEditPhone((userProfile as UserProfile).phone || "")
            setEditImage((userProfile as UserProfile).image || "")
        }
    }, [userProfile])

    const handleUpdateProfile = async () => {
        if (!editName.trim()) return

        setIsSaving(true)
        try {
            await updateProfile({
                name: editName.trim(),
                phone: editPhone.trim() || null,
                image: editImage.trim() || null
            }).unwrap()

            // Update the session with the new name and image
            await updateSession({
                name: editName.trim(),
                image: editImage.trim() || null
            })
            setIsEditDialogOpen(false)
            // Force page refresh to show updated info
            router.refresh()
        } catch (error) {
            console.error("Failed to update profile:", error)
        } finally {
            setIsSaving(false)
        }
    }

    const getInitials = (name?: string | null) => {
        if (!name) return "U"
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "CONFIRMED":
                return "bg-green-100 text-green-700"
            case "PENDING":
                return "bg-yellow-100 text-yellow-700"
            case "CANCELLED":
                return "bg-red-100 text-red-700"
            case "COMPLETED":
                return "bg-blue-100 text-blue-700"
            default:
                return "bg-gray-100 text-gray-700"
        }
    }

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case "PAID":
                return "bg-green-100 text-green-700"
            case "UNPAID":
                return "bg-orange-100 text-orange-700"
            case "REFUNDED":
                return "bg-purple-100 text-purple-700"
            default:
                return "bg-gray-100 text-gray-700"
        }
    }




    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F6F7F8]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading your profile...</p>
                </div>
            </div>
        )
    }

    if (!session?.user) {
        return null
    }

    const typedUserProfile = userProfile as UserProfile | undefined

    return (
        <div className="min-h-screen bg-[#F6F7F8]">


            {/* Hero Section */}
            <section className="bg-primary py-16">
                <div className="container mx-auto px-4 md:px-6 lg:px-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">My Profile</h1>
                    <p className="text-white/80">Manage your account and view your bookings</p>
                </div>
            </section>

            <div className="container mx-auto px-4 md:px-6 lg:px-12 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <Card className="border-0 shadow-lg">
                            <CardContent className="pt-8 text-center">
                                <Avatar className="w-24 h-24 mx-auto mb-4">
                                    <AvatarImage src={typedUserProfile?.image || session.user.image || undefined} />
                                    <AvatarFallback className="bg-primary text-white text-2xl">
                                        {getInitials(typedUserProfile?.name || session.user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">{typedUserProfile?.name || session.user.name}</h2>
                                <p className="text-muted-foreground mb-6">{session.user.email}</p>

                                <div className="space-y-4 text-left border-t pt-6">
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Mail className="w-5 h-5 text-primary" />
                                        <span>{session.user.email}</span>
                                    </div>
                                    {typedUserProfile?.phone && (
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <Phone className="w-5 h-5 text-primary" />
                                            <span>{typedUserProfile.phone}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Package className="w-5 h-5 text-primary" />
                                        <span>{(bookings as Booking[]).filter((b: Booking) => b.status === "CONFIRMED").length} Booking{(bookings as Booking[]).filter((b: Booking) => b.status === "CONFIRMED").length !== 1 ? "s" : ""}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Heart className="w-5 h-5 text-red-500" />
                                        <span>{(favorites as unknown[]).length} Favorite{(favorites as unknown[]).length !== 1 ? "s" : ""}</span>
                                    </div>
                                </div>

                                <Button
                                    className="w-full mt-6"
                                    variant="outline"
                                    onClick={() => setIsEditDialogOpen(true)}
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Profile
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Edit Profile Dialog */}
                        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Edit Profile</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6 py-4">
                                    {/* Profile Image */}
                                    <div className="space-y-3">
                                        <Label>Profile Photo</Label>
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <Avatar className="w-20 h-20">
                                                    <AvatarImage src={editImage || undefined} />
                                                    <AvatarFallback className="bg-primary text-white text-xl">
                                                        {getInitials(editName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <CloudinaryUpload
                                                    value=""
                                                    onChange={(url) => setEditImage(url)}
                                                    folder="profiles"
                                                />
                                                {editImage && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setEditImage("")}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Remove Photo
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name *</Label>
                                        <Input
                                            id="name"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            placeholder="Enter your name"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            value={session.user.email || ""}
                                            disabled
                                            className="bg-muted"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Email cannot be changed
                                        </p>
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <div className="flex">
                                            <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                                                +91
                                            </span>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={editPhone}
                                                onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                placeholder="9876543210"
                                                className="rounded-l-none"
                                                maxLength={10}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Enter 10-digit mobile number
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-4 border-t">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsEditDialogOpen(false)}
                                        disabled={isSaving}
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleUpdateProfile}
                                        disabled={isSaving || !editName.trim()}
                                        className="bg-primary hover:bg-primary/90"
                                    >
                                        {isSaving ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4 mr-2" />
                                        )}
                                        Save Changes
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>

                        {/* Quick Stats */}
                        <Card className="border-0 shadow-lg mt-6">
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-primary/5 rounded-lg">
                                    <p className="text-2xl font-bold text-primary">
                                        {(bookings as Booking[]).filter((b: Booking) => b.status === "CONFIRMED").length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Confirmed</p>
                                </div>
                                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {(bookings as Booking[]).filter((b: Booking) => b.status === "PENDING").length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Pending</p>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <p className="text-2xl font-bold text-green-600">
                                        {(bookings as Booking[]).filter((b: Booking) => b.status === "COMPLETED").length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Completed</p>
                                </div>
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-600">
                                        ₹{(bookings as Booking[]).reduce((sum: number, b: Booking) => sum + b.totalPrice, 0).toLocaleString("en-IN")}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Total Spent</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Bookings & Favorites */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tabs */}
                        <div className="flex gap-2 border-b">
                            <button
                                onClick={() => setActiveTab("bookings")}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === "bookings"
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-gray-700"
                                }`}
                            >
                                <Package className="w-4 h-4" />
                                My Bookings
                                <Badge variant="secondary" className="ml-1 text-xs">
                                    {(bookings as Booking[]).length}
                                </Badge>
                            </button>
                            <button
                                onClick={() => setActiveTab("favorites")}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === "favorites"
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-gray-700"
                                }`}
                            >
                                <Heart className="w-4 h-4" />
                                My Favorites
                                <Badge variant="secondary" className="ml-1 text-xs">
                                    {(favorites as unknown[]).length}
                                </Badge>
                            </button>
                        </div>

                        {/* Bookings Tab */}
                        {activeTab === "bookings" && (
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>My Bookings</CardTitle>
                                <Link href="/tours">
                                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                                        Book New Trip
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                {(bookings as Booking[]).length === 0 ? (
                                    <div className="text-center py-12">
                                        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Bookings</h3>
                                        <p className="text-muted-foreground mb-6">
                                            You don&apos;t have any active bookings. Start exploring our packages!
                                        </p>
                                        <Link href="/tours">
                                            <Button className="bg-primary hover:bg-primary/90">
                                                Explore Packages
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {(bookings as Booking[]).map((booking: Booking) => (
                                            <div key={booking.id}
                                                className="border rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                                    {/* Package Image - Hidden on very small screens */}
                                                    <div className="hidden sm:block w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0">
                                                        <img
                                                            src={booking.package?.image || "/placeholder.jpg"}
                                                            alt={booking.package?.title || 'Package'}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>

                                                    {/* Booking Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                                            <div className="min-w-0">
                                                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-1 sm:truncate">
                                                                    {booking.package?.title || <span className="text-muted-foreground italic">Package Deleted</span>}
                                                                </h3>
                                                                <p className="text-xs sm:text-sm text-muted-foreground">
                                                                    Ref: {booking.bookingRef}
                                                                </p>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1.5 sm:gap-2 shrink-0">
                                                                <Badge className={`text-[10px] sm:text-xs ${getStatusColor(booking.status)}`}>
                                                                    {booking.status}
                                                                </Badge>
                                                                <Badge className={`text-[10px] sm:text-xs ${getPaymentStatusColor(booking.paymentStatus)}`}>
                                                                    {booking.paymentStatus}
                                                                </Badge>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-xs sm:text-sm">
                                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                                                                <span className="truncate">{booking.selectedDate}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                                                                <span className="truncate">{booking.departureCity}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                                <User className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                                                                <span>{booking.numberOfPeople} Guest{booking.numberOfPeople > 1 ? "s" : ""}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                                <Clock className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                                                                <span>{booking.package?.duration || '-'}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 pt-3 border-t gap-2 sm:gap-0">
                                                            <span className="text-lg sm:text-xl font-bold text-primary">
                                                                ₹{booking.totalPrice.toLocaleString("en-IN")}
                                                            </span>
                                                            <div className="flex flex-wrap gap-2">
                                                                {booking.paymentStatus === "UNPAID" && (
                                                                    <div className="flex items-center gap-2 text-xs text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded-md border border-yellow-200">
                                                                        <Clock className="w-4 h-4" />
                                                                        <span>Our team will contact you soon to collect payment</span>
                                                                    </div>
                                                                )}

                                                                {booking.status === "COMPLETED" && !booking.hasReviewed && booking.package && (
                                                                    <Link href={`/review?packageId=${booking.package.id}&bookingRef=${booking.bookingRef}`}>
                                                                        <Button variant="outline" size="sm" className="text-amber-600 border-amber-200 hover:bg-amber-50">
                                                                            <Star className="w-4 h-4 mr-1" />
                                                                            Write Review
                                                                        </Button>
                                                                    </Link>
                                                                )}

                                                                <Link href={`/profile/bookings/${booking.bookingRef}`}>
                                                                    <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                                                                        See Details
                                                                        <ChevronRight className="w-4 h-4 ml-1" />
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        )}

                        {/* Favorites Tab */}
                        {activeTab === "favorites" && (
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>My Favorites</CardTitle>
                                <Link href="/tours">
                                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                                        Explore Tours
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                {favoritesLoading ? (
                                    <div className="text-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                                        <p className="text-muted-foreground">Loading favorites...</p>
                                    </div>
                                ) : (favorites as { id: number; packageId: number; package: { id: number; title: string; image: string | null; price: number; originalPrice: number | null; duration: string; rating: number; tourType: string | null; destination: { name: string; country: string | null } } }[]).length === 0 ? (
                                    <div className="text-center py-12">
                                        <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Favorites Yet</h3>
                                        <p className="text-muted-foreground mb-6">
                                            Start exploring tours and save the ones you love!
                                        </p>
                                        <Link href="/tours">
                                            <Button className="bg-primary hover:bg-primary/90">
                                                Explore Tours
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {(favorites as { id: number; packageId: number; package: { id: number; title: string; image: string | null; price: number; originalPrice: number | null; duration: string; rating: number; tourType: string | null; destination: { name: string; country: string | null } } }[]).map((fav) => (
                                            <div
                                                key={fav.id}
                                                className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow group"
                                            >
                                                <div className="relative h-40">
                                                    <img
                                                        src={fav.package.image || "/placeholder.jpg"}
                                                        alt={fav.package.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute top-2 right-2">
                                                        <FavoriteButton packageId={fav.package.id} size="sm" />
                                                    </div>
                                                    {fav.package.tourType && (
                                                        <Badge className="absolute bottom-2 left-2 bg-primary/90 text-white text-[10px]">
                                                            {fav.package.tourType}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="p-3">
                                                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 mb-1">
                                                        {fav.package.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            <span>{fav.package.destination.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            <span>{fav.package.duration}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                                            <span className="text-sm font-medium">{fav.package.rating.toFixed(1)}</span>
                                                        </div>
                                                        <div className="flex items-baseline gap-1">
                                                            {fav.package.originalPrice && fav.package.originalPrice > fav.package.price && (
                                                                <span className="text-xs text-muted-foreground line-through">
                                                                    ₹{fav.package.originalPrice.toLocaleString("en-IN")}
                                                                </span>
                                                            )}
                                                            <span className="text-base font-bold text-primary">
                                                                ₹{fav.package.price.toLocaleString("en-IN")}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Link href={`/destinations/trip/${fav.package.id}`}>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full mt-3 text-primary border-primary/30 hover:bg-primary/5"
                                                        >
                                                            View Details
                                                            <ChevronRight className="w-4 h-4 ml-1" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        )}
                    </div>
                </div>
            </div>
        </div >
    )
}
