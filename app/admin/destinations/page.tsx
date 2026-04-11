"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Plus, Edit, Trash2, Search, Star, Flag } from "lucide-react";
import CloudinaryUpload from "@/components/admin/cloudinary-upload";
import { useGetAdminDestinationsQuery, useCreateAdminDestinationMutation, useUpdateAdminDestinationMutation, useDeleteAdminDestinationMutation } from "@/lib/api/adminApi";
import Image from "next/image";

interface Destination {
    id: number;
    name: string;
    description: string;
    country: string;
    city: string | null;
    region: string;
    image: string;
    rating: number;
    popularity: number;
    tours: number;
    _count?: {
        packages: number;
    };
}

const REGIONS = [
    "Europe",
    "Asia",
    "South America",
    "Africa",
    "North America",
    "Oceania"
];

export default function AdminDestinations() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDestination, setEditingDestination] =
        useState<Destination | null>(null);
    const [formData, setFormData] = useState({
        country: "",
        city: "",
        region: "",
        description: "",
        image: "",
    });
    const [uploadingCount, setUploadingCount] = useState(0);

    // RTK Query hooks
    const { data: destinations = [], isLoading: loading } = useGetAdminDestinationsQuery();
    const [createDestination] = useCreateAdminDestinationMutation();
    const [updateDestination] = useUpdateAdminDestinationMutation();
    const [deleteDestination] = useDeleteAdminDestinationMutation();

    const handleUploadStatusChange = (isUploading: boolean) => {
        setUploadingCount((prev) => (isUploading ? prev + 1 : prev - 1));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload = {
                name: formData.city ? `${formData.city}, ${formData.country}` : formData.country,
                country: formData.country,
                city: formData.city || null,
                region: formData.region,
                description: formData.description,
                image: formData.image,
                tours: 0,
            };

            if (editingDestination) {
                await updateDestination({
                    id: editingDestination.id,
                    data: payload,
                }).unwrap();
            } else {
                await createDestination(payload).unwrap();
            }

            setIsDialogOpen(false);
            resetForm();
        } catch (error) {
            console.error("Failed to save destination:", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (
            !confirm(
                "Are you sure you want to delete this destination? This will also delete all associated packages."
            )
        )
            return;

        try {
            await deleteDestination(id).unwrap();
        } catch (error) {
            console.error("Failed to delete destination:", error);
        }
    };

    const handleEdit = (dest: Destination) => {
        setEditingDestination(dest);
        setFormData({
            country: dest.country || dest.name || "",
            city: dest.city || "",
            region: dest.region || "",
            description: dest.description || "",
            image: dest.image || "",
        });
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setEditingDestination(null);
        setFormData({
            country: "",
            city: "",
            region: "",
            description: "",
            image: "",
        });
        setUploadingCount(0);
    };

    const filteredDestinations = (destinations as Destination[]).filter(
        (dest) =>
            dest.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dest.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dest.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dest.region?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Destinations Management
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Create and manage travel destinations (countries)
                    </p>
                </div>
                <Button
                    onClick={() => { resetForm(); setIsDialogOpen(true); }}
                    className="gap-2 bg-primary hover:bg-primary/90"
                >
                    <Plus size={16} />
                    Add Country
                </Button>
            </div>

            {/* Dialog for adding/editing */}
            <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                }}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingDestination
                                ? "Edit Destination"
                                : "Add New Destination (Country)"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="country">Country Name *</Label>
                                <Input
                                    id="country"
                                    value={formData.country}
                                    onChange={(e) =>
                                        setFormData({ ...formData, country: e.target.value })
                                    }
                                    required
                                    placeholder="e.g., India, Thailand, France"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    The country for this destination
                                </p>
                            </div>
                            <div>
                                <Label htmlFor="city">City/State (Optional)</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={(e) =>
                                        setFormData({ ...formData, city: e.target.value })
                                    }
                                    placeholder="e.g., Kerala, Goa, Rajasthan"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Leave empty for country-level destination
                                </p>
                            </div>
                            <div>
                                <Label htmlFor="region">Region *</Label>
                                <select
                                    id="region"
                                    value={formData.region}
                                    onChange={(e) =>
                                        setFormData({ ...formData, region: e.target.value })
                                    }
                                    required
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                >
                                    <option value="">Select Region</option>
                                    {REGIONS.map((region) => (
                                        <option key={region} value={region}>
                                            {region}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Used to group destinations in the navigation
                                </p>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                rows={3}
                                placeholder="Brief description about this destination..."
                            />
                        </div>
                        <div>
                            <Label htmlFor="image">Destination Image</Label>
                            <CloudinaryUpload
                                value={formData.image}
                                onChange={(url) => setFormData({ ...formData, image: url })}
                                onRemove={() => setFormData({ ...formData, image: "" })}
                                onUploadStatusChange={handleUploadStatusChange}
                            />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-primary hover:bg-primary/90"
                                disabled={uploadingCount > 0}
                            >
                                {uploadingCount > 0 ? "Uploading..." : editingDestination ? "Update" : "Create"} Destination
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Search */}
            <Card className="border-border">
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            size={18}
                        />
                        <Input
                            placeholder="Search destinations by country or region..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Destinations Grid */}
            {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                    Loading destinations...
                </div>
            ) : filteredDestinations.length === 0 ? (
                <Card className="border-border">
                    <CardContent className="py-12 text-center text-muted-foreground">
                        No destinations found. Add your first destination (country) to get started.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredDestinations.map((dest) => (
                        <Card
                            key={dest.id}
                            className="border-border overflow-hidden hover:shadow-lg transition-shadow pt-0"
                        >
                            {dest.image && (
                                <div className="h-48 bg-muted relative">
                                    <Image
                                        fill
                                        src={dest.image}
                                        alt={dest.country || dest.name}
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <CardHeader>
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 text-yellow-500">
                                            <Star size={14} fill="currentColor" />
                                            <span className="text-xs text-foreground">
                                                {dest.rating.toFixed(1)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Flag size={14} className="text-primary" />
                                            <span className="text-xs text-foreground">
                                                {dest._count?.packages || dest.tours || 0} tours
                                            </span>
                                        </div>
                                    </div>
                                    {dest.region && (
                                        <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                                            {dest.region}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="font-semibold text-lg">
                                        {dest.city ? dest.city : (dest.country || dest.name)}
                                    </p>
                                    {dest.city && (
                                        <Badge variant="outline" className="text-xs">
                                            {dest.country}
                                        </Badge>
                                    )}
                                </div>
                                {dest.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                        {dest.description}
                                    </p>
                                )}
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEdit(dest)}
                                        className="flex-1 gap-1"
                                    >
                                        <Edit size={14} />
                                        Edit
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDelete(dest.id)}
                                        className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
