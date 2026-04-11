"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { Search, Star, Trash2, Eye, Filter, Plus, Edit } from "lucide-react"
import CloudinaryUpload from "@/components/admin/cloudinary-upload"
import { useGetAdminReviewsQuery, useUpdateAdminReviewMutation, useDeleteAdminReviewMutation } from "@/lib/api/adminApi"
import { useGetPackagesQuery } from "@/lib/api/packagesApi"

interface Review {
    id: number
    rating: number
    comment: string
    designation: string | null
    avatar: string | null
    image: string | null
    images: string | null
    video: string | null
    createdAt: string
    user?: {
        id: number
        name: string
        email: string
    } | null
    userName?: string | null
    package: {
        id: number
        title: string
        destination: {
            name: string
        }
    }
}

export default function AdminReviews() {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState("")
    const [ratingFilter, setRatingFilter] = useState("ALL")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingReview, setEditingReview] = useState<Review | null>(null)
    const [formData, setFormData] = useState({
        userName: "",
        packageId: "",
        rating: "5",
        comment: "",
        designation: "",
        avatar: "",
        image: "",
        images: [] as string[],
        video: "",
    })
    const [uploadingCount, setUploadingCount] = useState(0)

    // RTK Query hooks
    const { data: reviews = [], isLoading: reviewsLoading } = useGetAdminReviewsQuery()
    const { data: packages = [] } = useGetPackagesQuery()
    const [updateReview] = useUpdateAdminReviewMutation()
    const [deleteReviewMutation] = useDeleteAdminReviewMutation()

    const handleUploadStatusChange = (isUploading: boolean) => {
        setUploadingCount(prev => isUploading ? prev + 1 : prev - 1)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingReview) return

        try {
            await updateReview({
                id: editingReview.id,
                data: {
                    ...formData,
                    rating: parseInt(formData.rating),
                    // @ts-ignore
                    packageId: parseInt(formData.packageId),
                },
            }).unwrap()
            setIsDialogOpen(false)
            resetForm()
        } catch (error) {
            console.error("Failed to save review:", error)
        }
    }

    const deleteReview = async (reviewId: number) => {
        if (!confirm("Are you sure you want to delete this review?")) return

        try {
            await deleteReviewMutation(reviewId).unwrap()
        } catch (error) {
            console.error("Failed to delete review:", error)
        }
    }

    const handleEdit = (review: Review) => {
        setEditingReview(review)
        setFormData({
            userName: review.user?.name || review.userName || "",
            packageId: review.package.id.toString(),
            rating: review.rating.toString(),
            comment: review.comment || "",
            designation: review.designation || "",
            avatar: review.avatar || "",
            image: review.image || "",
            images: review.images ? review.images.split(",") : (review.image ? [review.image] : []),
            video: review.video || "",
        })
        setIsDialogOpen(true)
    }

    const resetForm = () => {
        setEditingReview(null)
        setFormData({
            userName: "",
            packageId: "",
            rating: "5",
            comment: "",
            designation: "",
            avatar: "",
            image: "",
            images: [],
            video: "",
        })
    }

    const filteredReviews = (reviews as Review[]).filter((review) => {
        const matchesSearch =
            (review.user?.name || review.userName)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.package.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.comment?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRating =
            ratingFilter === "ALL" || review.rating === parseInt(ratingFilter)
        return matchesSearch && matchesRating
    })

    const averageRating =
        reviews.length > 0
            ? ((reviews as Review[]).reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
            : "0.0"

    if (reviewsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading reviews...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Reviews Management</h1>
                    <p className="text-muted-foreground mt-2">Moderate and manage customer reviews</p>
                </div>
                <Button
                    onClick={() => router.push("/admin/reviews/create")}
                    className="gap-2 bg-primary hover:bg-primary/90"
                >
                    <Plus size={16} />
                    Add Review
                </Button>
            </div>

            {/* Dialog for editing only */}
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (!open) resetForm()
            }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Review</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="userName">Customer Name</Label>
                            <Input
                                id="userName"
                                value={formData.userName}
                                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                                required
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <Label htmlFor="designation">Designation/Title</Label>
                            <Input
                                id="designation"
                                value={formData.designation}
                                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                placeholder="Product Manager"
                            />
                        </div>
                        <div>
                            <Label htmlFor="package">Package</Label>
                            <Select
                                value={formData.packageId}
                                onValueChange={(value) => setFormData({ ...formData, packageId: value })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select package" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(packages as { id: number; title: string }[]).map((pkg) => (
                                        <SelectItem key={pkg.id} value={pkg.id.toString()}>
                                            {pkg.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="rating">Rating</Label>
                            <Select
                                value={formData.rating}
                                onValueChange={(value) => setFormData({ ...formData, rating: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5 Stars</SelectItem>
                                    <SelectItem value="4">4 Stars</SelectItem>
                                    <SelectItem value="3">3 Stars</SelectItem>
                                    <SelectItem value="2">2 Stars</SelectItem>
                                    <SelectItem value="1">1 Star</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="comment">Review Comment</Label>
                            <Textarea
                                id="comment"
                                value={formData.comment}
                                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                rows={4}
                                placeholder="Write the customer's review here..."
                            />
                        </div>
                        <div>
                            <Label htmlFor="avatar">Customer Avatar</Label>
                            <CloudinaryUpload
                                value={formData.avatar}
                                onChange={(url) => setFormData({ ...formData, avatar: url })}
                                onRemove={() => setFormData({ ...formData, avatar: "" })}
                                onUploadStatusChange={handleUploadStatusChange}
                            />
                        </div>
                        <div>
                            <Label htmlFor="video">Video Review (Optional)</Label>
                            <CloudinaryUpload
                                value={formData.video}
                                onChange={(url) => setFormData({ ...formData, video: url })}
                                onRemove={() => setFormData({ ...formData, video: "" })}
                                onUploadStatusChange={handleUploadStatusChange}
                                resourceType="video"
                            />
                        </div>
                        <div>
                            <Label>Review Images (Multiple)</Label>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                {formData.images.map((img, index) => (
                                    <div key={index} className="relative group">
                                        <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
                                            <img src={img} alt={`Review ${index + 1}`} className="object-cover w-full h-full" />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newImages = [...formData.images]
                                                newImages.splice(index, 1)
                                                setFormData({ ...formData, images: newImages })
                                            }}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                <div className="space-y-2">
                                    <CloudinaryUpload
                                        value=""
                                        onChange={(url) => {
                                            if (url) {
                                                setFormData({ ...formData, images: [...formData.images, url] })
                                            }
                                        }}
                                        onRemove={() => { }}
                                        onUploadStatusChange={handleUploadStatusChange}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end items-center">
                            {uploadingCount > 0 && <span className="text-xs text-muted-foreground mr-2">Uploading images...</span>}
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={uploadingCount > 0}>
                                {editingReview ? "Update" : "Create"} Review
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{reviews.length}</div>
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                        <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{averageRating}</div>
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">5-Star Reviews</CardTitle>
                        <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {(reviews as Review[]).filter((r) => r.rating === 5).length}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recent Reviews</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {(reviews as Review[]).filter((r) => {
                                const reviewDate = new Date(r.createdAt)
                                const weekAgo = new Date()
                                weekAgo.setDate(weekAgo.getDate() - 7)
                                return reviewDate > weekAgo
                            }).length}
                        </div>
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
                                    placeholder="Search by customer name, package, or comment..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="sm:w-48">
                            <Select value={ratingFilter} onValueChange={setRatingFilter}>
                                <SelectTrigger>
                                    <Filter size={16} className="mr-2" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Ratings</SelectItem>
                                    <SelectItem value="5">5 Stars</SelectItem>
                                    <SelectItem value="4">4 Stars</SelectItem>
                                    <SelectItem value="3">3 Stars</SelectItem>
                                    <SelectItem value="2">2 Stars</SelectItem>
                                    <SelectItem value="1">1 Star</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Reviews Grid */}
            <div className="grid gap-4">
                {filteredReviews.length === 0 ? (
                    <Card className="border-border">
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">No reviews found</p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredReviews.map((review) => (
                        <Card key={review.id} className="border-border hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex gap-4">
                                    <div className="shrink-0">
                                        {review.avatar ? (
                                            <img
                                                src={review.avatar}
                                                alt={review.user?.name || review.userName || "User"}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                <span className="text-primary font-semibold">
                                                    {(review.user?.name || review.userName || "A").charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="font-semibold text-foreground">{review.user?.name || review.userName || "Anonymous"}</h3>
                                                {review.designation && (
                                                    <p className="text-sm text-muted-foreground">{review.designation}</p>
                                                )}
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {review.package.title} • {review.package.destination.name}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-600 px-2 py-1 rounded">
                                                    <Star size={14} fill="currentColor" />
                                                    <span className="text-sm font-semibold">{review.rating}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {review.comment && (
                                            <p className="text-foreground leading-relaxed">{review.comment}</p>
                                        )}
                                        <div className="flex gap-2 mt-2 flex-wrap">
                                            {(() => {
                                                let displayImages: string[] = []
                                                if (review.images) {
                                                    displayImages = review.images.split(",").filter(Boolean)
                                                } else if (review.image) {
                                                    displayImages = [review.image]
                                                }

                                                if (displayImages.length === 0) return null

                                                return (
                                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                                        {displayImages.map((img, idx) => (
                                                            <div key={idx} className="relative h-20 w-20 shrink-0 rounded-md overflow-hidden border border-border">
                                                                <img src={img.trim()} alt="Review" className="object-cover w-full h-full" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )
                                            })()}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(review)}
                                                    className="h-8 gap-1"
                                                >
                                                    <Edit size={14} />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteReview(review.id)}
                                                    className="h-8 gap-1 text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 size={14} />
                                                    Delete
                                                </Button>
                                            </div>
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
