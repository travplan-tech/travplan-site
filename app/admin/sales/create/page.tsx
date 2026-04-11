"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CloudinaryUpload from "@/components/admin/cloudinary-upload";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCreateAdminSaleMutation } from "@/lib/api/adminApi";

export default function CreateSalePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        heroImage: "",
        isActive: false
    });
    const [uploadingCount, setUploadingCount] = useState(0);

    // RTK Query mutation
    const [createSale, { isLoading: loading }] = useCreateAdminSaleMutation();

    const handleUploadStatusChange = (isUploading: boolean) => {
        setUploadingCount((prev) => (isUploading ? prev + 1 : prev - 1));
    };

    const handleNameChange = (val: string) => {
        setFormData(prev => ({
            ...prev,
            name: val,
            slug: val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await createSale(formData).unwrap();
            // Redirect to edit page to add packages
            router.push(`/admin/sales/${result.id}?new=true`);
        } catch (error) {
            console.error("Failed to create sale:", error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/sales">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Create New Sale Campaign</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Sale Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Sale Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    required
                                    placeholder="e.g., Summer Flash Sale"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">URL Slug *</Label>
                                <Input
                                    id="slug"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    required
                                    placeholder="e.g., summer-flash-sale"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                placeholder="Marketing text shown on the sale page..."
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

                        <div className="flex items-center space-x-2 rounded-lg border p-4 bg-muted/20">
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                            />
                            <div className="flex-1">
                                <Label htmlFor="isActive" className="text-base">Active Status</Label>
                                <p className="text-sm text-muted-foreground">
                                    enable this to make the sale visible to users.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={loading || uploadingCount > 0} className="w-full sm:w-auto">
                                {loading ? "Creating..." : uploadingCount > 0 ? "Uploading Image..." : "Create Sale & Continue to Packages"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
