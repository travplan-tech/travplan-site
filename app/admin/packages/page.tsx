"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { Plus, Edit, Trash2, Search, Star, Loader2 } from "lucide-react"
import CloudinaryUpload from "@/components/admin/cloudinary-upload"
import Link from "next/link"
import { useGetAdminPackagesQuery, useCreateAdminPackageMutation, useUpdateAdminPackageMutation, useDeleteAdminPackageMutation } from "@/lib/api/adminApi"
import { useGetDestinationsQuery } from "@/lib/api/destinationsApi"

interface Package {
    id: number
    title: string
    description: string
    price: number
    duration: string
    cities: string
    rating: number
    image: string
    highlights: string
    destinationId: number
    destination: {
        id: number
        name: string
    }
}

interface Destination {
    id: number
    name: string
}

export default function AdminPackages() {
    const [searchTerm, setSearchTerm] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingPackage, setEditingPackage] = useState<Package | null>(null)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        duration: "",
        cities: "",
        destinationId: "",
        image: "",
        highlights: "",
    })

    // RTK Query hooks
    const { data: packagesData, isLoading: loading, refetch: refetchPackages } = useGetAdminPackagesQuery()
    const { data: destinationsData } = useGetDestinationsQuery()
    const [createPackage] = useCreateAdminPackageMutation()
    const [updatePackage] = useUpdateAdminPackageMutation()
    const [deletePackage] = useDeleteAdminPackageMutation()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const packages: Package[] = Array.isArray(packagesData) ? packagesData : (packagesData as any)?.packages || []
    const destinations: Destination[] = (destinationsData as Destination[]) || []

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const packageData = {
                ...formData,
                price: parseFloat(formData.price),
                destinationId: parseInt(formData.destinationId),
            }

            if (editingPackage) {
                await updatePackage({ id: editingPackage.id, data: packageData }).unwrap()
            } else {
                await createPackage(packageData).unwrap()
            }

            refetchPackages()
            setIsDialogOpen(false)
            resetForm()
        } catch (error) {
            console.error("Failed to save package:", error)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this package?")) return

        try {
            await deletePackage(id).unwrap()
            refetchPackages()
        } catch (error) {
            console.error("Failed to delete package:", error)
        }
    }

    const handleEdit = (pkg: Package) => {
        setEditingPackage(pkg)
        setFormData({
            title: pkg.title,
            description: pkg.description || "",
            price: pkg.price.toString(),
            duration: pkg.duration || "",
            cities: pkg.cities || "",
            destinationId: pkg.destinationId.toString(),
            image: pkg.image || "",
            highlights: pkg.highlights || "",
        })
        setIsDialogOpen(true)
    }

    const resetForm = () => {
        setEditingPackage(null)
        setFormData({
            title: "",
            description: "",
            price: "",
            duration: "",
            cities: "",
            destinationId: "",
            image: "",
            highlights: "",
        })
    }

    const filteredPackages = packages.filter((pkg) =>
        pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.destination.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Packages</h1>
                    <p className="text-muted-foreground mt-2">Manage travel packages</p>
                </div>
                <Link href="/admin/packages/create">
                    <Button className="gap-2 bg-primary hover:bg-primary/90">
                        <Plus size={16} />
                        Add Package
                    </Button>
                </Link>
            </div>

            {/* Dialog for adding/editing */}
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (!open) resetForm()
            }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingPackage ? "Edit Package" : "Add New Package"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="title">Package Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="price">Price (₹)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                    placeholder="24999"
                                />
                            </div>
                            <div>
                                <Label htmlFor="duration">Duration (e.g., 9N 10D)</Label>
                                <Input
                                    id="duration"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    required
                                    placeholder="9N 10D"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="cities">Cities/Itinerary</Label>
                            <Textarea
                                id="cities"
                                value={formData.cities}
                                onChange={(e) => setFormData({ ...formData, cities: e.target.value })}
                                rows={2}
                                placeholder="Mumbai/Pune - Kochi - Munnar - Thekkady - Varkala"
                            />
                        </div>
                        <div>
                            <Label htmlFor="destination">Destination</Label>
                            <Select
                                value={formData.destinationId}
                                onValueChange={(value) => setFormData({ ...formData, destinationId: value })}
                                required
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
                            <Label htmlFor="image">Package Image</Label>
                            <CloudinaryUpload
                                value={formData.image}
                                onChange={(url) => setFormData({ ...formData, image: url })}
                                onRemove={() => setFormData({ ...formData, image: "" })}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Or enter URL manually:
                            </p>
                            <Input
                                id="image"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                placeholder="https://example.com/image.jpg"
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Label htmlFor="highlights">Highlights (comma-separated)</Label>
                            <Textarea
                                id="highlights"
                                value={formData.highlights}
                                onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                                placeholder="Free WiFi, Breakfast included, Airport transfer"
                                rows={2}
                            />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-primary hover:bg-primary/90">
                                {editingPackage ? "Update" : "Create"} Package
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Search */}
            <Card className="border-border">
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                            placeholder="Search packages by title or destination..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Packages Grid */}
            {loading ? (
                <div className="text-center py-8 text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading packages...
                </div>
            ) : filteredPackages.length === 0 ? (
                <Card className="border-border">
                    <CardContent className="py-12 text-center text-muted-foreground">
                        No packages found
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPackages.map((pkg) => (
                        <Card key={pkg.id} className="border-border overflow-hidden hover:shadow-lg transition-shadow pt-0">
                            {pkg.image && (
                                <div className="h-48 bg-muted relative">
                                    <img
                                        src={pkg.image}
                                        alt={pkg.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <CardHeader>
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="text-lg text-foreground line-clamp-2">
                                        {pkg.title}
                                    </CardTitle>
                                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                        {pkg.duration}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" className="text-xs">
                                        {pkg.destination.name}
                                    </Badge>
                                    <div className="flex items-center gap-1 text-yellow-500">
                                        <Star size={14} fill="currentColor" />
                                        <span className="text-xs text-foreground">{pkg.rating.toFixed(1)}</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                    {pkg.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <p className="text-2xl font-bold text-primary">
                                        ₹{pkg.price.toLocaleString("en-IN")}
                                    </p>
                                    <div className="flex gap-2">
                                        <Link href={`/admin/packages/${pkg.id}/edit`}>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="gap-1"
                                            >
                                                <Edit size={14} />
                                            </Button>
                                        </Link>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDelete(pkg.id)}
                                            className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
