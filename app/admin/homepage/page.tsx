"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useMemo, useEffect } from "react"
import { Plus, Edit, Trash2, GripVertical, Award, IndianRupee, Leaf, Star, Globe, Shield, Heart, Zap, Users, MapPin, Clock, CheckCircle, ImageIcon, Loader2, Save } from "lucide-react"
import { useGetAdminFeatureBoxesQuery, useCreateAdminFeatureBoxMutation, useUpdateAdminFeatureBoxMutation, usePatchAdminFeatureBoxMutation, useDeleteAdminFeatureBoxMutation } from "@/lib/api/adminApi"
import { useGetHomepageSettingsQuery, useUpdateHomepageSettingMutation } from "@/lib/api/homepageApi"
import CloudinaryUpload from "@/components/admin/cloudinary-upload"

interface FeatureBox {
    id: number
    title: string
    description: string | null
    icon: string
    order: number
    isActive: boolean
}

const iconOptions = [
    { value: "Award", label: "Award", icon: Award },
    { value: "IndianRupee", label: "Indian Rupee", icon: IndianRupee },
    { value: "Leaf", label: "Leaf", icon: Leaf },
    { value: "Star", label: "Star", icon: Star },
    { value: "Globe", label: "Globe", icon: Globe },
    { value: "Shield", label: "Shield", icon: Shield },
    { value: "Heart", label: "Heart", icon: Heart },
    { value: "Zap", label: "Zap", icon: Zap },
    { value: "Users", label: "Users", icon: Users },
    { value: "MapPin", label: "Map Pin", icon: MapPin },
    { value: "Clock", label: "Clock", icon: Clock },
    { value: "CheckCircle", label: "Check Circle", icon: CheckCircle },
]



export default function HomepageManagement() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingBox, setEditingBox] = useState<FeatureBox | null>(null)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        icon: "Award",
        order: 0,
        isActive: true,
    })

    // RTK Query hooks for Feature Boxes
    const { data: featureBoxesData, isLoading: loading } = useGetAdminFeatureBoxesQuery()
    const [createFeatureBox] = useCreateAdminFeatureBoxMutation()
    const [updateFeatureBox] = useUpdateAdminFeatureBoxMutation()
    const [patchFeatureBox] = usePatchAdminFeatureBoxMutation()
    const [deleteFeatureBox] = useDeleteAdminFeatureBoxMutation()

    // RTK Query hooks for Hero Settings
    const { data: homepageSettings, isLoading: loadingHeroSettings } = useGetHomepageSettingsQuery()
    const [updateHomepageSetting, { isLoading: savingHeroImage }] = useUpdateHomepageSettingMutation()

    // Hero background image state
    const [heroBackgroundImage, setHeroBackgroundImage] = useState("")
    const [bannerImage, setBannerImage] = useState("")
    const defaultHeroImage = "https://images.unsplash.com/photo-1764276266750-4d6316e972e0?q=80&w=1173&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    const defaultBannerImage = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop"

    // Update hero background image and banner when settings load
    useEffect(() => {
        if (homepageSettings?.heroBackgroundImage) {
            setHeroBackgroundImage(homepageSettings.heroBackgroundImage)
        }
        if (homepageSettings?.bannerImage) {
            setBannerImage(homepageSettings.bannerImage)
        }
    }, [homepageSettings])

    // Cast feature boxes data and create mutable copy
    const featureBoxes = useMemo(() => {
        if (!featureBoxesData) return []
        return [...featureBoxesData] as FeatureBox[]
    }, [featureBoxesData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (editingBox) {
                await updateFeatureBox({ id: editingBox.id, data: formData }).unwrap()
            } else {
                await createFeatureBox(formData).unwrap()
            }
            setIsDialogOpen(false)
            resetForm()
        } catch (error) {
            console.error("Failed to save feature box:", error)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this feature box?")) return

        try {
            await deleteFeatureBox(id).unwrap()
        } catch (error) {
            console.error("Failed to delete feature box:", error)
        }
    }

    const handleEdit = (box: FeatureBox) => {
        setEditingBox(box)
        setFormData({
            title: box.title,
            description: box.description || "",
            icon: box.icon,
            order: box.order,
            isActive: box.isActive,
        })
        setIsDialogOpen(true)
    }

    const resetForm = () => {
        setEditingBox(null)
        setFormData({
            title: "",
            description: "",
            icon: "Award",
            order: featureBoxes.length,
            isActive: true,
        })
    }



    const getIconComponent = (iconName: string) => {
        const found = iconOptions.find((opt) => opt.value === iconName)
        return found ? found.icon : Award
    }

    const toggleActive = async (id: number, currentStatus: boolean) => {
        try {
            await patchFeatureBox({ id, data: { isActive: !currentStatus } }).unwrap()
        } catch (error) {
            console.error("Failed to toggle status:", error)
        }
    }

    // Handle hero background image save
    const handleSaveHeroImage = async () => {
        try {
            await updateHomepageSetting({
                key: "heroBackgroundImage",
                value: heroBackgroundImage || defaultHeroImage
            }).unwrap()
            alert("Hero background image saved successfully!")
        } catch (error) {
            console.error("Failed to save hero image:", error)
            alert("Failed to save hero image")
        }
    }

    // Handle banner image save
    const handleSaveBannerImage = async () => {
        try {
            await updateHomepageSetting({
                key: "bannerImage",
                value: bannerImage || defaultBannerImage
            }).unwrap()
            alert("Banner image saved successfully!")
        } catch (error) {
            console.error("Failed to save banner image:", error)
            alert("Failed to save banner image")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Homepage Management</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage the feature boxes displayed on the homepage
                    </p>
                </div>
                <Button
                    onClick={() => {
                        resetForm()
                        setIsDialogOpen(true)
                    }}
                    className="gap-2 bg-primary hover:bg-primary/90"
                >
                    <Plus size={16} />
                    Add Feature Box
                </Button>
            </div>

            {/* Hero Section Settings */}
            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                        <ImageIcon size={20} />
                        Hero Section Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loadingHeroSettings ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading settings...
                        </div>
                    ) : (
                        <>
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Upload Section */}
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="heroImage">Upload New Background Image</Label>
                                        <CloudinaryUpload
                                            value={heroBackgroundImage}
                                            onChange={(url) => setHeroBackgroundImage(url)}
                                            onRemove={() => setHeroBackgroundImage("")}
                                        />
                                    </div>
                                    <Button
                                        onClick={handleSaveHeroImage}
                                        disabled={savingHeroImage}
                                        className="bg-primary hover:bg-primary/90"
                                    >
                                        {savingHeroImage ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                                        ) : (
                                            <><Save className="w-4 h-4 mr-2" /> Save Hero Image</>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Banner Image Settings */}
            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                        <ImageIcon size={20} />
                        Feature Section Banner (Above Feature Boxes)
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loadingHeroSettings ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading settings...
                        </div>
                    ) : (
                        <>
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Upload Section */}
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="bannerImage">Upload Banner Image</Label>
                                        <CloudinaryUpload
                                            value={bannerImage}
                                            onChange={(url) => setBannerImage(url)}
                                            onRemove={() => setBannerImage("")}
                                        />
                                    </div>
                                    <Button
                                        onClick={handleSaveBannerImage}
                                        disabled={savingHeroImage}
                                        className="bg-primary hover:bg-primary/90"
                                    >
                                        {savingHeroImage ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                                        ) : (
                                            <><Save className="w-4 h-4 mr-2" /> Save Banner Image</>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Preview Section */}
            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="text-foreground">Live Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...featureBoxes]
                            .filter((box) => box.isActive)
                            .sort((a, b) => a.order - b.order)
                            .map((box) => {
                                const IconComponent = getIconComponent(box.icon)
                                return (
                                    <div
                                        key={box.id}
                                        className="p-6 rounded-lg bg-primary/10 flex flex-col space-y-3"
                                    >
                                        <h4 className="flex items-center text-xl font-semibold">
                                            <IconComponent className="w-6 h-6 mr-2" />
                                            {box.title}
                                        </h4>
                                        <p className="text-sm">{box.description}</p>
                                    </div>
                                )
                            })}
                    </div>
                    {featureBoxes.filter((box) => box.isActive).length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                            No active feature boxes. Add one to see the preview.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Dialog for adding/editing */}
            <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) resetForm()
                }}
            >
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingBox ? "Edit Feature Box" : "Add New Feature Box"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                placeholder="e.g., Best Tours"
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                placeholder="Describe this feature..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="icon">Icon</Label>
                                <Select
                                    value={formData.icon}
                                    onValueChange={(value) => setFormData({ ...formData, icon: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {iconOptions.map((option) => {
                                            const Icon = option.icon
                                            return (
                                                <SelectItem key={option.value} value={option.value}>
                                                    <div className="flex items-center gap-2">
                                                        <Icon size={16} />
                                                        {option.label}
                                                    </div>
                                                </SelectItem>
                                            )
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="order">Display Order</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                    min={0}
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                            />
                            <Label htmlFor="isActive">Active (visible on homepage)</Label>
                        </div>

                        <div className="flex gap-3 justify-end pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-primary hover:bg-primary/90">
                                {editingBox ? "Update" : "Create"} Feature Box
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Feature Boxes List */}
            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="text-foreground">
                        All Feature Boxes ({featureBoxes.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Loading feature boxes...
                        </div>
                    ) : featureBoxes.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No feature boxes yet. Create one to get started.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {[...featureBoxes]
                                .sort((a, b) => a.order - b.order)
                                .map((box) => {
                                    const IconComponent = getIconComponent(box.icon)
                                    return (
                                        <div
                                            key={box.id}
                                            className={`p-4 rounded-lg border ${box.isActive ? "border-border" : "border-dashed border-gray-300 opacity-60"
                                                } flex items-center gap-4`}
                                        >
                                            <div className="text-muted-foreground cursor-grab">
                                                <GripVertical size={20} />
                                            </div>

                                            <div className={`p-3 rounded-lg bg-primary/10`}>
                                                <IconComponent className={`w-6 h-6`} />
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-foreground">{box.title}</h3>
                                                    <Badge
                                                        variant="outline"
                                                        className={box.isActive ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"}
                                                    >
                                                        {box.isActive ? "Active" : "Inactive"}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        Order: {box.order}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                                    {box.description}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={box.isActive}
                                                    onCheckedChange={() => toggleActive(box.id, box.isActive)}
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEdit(box)}
                                                >
                                                    <Edit size={14} />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDelete(box.id)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
