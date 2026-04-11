"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useState, useMemo } from "react"
import { Search, Trash2, Plus, Edit, Users, Globe, MapPin, Phone, Mail } from "lucide-react"
import CloudinaryUpload from "@/components/admin/cloudinary-upload"
import { useGetAdminExpertsQuery, useCreateAdminExpertMutation, useUpdateAdminExpertMutation, useDeleteAdminExpertMutation } from "@/lib/api/adminApi"

interface TripExpert {
    id: number
    name: string
    email: string | null
    avatar: string | null
    bio: string | null
    expertise: string[]
    whatsappNumber: string | null
    type: string
    isActive: boolean
    order: number
    createdAt: string
}

export default function AdminExperts() {
    const [searchTerm, setSearchTerm] = useState("")
    const [typeFilter, setTypeFilter] = useState("ALL")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingExpert, setEditingExpert] = useState<TripExpert | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        avatar: "",
        bio: "",
        expertise: "",
        whatsappNumber: "",
        type: "INTERNATIONAL",
        isActive: true,
    })

    // RTK Query hooks
    const { data: expertsData, isLoading: loading } = useGetAdminExpertsQuery()
    const [createExpert] = useCreateAdminExpertMutation()
    const [updateExpert] = useUpdateAdminExpertMutation()
    const [deleteExpert] = useDeleteAdminExpertMutation()

    // Cast experts data
    const experts = useMemo(() => {
        if (!expertsData) return []
        return expertsData as TripExpert[]
    }, [expertsData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const payload = {
            ...formData,
            expertise: formData.expertise.split(",").map((e) => e.trim()).filter(Boolean),
        }

        try {
            if (editingExpert) {
                await updateExpert({ id: editingExpert.id, data: payload }).unwrap()
            } else {
                await createExpert(payload).unwrap()
            }
            setIsDialogOpen(false)
            resetForm()
        } catch (error) {
            console.error("Failed to save expert:", error)
        }
    }

    const handleDelete = async (expertId: number) => {
        if (!confirm("Are you sure you want to delete this expert?")) return

        try {
            await deleteExpert(expertId).unwrap()
        } catch (error) {
            console.error("Failed to delete expert:", error)
        }
    }

    const handleEdit = (expert: TripExpert) => {
        setEditingExpert(expert)
        setFormData({
            name: expert.name,
            email: expert.email || "",
            avatar: expert.avatar || "",
            bio: expert.bio || "",
            expertise: expert.expertise.join(", "),
            whatsappNumber: expert.whatsappNumber || "",
            type: expert.type,
            isActive: expert.isActive,
        })
        setIsDialogOpen(true)
    }

    const resetForm = () => {
        setEditingExpert(null)
        setFormData({
            name: "",
            email: "",
            avatar: "",
            bio: "",
            expertise: "",
            whatsappNumber: "",
            type: "INTERNATIONAL",
            isActive: true,
        })
    }

    const filteredExperts = experts.filter((expert) => {
        const matchesSearch =
            expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expert.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expert.expertise.some((e) => e.toLowerCase().includes(searchTerm.toLowerCase()))
        const matchesType =
            typeFilter === "ALL" || expert.type === typeFilter
        return matchesSearch && matchesType
    })

    const domesticCount = experts.filter((e) => e.type === "DOMESTIC").length
    const internationalCount = experts.filter((e) => e.type === "INTERNATIONAL").length

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading experts...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Trip Experts Management</h1>
                    <p className="text-muted-foreground mt-2">Manage trip designers and experts for the customize trip section</p>
                </div>
                <Button
                    onClick={() => { resetForm(); setIsDialogOpen(true); }}
                    className="gap-2 bg-primary hover:bg-primary/90"
                >
                    <Plus size={16} />
                    Add Expert
                </Button>
            </div>

            {/* Dialog for adding/editing */}
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (!open) resetForm()
            }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingExpert ? "Edit Expert" : "Add New Expert"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <Label htmlFor="type">Type *</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DOMESTIC">Domestic</SelectItem>
                                        <SelectItem value="INTERNATIONAL">International</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="expertise">Expertise (Countries/Regions)</Label>
                            <Input
                                id="expertise"
                                value={formData.expertise}
                                onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                                placeholder="India, Nepal, Sri Lanka (comma separated)"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Enter countries or regions separated by commas</p>
                        </div>
                        <div>
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows={3}
                                placeholder="Brief description about the expert..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="expert@example.com"
                                />
                                <p className="text-xs text-muted-foreground mt-1">For receiving trip requests</p>
                            </div>
                            <div>
                                <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                                <Input
                                    id="whatsappNumber"
                                    value={formData.whatsappNumber}
                                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                                    placeholder="919876543210"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Include country code without + sign</p>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="avatar">Avatar Image</Label>
                            <CloudinaryUpload
                                value={formData.avatar}
                                onChange={(url) => setFormData({ ...formData, avatar: url })}
                                onRemove={() => setFormData({ ...formData, avatar: "" })}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                            />
                            <Label htmlFor="isActive">Active (visible on website)</Label>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-primary hover:bg-primary/90">
                                {editingExpert ? "Update" : "Create"} Expert
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Experts</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{experts.length}</div>
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Domestic Experts</CardTitle>
                        <MapPin className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{domesticCount}</div>
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">International Experts</CardTitle>
                        <Globe className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{internationalCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-border">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                                <Input
                                    placeholder="Search by name, bio, or expertise..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="sm:w-48">
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Types</SelectItem>
                                    <SelectItem value="DOMESTIC">Domestic</SelectItem>
                                    <SelectItem value="INTERNATIONAL">International</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Experts Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredExperts.length === 0 ? (
                    <Card className="border-border col-span-full">
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">No experts found</p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredExperts.map((expert) => (
                        <Card key={expert.id} className="border-border hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex gap-4">
                                    <div className="shrink-0">
                                        {expert.avatar ? (
                                            <img
                                                src={expert.avatar}
                                                alt={expert.name}
                                                className="w-16 h-16 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                                <span className="text-primary font-semibold text-xl">
                                                    {expert.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-foreground truncate">{expert.name}</h3>
                                                {expert.email && (
                                                    <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                                                        <Mail size={12} className="shrink-0" />
                                                        <span className="truncate">{expert.email}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant={expert.type === "DOMESTIC" ? "default" : "secondary"}>
                                                        {expert.type === "DOMESTIC" ? (
                                                            <><MapPin size={12} className="mr-1" /> Domestic</>
                                                        ) : (
                                                            <><Globe size={12} className="mr-1" /> International</>
                                                        )}
                                                    </Badge>
                                                    {!expert.isActive && (
                                                        <Badge variant="outline" className="text-muted-foreground">
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {expert.bio && (
                                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{expert.bio}</p>
                                        )}
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {expert.expertise.slice(0, 3).map((exp) => (
                                                <span key={exp} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                                    {exp}
                                                </span>
                                            ))}
                                            {expert.expertise.length > 3 && (
                                                <span className="text-xs text-muted-foreground">
                                                    +{expert.expertise.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                        {expert.whatsappNumber && (
                                            <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
                                                <Phone size={12} />
                                                +{expert.whatsappNumber}
                                            </div>
                                        )}
                                        <div className="flex gap-2 mt-3">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(expert)}
                                                className="h-8 gap-1"
                                            >
                                                <Edit size={14} />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(expert.id)}
                                                className="h-8 gap-1 text-destructive hover:text-destructive"
                                            >
                                                <Trash2 size={14} />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
