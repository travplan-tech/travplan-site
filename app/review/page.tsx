"use client"

import { useState, useEffect, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
    Star,
    Loader2,
    Send,
    ArrowLeft,
    CheckCircle,
    Trash2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import CloudinaryUpload from "@/components/admin/cloudinary-upload"
import { useGetPackageQuery } from "@/lib/api/packagesApi"
import { useCreateReviewMutation } from "@/lib/api/reviewsApi"

interface PackagePreview {
    id: number
    title: string
}

function ReviewContent() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()

    const packageId = Number(searchParams.get("packageId"))
    const bookingRef = searchParams.get("bookingRef")

    // RTK Query hooks
    const { data: pkg, isLoading: packageLoading } = useGetPackageQuery(packageId, {
        skip: !packageId
    })
    const [createReview] = useCreateReviewMutation()

    const [rating, setRating] = useState(5)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [comment, setComment] = useState("")
    const [images, setImages] = useState<string[]>([])
    const [video, setVideo] = useState("")
    const [uploadingCount, setUploadingCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push(`/auth/signin?callbackUrl=/review?packageId=${packageId}&bookingRef=${bookingRef}`)
        }
    }, [status, router, packageId, bookingRef])

    const handleUploadStatusChange = (isUploading: boolean) => {
        setUploadingCount(prev => isUploading ? prev + 1 : prev - 1)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            await createReview({
                packageId,
                rating,
                comment,
                images,
                video,
                bookingRef: bookingRef || undefined,
            }).unwrap()
            setSubmitted(true)
        } catch (err: unknown) {
            const error = err as { data?: { error?: string } }
            setError(error?.data?.error || "Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (status === "loading" || packageLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F6F7F8]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    if (!session?.user) {
        return null
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#F6F7F8]">
                <section className="bg-primary py-16">
                    <div className="container mx-auto px-4 md:px-6 lg:px-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Thank You!</h1>
                        <p className="text-white/80">Your review has been submitted successfully</p>
                    </div>
                </section>

                <div className="container mx-auto px-4 md:px-6 lg:px-12 py-16">
                    <Card className="max-w-lg mx-auto border-0 shadow-lg text-center">
                        <CardContent className="pt-12 pb-12">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Review Submitted!</h2>
                            <p className="text-muted-foreground mb-8">
                                Thank you for sharing your experience. Your feedback helps other travelers make informed decisions.
                            </p>
                            <div className="flex gap-4 justify-center">
                                <Link href="/">
                                    <Button variant="outline">Back to Home</Button>
                                </Link>
                                <Link href="/tours">
                                    <Button className="bg-primary hover:bg-primary/90">
                                        Explore More Packages
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F6F7F8]">
            {/* Hero Section */}
            <section className="bg-primary py-16">
                <div className="container mx-auto px-4 md:px-6 lg:px-12">
                    <Link href="/profile" className="inline-flex items-center text-white/80 hover:text-white mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Profile
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Write a Review</h1>
                    <p className="text-white/80">Share your experience with other travelers</p>
                </div>
            </section>

            <div className="container mx-auto px-4 md:px-6 lg:px-12 py-8">
                <div className="max-w-2xl mx-auto">
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl">
                                Review: {pkg?.title || "Package"}
                            </CardTitle>
                            {bookingRef && (
                                <p className="text-sm text-muted-foreground">
                                    Booking Reference: {bookingRef}
                                </p>
                            )}
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Star Rating */}
                                <div className="space-y-3">
                                    <Label className="text-base">Your Rating</Label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoveredRating(star)}
                                                onMouseLeave={() => setHoveredRating(0)}
                                                className="p-1 transition-transform hover:scale-110"
                                            >
                                                <Star
                                                    className={`w-10 h-10 ${star <= (hoveredRating || rating)
                                                        ? "text-yellow-400 fill-yellow-400"
                                                        : "text-gray-300"
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {rating === 5 && "Excellent!"}
                                        {rating === 4 && "Very Good"}
                                        {rating === 3 && "Good"}
                                        {rating === 2 && "Fair"}
                                        {rating === 1 && "Poor"}
                                    </p>
                                </div>

                                {/* Comment */}
                                <div className="space-y-2">
                                    <Label htmlFor="comment">Your Review</Label>
                                    <Textarea
                                        id="comment"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Tell us about your experience - what did you enjoy most? Any tips for future travelers?"
                                        rows={6}
                                        className="resize-none"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Your review will help other travelers plan their trips.
                                    </p>
                                </div>

                                {/* Image Upload */}
                                <div className="space-y-2">
                                    <Label>Add Photos</Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {images.map((img, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                                <img src={img} alt={`Upload ${idx + 1}`} className="object-cover w-full h-full" />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newImages = [...images]
                                                        newImages.splice(idx, 1)
                                                        setImages(newImages)
                                                    }}
                                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        <div className="aspect-square">
                                            <CloudinaryUpload
                                                value=""
                                                onChange={(url) => {
                                                    if (url) setImages([...images, url])
                                                }}
                                                onRemove={() => { }}
                                                onUploadStatusChange={handleUploadStatusChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Video Upload */}
                                <div className="space-y-2">
                                    <Label>Add Video Review (Optional)</Label>
                                    <CloudinaryUpload
                                        value={video}
                                        onChange={setVideo}
                                        onRemove={() => setVideo("")}
                                        onUploadStatusChange={handleUploadStatusChange}
                                        resourceType="video"
                                    />
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={loading || !comment.trim() || uploadingCount > 0}
                                    className="w-full bg-primary hover:bg-primary/90"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Submit Review
                                        </>
                                    )}
                                </Button>
                                {uploadingCount > 0 && (
                                    <p className="text-xs text-center text-muted-foreground">Please wait for images to finish uploading...</p>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default function ReviewPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#F6F7F8]">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        }>
            <ReviewContent />
        </Suspense>
    )
}
