"use client"

import { Upload, X, Link as LinkIcon, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useRef, useEffect } from "react"
import { useGetUploadSignatureMutation } from "@/lib/api/adminApi"

interface CloudinaryUploadProps {
    value?: string
    onChange: (url: string) => void
    onRemove?: () => void
    folder?: string
    acceptPdf?: boolean
    resourceType?: "image" | "raw" | "video" | "auto"
    onUploadStatusChange?: (isUploading: boolean) => void
    aspectRatio?: string
}

export default function CloudinaryUpload({
    value,
    onChange,
    onRemove,
    folder = "Travplan",
    acceptPdf = false,
    resourceType: propResourceType,
    onUploadStatusChange,
    aspectRatio
}: CloudinaryUploadProps) {
    const [uploadedUrl, setUploadedUrl] = useState(value || "")
    const [isUploading, setIsUploading] = useState(false)
    const [showUrlInput, setShowUrlInput] = useState(false)
    const [urlInput, setUrlInput] = useState("")
    const [fileType, setFileType] = useState<"image" | "pdf" | "video">("image")
    const fileInputRef = useRef<HTMLInputElement>(null)

    // RTK Query mutation for getting upload signature
    const [getUploadSignature] = useGetUploadSignatureMutation()

    // Determine if the uploaded file is a PDF or Video
    const isPdf = (url: string) => {
        return url.toLowerCase().endsWith(".pdf") || url.includes("/raw/")
    }
    const isVideo = (url: string) => {
        return url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes("/video/")
    }

    // Handle file selection
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
        const pdfType = "application/pdf"
        const videoTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"]

        // Build allowed types based on props
        let allowedTypes = [...imageTypes]
        let fileTypesDesc = "JPG, PNG, WebP, or GIF"

        if (acceptPdf) {
            allowedTypes.push(pdfType)
            fileTypesDesc += ", PDF"
        }
        if (propResourceType === "video") {
            allowedTypes = [...videoTypes] // If video strict, only video? Or allow mixed? 
            // Usually if resourceType is video, we only want video.
            fileTypesDesc = "MP4, WebM, OGG, MOV"
        }

        if (!allowedTypes.includes(file.type)) {
            alert(`Please select a valid file (${fileTypesDesc})`)
            return
        }

        const isPdfFile = file.type === pdfType
        const isVideoFile = file.type.startsWith("video/")

        // Limits
        let maxSize = 5 * 1024 * 1024 // 5MB default
        if (isPdfFile) maxSize = 50 * 1024 * 1024 // 50MB
        if (isVideoFile) maxSize = 50 * 1024 * 1024 // 50MB for video

        if (file.size > maxSize) {
            alert(`File size must be less than ${isVideoFile ? "50MB" : (isPdfFile ? "50MB" : "5MB")}`)
            return
        }

        setIsUploading(true)
        onUploadStatusChange?.(true)
        if (isPdfFile) setFileType("pdf")
        else if (isVideoFile) setFileType("video")
        else setFileType("image")

        try {
            // Get signature from our API using RTK Query mutation
            const sigData = await getUploadSignature({
                folder: folder,
                timestamp: Math.floor(Date.now() / 1000),
                resourceType: isVideoFile ? "video" : (isPdfFile ? "raw" : "image"),
            }).unwrap()

            const { signature, timestamp, cloudName, apiKey } = sigData

            // Upload to Cloudinary (external API - must use fetch)
            const formData = new FormData()
            formData.append("file", file)
            formData.append("signature", signature)
            formData.append("timestamp", timestamp.toString())
            formData.append("api_key", apiKey)
            formData.append("folder", folder)

            const uploadEndpoint = isVideoFile ? "video" : (isPdfFile ? "raw" : "image")
            const uploadResponse = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/${uploadEndpoint}/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            )

            if (!uploadResponse.ok) {
                throw new Error("Upload failed")
            }

            const result = await uploadResponse.json()
            const url = result.secure_url

            setUploadedUrl(url)
            onChange(url)
        } catch (error) {
            console.error("Upload error:", error)
            alert("Failed to upload file. Please try again or use URL input.")
        } finally {
            setIsUploading(false)
            onUploadStatusChange?.(false)
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    // Handle URL input
    const handleUrlSubmit = () => {
        if (urlInput.trim()) {
            setUploadedUrl(urlInput.trim())
            onChange(urlInput.trim())
            setUrlInput("")
            setShowUrlInput(false)
        }
    }

    // Sync uploadedUrl when value prop changes (controlled component support)
    useEffect(() => {
        if (value !== undefined && value !== uploadedUrl) {
            setUploadedUrl(value)
        }
    }, [value]) // Only depend on value, not uploadedUrl to prevent loops

    return (
        <div className="space-y-3">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept={
                    propResourceType === "video"
                        ? "video/mp4,video/webm,video/ogg,video/quicktime"
                        : (acceptPdf
                            ? "image/jpeg,image/png,image/webp,image/gif,application/pdf"
                            : "image/jpeg,image/png,image/webp,image/gif")
                }
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Upload buttons */}
            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex-1 gap-2"
                >
                    <Upload size={16} />
                    {isUploading ? "Uploading..." : "Browse Files"}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="gap-2"
                >
                    <LinkIcon size={16} />
                    URL
                </Button>
            </div>

            {/* URL Input */}
            {showUrlInput && (
                <div className="flex gap-2">
                    <Input
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder={acceptPdf ? "https://example.com/file.pdf" : "https://example.com/image.jpg"}
                        className="flex-1"
                    />
                    <Button type="button" onClick={handleUrlSubmit}>
                        Add
                    </Button>
                </div>
            )}

            <p className="text-xs text-muted-foreground">
                {acceptPdf
                    ? "Max 10MB for PDF, 5MB for images. Supported: JPG, PNG, WebP, GIF, PDF"
                    : "Max 5MB. Supported: JPG, PNG, WebP, GIF"}
            </p>

            {/* Preview */}
            {uploadedUrl && (
                <div className="relative">
                    {isPdf(uploadedUrl) ? (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
                            <FileText className="w-10 h-10 text-red-500" />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">PDF Document</p>
                                <a
                                    href={uploadedUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline truncate block"
                                >
                                    View PDF
                                </a>
                            </div>
                            {onRemove && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => {
                                        setUploadedUrl("")
                                        onRemove()
                                    }}
                                >
                                    <X size={16} />
                                </Button>
                            )}
                        </div>
                    ) : isVideo(uploadedUrl) ? (
                        <>
                            <video
                                src={uploadedUrl}
                                controls
                                className="w-full h-48 object-cover rounded-lg border bg-black"
                            />
                            {onRemove && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2"
                                    onClick={() => {
                                        setUploadedUrl("")
                                        onRemove()
                                    }}
                                >
                                    <X size={16} />
                                </Button>
                            )}
                        </>
                    ) : (
                        <>
                            <img
                                src={uploadedUrl}
                                alt="Uploaded"
                                className={`w-full object-cover rounded-lg border ${aspectRatio ? '' : 'h-48'}`}
                                style={aspectRatio ? { aspectRatio } : undefined}
                            />
                            {onRemove && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2"
                                    onClick={() => {
                                        setUploadedUrl("")
                                        onRemove()
                                    }}
                                >
                                    <X size={16} />
                                </Button>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
