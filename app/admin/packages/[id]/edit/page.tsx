"use client"

import { useState, useEffect, use, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import CloudinaryUpload from "@/components/admin/cloudinary-upload"
import Link from "next/link"
import { useGetDestinationsQuery } from "@/lib/api/destinationsApi"
import { useGetPackageQuery, useUpdatePackageMutation } from "@/lib/api/packagesApi"

interface Destination {
    id: number
    name: string
    country: string
}

interface ItineraryDay {
    day: number
    title: string
    description: string
    duration?: string
    altitude?: string
    showAccommodation?: boolean
}

interface DepartureDate {
    date: string
    seatsRemaining: number | null
    price: number | null
    roomConfig?: Record<number, { quantity: number; price: number; available?: number }>
}

// Tour type options
const TOUR_TYPES = ["Family", "Couples", "Friends", "Adventure", "Cultural & Architecture", "Pilgrim Tours", "Luxury", "Instagrammable"]

export default function EditPackage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const router = useRouter()
    const [formInitialized, setFormInitialized] = useState(false)

    // RTK Query hooks
    const { data: destinationsData } = useGetDestinationsQuery()
    const { data: packageData, isLoading: fetchLoading } = useGetPackageQuery(parseInt(resolvedParams.id))
    const [updatePackage, { isLoading: loading }] = useUpdatePackageMutation()

    // Cast destinations data
    const destinations = useMemo(() => {
        if (!destinationsData) return []
        return destinationsData as Destination[]
    }, [destinationsData])

    // Collapsible sections state
    const [expandedSections, setExpandedSections] = useState({
        basic: true,
        about: true,
        pricing: false,
        roomAvailability: false,
        itinerary: false,
        inclusions: false,
        gallery: false,
        departure: false,
    })

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        originalPrice: "",
        duration: "",
        cities: "",
        destinationId: "",
        image: "",
        mapImage: "",
        highlights: "",
        specialNotes: "",
        inclusions: "",
        exclusions: "",
        tourType: "Family",
        tourCategory: "PRIVATE",
        maxPersons: "10",
        accommodation: "",
        ageRange: "1-80 yrs",
        discountPercent: "",
        tags: "",
        isCustomizable: true,
        bestPrice: true,
        flightsIncluded: false,
        departureType: "Fixed",
        departurePoints: "",
        itineraryPdf: "",
        cancellationPolicy: "",
        priceChartImage: "",
    })

    // Itinerary state
    const [itinerary, setItinerary] = useState<ItineraryDay[]>([
        { day: 1, title: "", description: "" }
    ])

    // Gallery images state
    const [galleryImages, setGalleryImages] = useState<string[]>([])

    // Departure dates state
    const [departureDates, setDepartureDates] = useState<DepartureDate[]>([
        { date: "", seatsRemaining: null, price: null }
    ])

    // Room configuration state
    const [roomConfig, setRoomConfig] = useState<Record<number, { quantity: number; price: number }>>({
        1: { quantity: 0, price: 0 },
        2: { quantity: 0, price: 0 },
        3: { quantity: 0, price: 0 },
        4: { quantity: 0, price: 0 }
    })

    // Upload monitor state
    const [uploadingCount, setUploadingCount] = useState(0)

    const handleUploadStatusChange = (isUploading: boolean) => {
        setUploadingCount(prev => isUploading ? prev + 1 : prev - 1)
    }

    // Initialize form from package data
    useEffect(() => {
        if (packageData && !formInitialized) {
            const pkg = packageData as any

            setFormData({
                title: pkg.title || "",
                description: pkg.description || "",
                price: pkg.price?.toString() || "",
                originalPrice: pkg.originalPrice?.toString() || "",
                duration: pkg.duration || "",
                cities: pkg.cities || "",
                destinationId: pkg.destinationId?.toString() || "",
                image: pkg.image || "",
                mapImage: pkg.mapImage || "",
                highlights: Array.isArray(pkg.highlights) ? pkg.highlights.join("\n") : pkg.highlights || "",
                specialNotes: pkg.specialNotes || "",
                inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions.join("\n") : pkg.inclusions || "",
                exclusions: Array.isArray(pkg.exclusions) ? pkg.exclusions.join("\n") : pkg.exclusions || "",
                tourType: pkg.tourType || "Family",
                tourCategory: pkg.tourCategory || "PRIVATE",
                maxPersons: pkg.maxPersons?.toString() || "10",
                accommodation: pkg.accommodation || "",
                ageRange: pkg.ageRange || "1-80 yrs",
                discountPercent: pkg.discountPercent?.toString() || "",
                tags: Array.isArray(pkg.tags) ? pkg.tags.join(", ") : pkg.tags || "",
                isCustomizable: pkg.isCustomizable ?? true,
                bestPrice: pkg.bestPrice ?? true,
                flightsIncluded: pkg.hasOwnProperty('flightsIncluded') ? pkg.flightsIncluded : false,
                departureType: pkg.departureType || "Fixed",
                departurePoints: Array.isArray(pkg.departurePoints) ? pkg.departurePoints.join(", ") : pkg.departurePoints || "",
                itineraryPdf: pkg.itineraryPdf || "",
                cancellationPolicy: pkg.cancellationPolicy || "",
                priceChartImage: pkg.priceChartImage || "",
            })

            // Populate room config from tour slots
            if (pkg.tourDateSlots && Array.isArray(pkg.tourDateSlots)) {
                const slot = pkg.tourDateSlots.find((s: any) => s.roomAvailability && s.roomAvailability.length > 0)
                if (slot) {
                    const newConfig: any = {
                        1: { quantity: 0, price: 0 },
                        2: { quantity: 0, price: 0 },
                        3: { quantity: 0, price: 0 },
                        4: { quantity: 0, price: 0 }
                    }
                    slot.roomAvailability.forEach((r: any) => {
                        newConfig[r.roomType] = { quantity: r.totalRooms, price: r.pricePerRoom }
                    })
                    setRoomConfig(newConfig)
                }
            }

            // Set itinerary
            if (pkg.itinerary && Array.isArray(pkg.itinerary) && pkg.itinerary.length > 0) {
                setItinerary(pkg.itinerary)
            }

            // Set gallery images
            if (pkg.galleryImages && Array.isArray(pkg.galleryImages) && pkg.galleryImages.length > 0) {
                setGalleryImages(pkg.galleryImages)
            }

            // Set departure dates
            if (pkg.tourDateSlots && Array.isArray(pkg.tourDateSlots) && pkg.tourDateSlots.length > 0) {
                const slots = pkg.tourDateSlots.map((s: any) => {
                    let dateStr = s.dateLabel || ""
                    if (s.startDate) {
                        try {
                            dateStr = new Date(s.startDate).toISOString().split('T')[0]
                        } catch (e) { }
                    }
                    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                        try {
                            const parsed = new Date(`${s.dateLabel} ${new Date().getFullYear()}`)
                            if (!isNaN(parsed.getTime())) {
                                const year = parsed.getFullYear()
                                const month = String(parsed.getMonth() + 1).padStart(2, '0')
                                const day = String(parsed.getDate()).padStart(2, '0')
                                dateStr = `${year}-${month}-${day}`
                            }
                        } catch (e) { }
                    }
                    const rConfig: Record<number, { quantity: number; price: number; available: number }> = {}
                    if (s.roomAvailability) {
                        s.roomAvailability.forEach((r: any) => {
                            rConfig[r.roomType] = { quantity: r.totalRooms, price: r.pricePerRoom, available: r.availableRooms }
                        })
                    }
                    return {
                        date: dateStr,
                        seatsRemaining: s.availableSeats,
                        price: s.price,
                        roomConfig: rConfig
                    }
                })
                setDepartureDates(slots)
            } else if (pkg.upcomingDepartures && Array.isArray(pkg.upcomingDepartures) && pkg.upcomingDepartures.length > 0) {
                const normalizedDates = pkg.upcomingDepartures.map((d: any) => {
                    let dateVal = d.date || ""
                    // Try to convert "Jan 28" to "YYYY-MM-DD" for type="date" input
                    if (dateVal && !/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
                        try {
                            const parsed = new Date(`${dateVal} ${new Date().getFullYear()}`)
                            if (!isNaN(parsed.getTime())) {
                                // Format as YYYY-MM-DD
                                const year = parsed.getFullYear()
                                const month = String(parsed.getMonth() + 1).padStart(2, '0')
                                const day = String(parsed.getDate()).padStart(2, '0')
                                dateVal = `${year}-${month}-${day}`
                            }
                        } catch (e) { }
                    }
                    return { ...d, date: dateVal }
                })
                setDepartureDates(normalizedDates)
            }

            setFormInitialized(true)
        }
    }, [packageData, formInitialized])

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
    }

    // Itinerary handlers
    const addItineraryDay = () => {
        setItinerary(prev => [...prev, { day: prev.length + 1, title: "", description: "" }])
    }

    const removeItineraryDay = (index: number) => {
        setItinerary(prev => {
            const updated = prev.filter((_, i) => i !== index)
            return updated.map((item, i) => ({ ...item, day: i + 1 }))
        })
    }

    const updateItineraryDay = (index: number, field: keyof ItineraryDay, value: string | boolean) => {
        setItinerary(prev => prev.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        ))
    }

    // Gallery handlers
    const addGalleryImage = (url: string) => {
        if (url && !galleryImages.includes(url) && galleryImages.length < 2) {
            setGalleryImages(prev => [...prev, url])
        }
    }

    const removeGalleryImage = (index: number) => {
        setGalleryImages(prev => prev.filter((_, i) => i !== index))
    }

    // Departure date handlers
    const addDepartureDate = () => {
        setDepartureDates(prev => [...prev, { date: "", seatsRemaining: null, price: null }])
    }

    const removeDepartureDate = (index: number) => {
        setDepartureDates(prev => prev.filter((_, i) => i !== index))
    }

    const updateDepartureDate = (index: number, field: keyof DepartureDate, value: string | number | null) => {
        setDepartureDates(prev => prev.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        ))
    }

    // Per-date Room Config State
    const [expandedDepartureRooms, setExpandedDepartureRooms] = useState<Record<number, boolean>>({})

    const toggleDepartureRoom = (index: number) => {
        setExpandedDepartureRooms(prev => ({ ...prev, [index]: !prev[index] }))
    }

    const updateDepartureRoom = (index: number, type: number, field: 'quantity' | 'price' | 'available', value: number) => {
        setDepartureDates(prev => prev.map((item, i) => {
            if (i !== index) return item

            // Initialize config if missing, using global roomConfig as fallback logic for structure
            const currentConfig = item.roomConfig ? { ...item.roomConfig } : {}

            if (!currentConfig[type]) {
                currentConfig[type] = {
                    quantity: roomConfig[type]?.quantity || 0,
                    price: roomConfig[type]?.price || 0,
                    available: roomConfig[type]?.quantity || 0
                }
            } else {
                currentConfig[type] = { ...currentConfig[type] }
            }

            currentConfig[type][field] = value
            return { ...item, roomConfig: currentConfig }
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.image) {
            alert("Please upload a main package image.")
            return
        }

        if (!formData.destinationId) {
            alert("Please select a destination.")
            return
        }

        try {
            await updatePackage({
                id: parseInt(resolvedParams.id),
                data: {
                    ...formData,
                    price: parseFloat(formData.price) || 0,
                    originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
                    destinationId: parseInt(formData.destinationId),
                    discountPercent: formData.discountPercent ? parseInt(formData.discountPercent) : 0,
                    maxPersons: formData.maxPersons ? parseInt(formData.maxPersons) : 10,
                    itinerary: JSON.stringify(itinerary.filter(d => d.title)),
                    galleryImages: galleryImages.join(","),
                    departureDates: JSON.stringify(departureDates.filter(d => d.date)),
                    roomConfig,
                } as any
            }).unwrap()

            router.push("/admin/packages")
        } catch (error: any) {
            console.error("Failed to update package:", error)
            alert(error?.data?.error || "Failed to update package")
        }
    }

    const SectionHeader = ({
        title,
        section,
        subtitle
    }: {
        title: string
        section: keyof typeof expandedSections
        subtitle?: string
    }) => (
        <button
            type="button"
            onClick={() => toggleSection(section)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
        >
            <div className="text-left">
                <h3 className="font-semibold text-foreground">{title}</h3>
                {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {expandedSections[section] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
    )

    // Show loading state while fetching data OR while form is not yet initialized
    if (fetchLoading || (!formInitialized && packageData)) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    // Handle case where package was not found
    if (!packageData && !fetchLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p className="text-lg text-muted-foreground">Package not found</p>
                <Link href="/admin/packages">
                    <Button variant="outline">Back to Packages</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/packages">
                    <Button variant="outline" size="icon">
                        <ArrowLeft size={18} />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Edit Package</h1>
                    <p className="text-muted-foreground mt-2">Update package details</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card className="border-border">
                    <CardContent className="p-0">
                        <SectionHeader
                            title="Basic Information"
                            section="basic"
                            subtitle="Package title, destination, duration, and main image"
                        />
                        {expandedSections.basic && (
                            <div className="p-6 pt-4 space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="title">Package Title *</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                            placeholder="e.g., Discover India from North to South"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="destination">Destination *</Label>
                                        <Select
                                            value={formData.destinationId}
                                            onValueChange={(value) => setFormData({ ...formData, destinationId: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select destination" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {destinations.map((dest) => (
                                                    <SelectItem key={dest.id} value={dest.id.toString()}>
                                                        {dest.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="duration">Duration *</Label>
                                        <Input
                                            id="duration"
                                            value={formData.duration}
                                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                            required
                                            placeholder="e.g., 21 days or 9N 10D"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <Label className="mb-3 block">Tour Types (Select one or more)</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-gray-50/50">
                                            {TOUR_TYPES.map((type) => {
                                                const selectedTypes = formData.tourType ? formData.tourType.split(',').map(t => t.trim()) : [];
                                                const isChecked = selectedTypes.includes(type);

                                                return (
                                                    <div key={type} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`type-${type}`}
                                                            checked={isChecked}
                                                            onCheckedChange={(checked) => {
                                                                let newTypes;
                                                                if (checked) {
                                                                    newTypes = [...selectedTypes, type];
                                                                } else {
                                                                    newTypes = selectedTypes.filter(t => t !== type);
                                                                }
                                                                setFormData({ ...formData, tourType: newTypes.join(', ') });
                                                            }}
                                                        />
                                                        <Label
                                                            htmlFor={`type-${type}`}
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                        >
                                                            {type}
                                                        </Label>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="tourCategory">Tour Category</Label>
                                        <Select
                                            value={formData.tourCategory}
                                            onValueChange={(value) => setFormData({ ...formData, tourCategory: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select tour category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PRIVATE">Private Tour</SelectItem>
                                                <SelectItem value="GROUP">Group Tour</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="maxPersons">Max Persons</Label>
                                        <Input
                                            id="maxPersons"
                                            type="number"
                                            min="1"
                                            value={formData.maxPersons}
                                            onChange={(e) => setFormData({ ...formData, maxPersons: e.target.value })}
                                            placeholder="e.g., 10"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="accommodation">Accommodation</Label>
                                        <Input
                                            id="accommodation"
                                            value={formData.accommodation}
                                            onChange={(e) => setFormData({ ...formData, accommodation: e.target.value })}
                                            placeholder="e.g., Hotel, Resort, Camp"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="cities">Cities/Route</Label>
                                        <Input
                                            id="cities"
                                            value={formData.cities}
                                            onChange={(e) => setFormData({ ...formData, cities: e.target.value })}
                                            placeholder="e.g., Delhi, Agra, Jaipur, Varanasi"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="ageRange">Age Range</Label>
                                        <Input
                                            id="ageRange"
                                            value={formData.ageRange}
                                            onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                                            placeholder="e.g., 1-80 yrs"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="flex items-center gap-3">
                                        <Switch
                                            id="isCustomizable"
                                            checked={formData.isCustomizable}
                                            onCheckedChange={(checked) => setFormData({ ...formData, isCustomizable: checked })}
                                        />
                                        <Label htmlFor="isCustomizable">Trip Customizable</Label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Switch
                                            id="bestPrice"
                                            checked={formData.bestPrice}
                                            onCheckedChange={(checked) => setFormData({ ...formData, bestPrice: checked })}
                                        />
                                        <Label htmlFor="bestPrice">Best Price Guaranteed</Label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Switch
                                            id="flightsIncluded"
                                            checked={formData.flightsIncluded}
                                            onCheckedChange={(checked) => setFormData({ ...formData, flightsIncluded: checked })}
                                        />
                                        <Label htmlFor="flightsIncluded">Flights Included</Label>
                                    </div>
                                </div>

                                <div>
                                    <Label>Main Package Image *</Label>
                                    <CloudinaryUpload
                                        value={formData.image}
                                        onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                                        onRemove={() => setFormData(prev => ({ ...prev, image: "" }))}
                                        folder="packages"
                                        onUploadStatusChange={handleUploadStatusChange}
                                    />
                                </div>

                                <div>
                                    <Label>Map/Route Image (Optional)</Label>
                                    <CloudinaryUpload
                                        value={formData.mapImage}
                                        onChange={(url) => setFormData(prev => ({ ...prev, mapImage: url }))}
                                        onRemove={() => setFormData(prev => ({ ...prev, mapImage: "" }))}
                                        folder="packages/maps"
                                        onUploadStatusChange={handleUploadStatusChange}
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* About & Description */}
                <Card className="border-border">
                    <CardContent className="p-0">
                        <SectionHeader
                            title="About the Tour"
                            section="about"
                            subtitle="Description, highlights, and tags"
                        />
                        {expandedSections.about && (
                            <div className="p-6 pt-4 space-y-4">
                                <div>
                                    <Label htmlFor="description">Short Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        placeholder="Brief overview of the package shown in tour cards..."
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="highlights">Highlights (one per line)</Label>
                                    <Textarea
                                        id="highlights"
                                        value={formData.highlights}
                                        onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                                        rows={4}
                                        placeholder="Visit the iconic Taj Mahal
Explore the streets of Old Delhi
Experience the backwaters of Kerala"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="specialNotes">Special Notes (optional)</Label>
                                    <Textarea
                                        id="specialNotes"
                                        value={formData.specialNotes}
                                        onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                                        rows={3}
                                        placeholder="Any special notes or important information for travelers..."
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                                    <Input
                                        id="tags"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        placeholder="e.g., City sightseeing, Cultural, Heritage tours"
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pricing */}
                <Card className="border-border">
                    <CardContent className="p-0">
                        <SectionHeader
                            title="Pricing"
                            section="pricing"
                            subtitle="Price, original price, and discount settings"
                        />
                        {expandedSections.pricing && (
                            <div className="p-6 pt-4 space-y-4">
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div>
                                        <Label htmlFor="price">Selling Price (₹) *</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="1"
                                            min="0"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            required
                                            placeholder="1895"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="originalPrice">Original Price (₹)</Label>
                                        <Input
                                            id="originalPrice"
                                            type="number"
                                            step="1"
                                            min="0"
                                            value={formData.originalPrice}
                                            onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                                            placeholder="4988 (for showing discount)"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="discountPercent">Discount %</Label>
                                        <Input
                                            id="discountPercent"
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={formData.discountPercent}
                                            onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                                            placeholder="62"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Room Configuration */}
                <Card className="border-border">
                    <CardContent className="p-0">
                        <SectionHeader
                            title="Room Configuration"
                            section="roomAvailability"
                            subtitle="Set available quantity and price for each room type"
                        />
                        {expandedSections.roomAvailability && (
                            <div className="p-6 pt-4 space-y-4">
                                <div className="grid gap-4">
                                    {[1, 2, 3, 4].map((type) => (
                                        <div key={type} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg items-center">
                                            <div className="font-semibold">
                                                {type === 1 ? "Single Room (1 Seater)" :
                                                    type === 2 ? "Double Room (2 Seater)" :
                                                        type === 3 ? "Triple Room (3 Seater)" :
                                                            "Quad Room (4 Seater)"}
                                            </div>
                                            <div>
                                                <Label>Total Rooms Available</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={roomConfig[type]?.quantity || 0}
                                                    onChange={(e) => setRoomConfig(prev => ({
                                                        ...prev,
                                                        [type]: { ...prev[type], quantity: parseInt(e.target.value) || 0 }
                                                    }))}
                                                />
                                            </div>
                                            <div>
                                                <Label>Price Per Room (₹)</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={roomConfig[type]?.price || 0}
                                                    onChange={(e) => setRoomConfig(prev => ({
                                                        ...prev,
                                                        [type]: { ...prev[type], price: parseFloat(e.target.value) || 0 }
                                                    }))}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Itinerary */}
                <Card className="border-border">
                    <CardContent className="p-0">
                        <SectionHeader
                            title="Day-wise Itinerary"
                            section="itinerary"
                            subtitle="Add detailed day-by-day itinerary"
                        />
                        {expandedSections.itinerary && (
                            <div className="p-6 pt-4 space-y-4">
                                <div className="border-b pb-4 mb-4">
                                    <Label className="mb-2 block">Upload Itinerary PDF (Optional)</Label>
                                    <CloudinaryUpload
                                        value={formData.itineraryPdf}
                                        onChange={(url) => setFormData(prev => ({ ...prev, itineraryPdf: url }))}
                                        onRemove={() => setFormData(prev => ({ ...prev, itineraryPdf: "" }))}
                                        folder="packages/itineraries"
                                        acceptPdf={true}
                                        onUploadStatusChange={handleUploadStatusChange}
                                    />
                                </div>

                                {itinerary.map((day, index) => (
                                    <div key={index} className="p-4 border rounded-lg space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">Day {day.day}</h4>
                                            {itinerary.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeItineraryDay(index)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            )}
                                        </div>
                                        <div className="grid gap-3 md:grid-cols-2">
                                            <div>
                                                <Label>Title</Label>
                                                <Input
                                                    value={day.title}
                                                    onChange={(e) => updateItineraryDay(index, "title", e.target.value)}
                                                    placeholder="e.g., Arrival in Delhi"
                                                />
                                            </div>
                                            <div>
                                                <Label>Duration (optional)</Label>
                                                <Input
                                                    value={day.duration || ""}
                                                    onChange={(e) => updateItineraryDay(index, "duration", e.target.value)}
                                                    placeholder="e.g., 6-8 hours"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Description</Label>
                                            <Textarea
                                                value={day.description}
                                                onChange={(e) => updateItineraryDay(index, "description", e.target.value)}
                                                rows={3}
                                                placeholder="Activities and details for this day..."
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={day.showAccommodation !== false}
                                                onCheckedChange={(checked) => updateItineraryDay(index, "showAccommodation", checked)}
                                            />
                                            <Label>Show Accommodation</Label>
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addItineraryDay}
                                    className="w-full gap-2"
                                >
                                    <Plus size={16} /> Add Day
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Inclusions/Exclusions */}
                <Card className="border-border">
                    <CardContent className="p-0">
                        <SectionHeader
                            title="Inclusions & Exclusions"
                            section="inclusions"
                            subtitle="What's included and not included in the package"
                        />
                        {expandedSections.inclusions && (
                            <div className="p-6 pt-4 space-y-4">
                                <div>
                                    <Label htmlFor="inclusions">Inclusions (one per line)</Label>
                                    <Textarea
                                        id="inclusions"
                                        value={formData.inclusions}
                                        onChange={(e) => setFormData({ ...formData, inclusions: e.target.value })}
                                        rows={6}
                                        placeholder="Accommodation in selected hotels
All meals (breakfast and dinner)
All transfers and sightseeing"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="exclusions">Exclusions (one per line)</Label>
                                    <Textarea
                                        id="exclusions"
                                        value={formData.exclusions}
                                        onChange={(e) => setFormData({ ...formData, exclusions: e.target.value })}
                                        rows={6}
                                        placeholder="International/domestic flights
Personal expenses
Travel insurance"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                                    <Textarea
                                        id="cancellationPolicy"
                                        value={formData.cancellationPolicy}
                                        onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
                                        rows={4}
                                        placeholder="Full refund if cancelled 30 days before departure..."
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Gallery */}
                <Card className="border-border">
                    <CardContent className="p-0">
                        <SectionHeader
                            title="Gallery Images"
                            section="gallery"
                            subtitle="Upload additional images for the tour gallery"
                        />
                        {expandedSections.gallery && (
                            <div className="p-6 pt-4 space-y-4">
                                <div>
                                    <Label className="mb-2 block">Add Gallery Image ({galleryImages.length}/2)</Label>
                                    <CloudinaryUpload
                                        value=""
                                        onChange={(url) => addGalleryImage(url)}
                                        folder="packages/gallery"
                                        onUploadStatusChange={handleUploadStatusChange}
                                    />
                                </div>

                                {galleryImages.length > 0 && (
                                    <div className="grid grid-cols-2 gap-3">
                                        {galleryImages.map((url, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={url}
                                                    alt={`Gallery ${index + 1}`}
                                                    className="w-full aspect-square object-cover rounded-lg border"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => removeGalleryImage(index)}
                                                >
                                                    <Trash2 size={12} />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Departure Info */}
                <Card className="border-border">
                    <CardContent className="p-0">
                        <SectionHeader
                            title="Departure Information"
                            section="departure"
                            subtitle="Departure dates, points, and type"
                        />
                        {expandedSections.departure && (
                            <div className="p-6 pt-4 space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="departureType">Departure Type</Label>
                                        <Select
                                            value={formData.departureType}
                                            onValueChange={(value) => setFormData({ ...formData, departureType: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select departure type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Fixed">Fixed Departures</SelectItem>
                                                <SelectItem value="Flexible">Flexible Dates</SelectItem>
                                                <SelectItem value="Any">Any Date</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="departurePoints">Departure Points (comma-separated)</Label>
                                        <Input
                                            id="departurePoints"
                                            value={formData.departurePoints}
                                            onChange={(e) => setFormData({ ...formData, departurePoints: e.target.value })}
                                            placeholder="Delhi, Mumbai, Bangalore"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label>Upcoming Departure Dates</Label>
                                    {departureDates.map((dep, index) => (
                                        <div key={index} className="flex gap-3 items-end flex-wrap">
                                            <div className="flex-1 min-w-[150px]">
                                                <Label className="text-xs">Start Date</Label>
                                                <Input
                                                    type="date"
                                                    value={dep.date}
                                                    onChange={(e) => updateDepartureDate(index, "date", e.target.value)}
                                                />
                                            </div>
                                            <div className="w-28">
                                                <Label className="text-xs">Seats Left</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={dep.seatsRemaining ?? ""}
                                                    onChange={(e) => updateDepartureDate(index, "seatsRemaining", e.target.value ? parseInt(e.target.value) : null)}
                                                    placeholder="Open"
                                                />
                                            </div>
                                            <div className="w-32">
                                                <Label className="text-xs">Price (₹)</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={dep.price ?? ""}
                                                    onChange={(e) => updateDepartureDate(index, "price", e.target.value ? parseInt(e.target.value) : null)}
                                                    placeholder="Default"
                                                />
                                            </div>
                                            {departureDates.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeDepartureDate(index)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            )}
                                            {/* Per-Date Room Config */}
                                            <div className="w-full mt-2 basis-full">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => toggleDepartureRoom(index)}
                                                    className="text-xs h-8"
                                                >
                                                    {expandedDepartureRooms[index] ? "Hide Rooms" : "Manage Rooms"}
                                                </Button>

                                                {
                                                    expandedDepartureRooms[index] && (
                                                        <div className="mt-2 p-3 border rounded bg-slate-50 grid gap-3 w-full">
                                                            <div className="text-xs font-semibold text-muted-foreground mb-1">Override Global Room Config for this Date</div>
                                                            {[1, 2, 3, 4].map(type => {
                                                                const currentQty = dep.roomConfig?.[type]?.quantity ?? roomConfig[type]?.quantity ?? 0
                                                                const currentPrice = dep.roomConfig?.[type]?.price ?? roomConfig[type]?.price ?? 0
                                                                const currentAvail = dep.roomConfig?.[type]?.available ?? currentQty

                                                                return (
                                                                    <div key={type} className="flex items-center gap-3">
                                                                        <div className="w-24 text-xs font-medium">
                                                                            {type === 1 ? "Single" : type === 2 ? "Double" : type === 3 ? "Triple" : "Quad"}
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <div className="flex justify-between mb-1">
                                                                                <span className="text-[10px] text-muted-foreground">Rooms Left</span>
                                                                            </div>
                                                                            <Input
                                                                                type="number" min="0" placeholder="Qty"
                                                                                className="h-8 text-xs"
                                                                                value={currentAvail}
                                                                                onChange={(e) => updateDepartureRoom(index, type, 'available', parseInt(e.target.value) || 0)}
                                                                            />
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <Input
                                                                                type="number" min="0" placeholder="Price"
                                                                                className="h-8 text-xs"
                                                                                value={currentPrice}
                                                                                onChange={(e) => updateDepartureRoom(index, type, 'price', parseFloat(e.target.value) || 0)}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addDepartureDate}
                                        className="w-full gap-2"
                                    >
                                        <Plus size={16} /> Add Departure Date
                                    </Button>
                                </div>

                                {/* Price Chart Image */}
                                <div className="pt-4 border-t">
                                    <Label>Monthly Price Comparison Chart (Optional)</Label>
                                    <p className="text-xs text-muted-foreground mb-2">Upload a landscape image showing monthly price variations (16:9 aspect ratio recommended)</p>
                                    <CloudinaryUpload
                                        value={formData.priceChartImage}
                                        onChange={(url) => setFormData(prev => ({ ...prev, priceChartImage: url }))}
                                        onRemove={() => setFormData(prev => ({ ...prev, priceChartImage: "" }))}
                                        folder="packages/charts"
                                        onUploadStatusChange={handleUploadStatusChange}
                                        aspectRatio="16/9"
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/admin/packages")}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading || uploadingCount > 0} className="bg-primary hover:bg-primary/90">
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin mr-2" />
                                Updating...
                            </>
                        ) : uploadingCount > 0 ? (
                            <>
                                <Loader2 size={16} className="animate-spin mr-2" />
                                Uploading Images...
                            </>
                        ) : (
                            "Update Package"
                        )}
                    </Button>
                </div>
            </form>
        </div >
    )
}
