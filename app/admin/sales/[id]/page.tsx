"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import CloudinaryUpload from "@/components/admin/cloudinary-upload";
import { ArrowLeft, Trash2, Search, Plus, X } from "lucide-react";
import Link from "next/link";
import { useGetAdminSaleQuery, useUpdateAdminSaleMutation } from "@/lib/api/adminApi";
import { useGetPackagesQuery } from "@/lib/api/packagesApi";

interface Package {
    id: number;
    title: string;
    price: number;
    image: string;
    destination?: { country: string };
}

export default function EditSalePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    // Form Data
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        heroImage: "",
        isActive: false
    });
    const [uploadingCount, setUploadingCount] = useState(0);
    const [localPackages, setLocalPackages] = useState<Package[]>([]);

    // Package Management
    const [packageSearch, setPackageSearch] = useState("");
    const [searchTrigger, setSearchTrigger] = useState("");

    // RTK Query hooks
    const { data: sale, isLoading: loading } = useGetAdminSaleQuery(parseInt(id), { skip: !id });
    const [updateSale, { isLoading: saving }] = useUpdateAdminSaleMutation();
    const { data: searchData, isFetching: searching } = useGetPackagesQuery(
        { search: searchTrigger, limit: 20 },
        { skip: !searchTrigger }
    );

    const handleUploadStatusChange = (isUploading: boolean) => {
        setUploadingCount((prev) => (isUploading ? prev + 1 : prev - 1));
    };

    // Update form data when sale is fetched
    useEffect(() => {
        if (sale) {
            setFormData({
                name: sale.name,
                slug: sale.slug,
                description: sale.description || "",
                heroImage: sale.heroImage || "",
                isActive: sale.isActive
            });
            setLocalPackages(sale.packages as Package[]);
        }
    }, [sale]);

    // Filter search results to exclude already added packages
    const searchResults = searchTrigger && searchData
        ? (() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = searchData as any;
            const packs = Array.isArray(data) ? data : (data.packages || []);
            const currentIds = new Set(localPackages.map(p => p.id));
            return packs.filter((p: Package) => !currentIds.has(p.id));
        })()
        : [];

    const handleSearchPackages = () => {
        if (!packageSearch.trim()) return;
        setSearchTrigger(packageSearch);
    };

    const handleAddPackage = async (pkg: Package) => {
        if (!id) return;
        const newPackages = [...localPackages, pkg];
        setLocalPackages(newPackages);
        try {
            await updateSale({
                id: parseInt(id),
                data: { packageIds: newPackages.map(p => p.id) } as Record<string, unknown>
            }).unwrap();
        } catch (error) {
            console.error("Failed to add package:", error);
            // Revert on error
            setLocalPackages(localPackages);
        }
    };

    const handleRemovePackage = async (pkgId: number) => {
        if (!id) return;
        const newPackages = localPackages.filter(p => p.id !== pkgId);
        setLocalPackages(newPackages);
        try {
            await updateSale({
                id: parseInt(id),
                data: { packageIds: newPackages.map(p => p.id) } as Record<string, unknown>
            }).unwrap();
        } catch (error) {
            console.error("Failed to remove package:", error);
            // Revert on error
            setLocalPackages([...localPackages]);
        }
    };

    const handleSaveDetails = async (e?: React.FormEvent) => {
        e?.preventDefault();
        try {
            await updateSale({
                id: parseInt(id),
                data: {
                    ...formData,
                    packageIds: localPackages.map(p => p.id)
                } as Record<string, unknown>
            }).unwrap();
        } catch (error) {
            console.error("Failed to save sale:", error);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!sale) return <div className="p-8 text-center">Sale not found</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/sales">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Edit Sale: {sale.name}</h1>
                        <Link href={`/deals/${sale.slug}`} target="_blank" className="text-sm text-blue-600 hover:underline">
                            /deals/{sale.slug}
                        </Link>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push("/admin/sales")}>Cancel</Button>
                    <Button onClick={() => handleSaveDetails()} disabled={saving || uploadingCount > 0} className="bg-primary">
                        {saving ? "Saving..." : uploadingCount > 0 ? "Uploading Image..." : "Save Changes"}
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column: Details */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Sale Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Hero Image</Label>
                                <CloudinaryUpload
                                    value={formData.heroImage}
                                    onChange={(url) => setFormData({ ...formData, heroImage: url })}
                                    onRemove={() => setFormData({ ...formData, heroImage: "" })}
                                    onUploadStatusChange={handleUploadStatusChange}
                                />
                            </div>
                            <div className="flex items-center space-x-2 border p-3 rounded-md">
                                <Switch
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                />
                                <Label htmlFor="isActive">Active</Label>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right/Main Column: Packages */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Manage Packages ({localPackages.length})</CardTitle>
                            <CardDescription>
                                Add packages to this sale. These will appear on the sale page.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Add Package Search */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <Label className="mb-2 block">Add New Package</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <Input
                                            placeholder="Search by package title or country..."
                                            className="pl-9"
                                            value={packageSearch}
                                            onChange={(e) => setPackageSearch(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearchPackages()}
                                        />
                                    </div>
                                    <Button onClick={handleSearchPackages} disabled={searching} variant="secondary">
                                        {searching ? "Searching..." : "Search"}
                                    </Button>
                                </div>

                                {/* Search Results */}
                                {searchResults.length > 0 && (
                                    <div className="mt-4 border rounded-md bg-white max-h-60 overflow-y-auto">
                                        {searchResults.map((pkg: Package) => (
                                            <div key={pkg.id} className="flex items-center justify-between p-3 border-b last:border-0 hover:bg-gray-50">
                                                <div className="flex items-center gap-3">
                                                    {pkg.image && (
                                                        <img src={pkg.image} alt={pkg.title} className="w-10 h-10 rounded object-cover" />
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-sm line-clamp-1">{pkg.title}</p>
                                                        <p className="text-xs text-gray-500">{pkg.destination?.country} • ₹{pkg.price}</p>
                                                    </div>
                                                </div>
                                                <Button size="sm" onClick={() => handleAddPackage(pkg)} className="h-8">
                                                    <Plus size={14} className="mr-1" /> Add
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {searchTrigger && searchResults.length === 0 && !searching && (
                                    <p className="text-sm text-gray-500 mt-2">No packages found for "{searchTrigger}"</p>
                                )}
                            </div>

                            {/* Added Packages List */}
                            <div className="space-y-2">
                                <Label>Packages in Sale</Label>
                                {localPackages.length === 0 ? (
                                    <div className="text-center py-8 border-2 border-dashed rounded-lg text-gray-400">
                                        No packages added yet.
                                    </div>
                                ) : (
                                    <div className="border rounded-md divide-y">
                                        {localPackages.map(pkg => (
                                            <div key={pkg.id} className="flex items-center justify-between p-3 group hover:bg-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden shrink-0">
                                                        {pkg.image ? (
                                                            <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">?</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm text-gray-900 line-clamp-1">{pkg.title}</p>
                                                        <p className="text-xs text-gray-500">ID: {pkg.id}</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleRemovePackage(pkg.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
