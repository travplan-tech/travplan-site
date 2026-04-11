"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, Trash2 } from "lucide-react"
import CloudinaryUpload from "@/components/admin/cloudinary-upload"
import Link from "next/link"
import { useGetPackagesQuery } from "@/lib/api/packagesApi"
import { useGetAdminUsersQuery, useCreateAdminReviewMutation } from "@/lib/api/adminApi"

interface Package {
    id: number
    title: string
}

interface User {
    id: number
    name: string
    email: string
    image: string | null
}

export default function CreateVideoReview() {
    const router = useRouter()
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        userId: "",
        packageId: "",
        rating: "5",
        comment: "",
        designation: "",
        avatar: "",
        image: "",
        images: [] as string[],
        video: "",
        destination: "",
    })
    const [uploadingCount, setUploadingCount] = useState(0)
    const [userNameInput, setUserNameInput] = useState("")
    const [showUserDropdown, setShowUserDropdown] = useState(false)
    const [packageInput, setPackageInput] = useState("")
    const [showPackageDropdown, setShowPackageDropdown] = useState(false)

    // Refs for click-outside detection
    const userDropdownRef = useRef<HTMLDivElement>(null)
    const packageDropdownRef = useRef<HTMLDivElement>(null)

    // RTK Query hooks
    const { data: packagesData } = useGetPackagesQuery({})
    const { data: usersData } = useGetAdminUsersQuery()
    const [createReview, { isLoading: loading }] = useCreateAdminReviewMutation()

    // Cast data
    const packages = useMemo(() => {
        if (!packagesData) return []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = packagesData as any
        return (data.packages || data) as Package[]
    }, [packagesData])

    const users = useMemo(() => {
        if (!usersData) return []
        return usersData as User[]
    }, [usersData])

    // Filter users based on input
    const filteredUsers = useMemo(() => {
        if (!userNameInput.trim()) return users
        const query = userNameInput.toLowerCase()
        return users.filter(user =>
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        )
    }, [userNameInput, users])

    // Filter packages based on input
    const filteredPackages = useMemo(() => {
        if (!packageInput.trim()) return packages
        const query = packageInput.toLowerCase()
        return packages.filter(pkg =>
            pkg.title.toLowerCase().includes(query)
        )
    }, [packageInput, packages])

    // Click outside handlers
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
                setShowUserDropdown(false)
            }
            if (packageDropdownRef.current && !packageDropdownRef.current.contains(event.target as Node)) {
                setShowPackageDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleUploadStatusChange = (isUploading: boolean) => {
        setUploadingCount((prev) => (isUploading ? prev + 1 : prev - 1))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        // Validate required fields
        if (!userNameInput.trim()) {
            setError("Please enter customer name")
            return
        }

        if (!packageInput.trim()) {
            setError("Please enter or select a package")
            return
        }

        try {
            const reviewData: any = {
                ...formData,
                rating: parseInt(formData.rating),
            }

            // If userId exists, use it; otherwise, use userName
            if (formData.userId) {
                reviewData.userId = parseInt(formData.userId)
            } else {
                reviewData.userName = userNameInput
            }

            // If packageId exists, use it; otherwise, use packageName
            if (formData.packageId) {
                reviewData.packageId = parseInt(formData.packageId)
            } else {
                reviewData.packageName = packageInput
            }

            await createReview(reviewData).unwrap()

            router.push("/admin/reviews")
        } catch (error) {
            console.error("Failed to create review:", error)
            setError("Failed to create review")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/reviews">
                    <Button variant="outline" size="icon">
                        <ArrowLeft size={18} />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Add New Review</h1>
                    <p className="text-muted-foreground mt-2">Create a new customer review or video testimonial</p>
                </div>
            </div>

            <Card className="border-border">
                <CardHeader>
                    <CardTitle>Review Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Customer Selection */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="relative" ref={userDropdownRef}>
                                <Label htmlFor="user">Customer Name *</Label>
                                <Input
                                    id="user"
                                    value={userNameInput}
                                    onChange={(e) => {
                                        setUserNameInput(e.target.value)
                                        setShowUserDropdown(true)
                                        // Clear userId when typing new name
                                        if (formData.userId) {
                                            setFormData({ ...formData, userId: "" })
                                        }
                                    }}
                                    onFocus={() => setShowUserDropdown(true)}
                                    placeholder="Type name to search or enter new guest name"
                                    required
                                    autoComplete="off"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Select an existing user from the list, or type a name for a guest review.
                                </p>
                                {showUserDropdown && filteredUsers.length > 0 && (
                                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {filteredUsers.map((user) => (
                                            <button
                                                key={user.id}
                                                type="button"
                                                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex flex-col"
                                                onClick={() => {
                                                    setUserNameInput(user.name)
                                                    setFormData({
                                                        ...formData,
                                                        userId: user.id.toString(),
                                                        avatar: user.image || ""
                                                    })
                                                    setShowUserDropdown(false)
                                                }}
                                            >
                                                <span className="font-medium">{user.name}</span>
                                                <span className="text-sm text-gray-500">{user.email}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="relative" ref={packageDropdownRef}>
                                <Label htmlFor="package">Package *</Label>
                                <Input
                                    id="package"
                                    value={packageInput}
                                    onChange={(e) => {
                                        setPackageInput(e.target.value)
                                        setShowPackageDropdown(true)
                                        // Clear packageId when typing new name
                                        if (formData.packageId) {
                                            setFormData({ ...formData, packageId: "" })
                                        }
                                    }}
                                    onFocus={() => setShowPackageDropdown(true)}
                                    placeholder="Search for a package..."
                                    required
                                    autoComplete="off"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Start typing to find an existing package.
                                </p>
                                {showPackageDropdown && filteredPackages.length > 0 && (
                                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {filteredPackages.map((pkg) => (
                                            <button
                                                key={pkg.id}
                                                type="button"
                                                className="w-full px-4 py-2 text-left hover:bg-gray-100"
                                                onClick={() => {
                                                    setPackageInput(pkg.title)
                                                    setFormData({ ...formData, packageId: pkg.id.toString() })
                                                    setShowPackageDropdown(false)
                                                }}
                                            >
                                                {pkg.title}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="designation">Designation/Title</Label>
                                <Input
                                    id="designation"
                                    value={formData.designation}
                                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                    placeholder="e.g. Traveller"
                                />
                            </div>

                            <div>
                                <Label htmlFor="rating">Rating *</Label>
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
                        </div>

                        {/* Video Testimonial - Optional */}
                        <div className="border-t pt-6 bg-blue-50/50 p-4 rounded-lg border">
                            <Label className="text-lg font-semibold mb-4 block text-blue-800">Video Testimonial (Optional)</Label>
                            <p className="text-sm text-muted-foreground mb-4">
                                Upload a portrait video (9:16 aspect ratio recommended). Max 50MB.
                            </p>
                            <CloudinaryUpload
                                value={formData.video}
                                onChange={(url) => setFormData(prev => ({ ...prev, video: url }))}
                                onRemove={() => setFormData(prev => ({ ...prev, video: "" }))}
                                folder="video-testimonials"
                                resourceType="video"
                                onUploadStatusChange={handleUploadStatusChange}
                            />
                            {formData.video && (
                                <div className="mt-4">
                                    <video
                                        src={formData.video}
                                        className="w-full max-w-xs aspect-9/16 object-cover rounded-2xl border bg-black shadow-lg"
                                        controls
                                        muted
                                    />
                                </div>
                            )}

                            <div className="mt-4">
                                <Label htmlFor="destination">Destination (for badge)</Label>
                                <Input
                                    id="destination"
                                    value={formData.destination}
                                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                    placeholder="e.g., Bali, Vietnam"
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        {/* Customer Avatar */}
                        <div className="border-t pt-6">
                            <Label className="text-lg font-semibold mb-4 block">Customer Avatar</Label>
                            <CloudinaryUpload
                                value={formData.avatar}
                                onChange={(url) => setFormData(prev => ({ ...prev, avatar: url }))}
                                onRemove={() => setFormData(prev => ({ ...prev, avatar: "" }))}
                                folder="review-avatars"
                                onUploadStatusChange={handleUploadStatusChange}
                            />
                            {formData.avatar && (
                                <img src={formData.avatar} className="w-20 h-20 rounded-full mt-4 object-cover" alt="Avatar" />
                            )}
                        </div>

                        {/* Review Images (Multiple) */}
                        <div className="border-t pt-6">
                            <Label className="text-lg font-semibold mb-4 block">Review Photos (Optional)</Label>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {formData.images.map((img, index) => (
                                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-border group">
                                        <img src={img} alt={`Review ${index + 1}`} className="object-cover w-full h-full" />
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
                                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center h-full min-h-[120px]">
                                        <CloudinaryUpload
                                            value=""
                                            onChange={(url) => {
                                                if (url) {
                                                    setFormData(prev => ({ ...prev, images: [...prev.images, url] }))
                                                }
                                            }}
                                            onRemove={() => { }}
                                            onUploadStatusChange={handleUploadStatusChange}
                                        />
                                        <p className="text-xs text-muted-foreground text-center mt-2">Upload Photo</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Review Comment (Optional for video?) */}
                        <div className="border-t pt-6">
                            <Label htmlFor="comment" className="text-lg font-semibold mb-4 block">Written Comment (Optional)</Label>
                            <Textarea
                                id="comment"
                                value={formData.comment}
                                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                rows={3}
                                placeholder="Any additional written feedback..."
                            />
                        </div>

                        <div className="flex gap-4 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push("/admin/reviews")}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || uploadingCount > 0}
                                className="bg-primary hover:bg-primary/90"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin mr-2" />
                                        Creating...
                                    </>
                                ) : uploadingCount > 0 ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin mr-2" />
                                        Uploading...
                                    </>
                                ) : (
                                    "Create Review"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div >
    )
}
