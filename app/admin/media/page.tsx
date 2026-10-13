"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import {
    Check,
    Copy,
    HardDrive,
    Loader2,
    Search,
    Trash2,
    Upload,
} from "lucide-react"
import type { MediaItem } from "@/components/admin/media-picker"
import { UPLOAD_FOLDERS, thumbnailUrl } from "@/lib/media-folders"

interface Folder {
    name: string
    path: string
}

/** Standalone media library: browse, upload, copy URLs and delete. */
export default function AdminMediaPage() {
    const [items, setItems] = useState<MediaItem[]>([])
    const [folders, setFolders] = useState<Folder[]>([{ name: "All media", path: "all" }])
    const [activeFolder, setActiveFolder] = useState("all")
    const [uploadFolder, setUploadFolder] = useState("TravPlan/site")
    const [type, setType] = useState<"image" | "video">("image")
    const [query, setQuery] = useState("")
    const [cursor, setCursor] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState<string | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)

    const load = useCallback(
        async (opts: { cursor?: string | null } = {}) => {
            setLoading(true)
            setError(null)
            try {
                const params = new URLSearchParams({ folder: activeFolder, type })
                if (query.trim()) params.set("q", query.trim())
                if (opts.cursor) params.set("cursor", opts.cursor)

                const res = await fetch(`/api/admin/media?${params}`)
                if (!res.ok) throw new Error((await res.json()).error || "Failed to load media")
                const data = await res.json()

                setItems((prev) => (opts.cursor ? [...prev, ...data.resources] : data.resources))
                setCursor(data.nextCursor)
            } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to load media")
            } finally {
                setLoading(false)
            }
        },
        [activeFolder, query, type]
    )

    useEffect(() => {
        fetch("/api/admin/media/folders")
            .then((r) => r.json())
            .then((d) => setFolders(d.folders || []))
            .catch(() => undefined)
    }, [])

    useEffect(() => {
        const t = setTimeout(() => load(), 300)
        return () => clearTimeout(t)
    }, [load])

    const upload = async (files: FileList) => {
        setError(null)
        setUploading(files.length)
        try {
            for (const file of Array.from(files)) {
                const timestamp = Math.round(Date.now() / 1000)
                const signRes = await fetch("/api/admin/upload-signature", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ folder: uploadFolder, timestamp }),
                })
                if (!signRes.ok) throw new Error("Could not authorise the upload")
                const { signature, apiKey, cloudName } = await signRes.json()

                const isVideo = file.type.startsWith("video/")
                const form = new FormData()
                form.append("file", file)
                form.append("api_key", apiKey)
                form.append("timestamp", String(timestamp))
                form.append("signature", signature)
                form.append("folder", uploadFolder)

                const res = await fetch(
                    `https://api.cloudinary.com/v1_1/${cloudName}/${isVideo ? "video" : "image"}/upload`,
                    { method: "POST", body: form }
                )
                if (!res.ok) throw new Error(`Upload failed for ${file.name}`)
                setUploading((n) => n - 1)
            }
            await load()
        } catch (e) {
            setError(e instanceof Error ? e.message : "Upload failed")
        } finally {
            setUploading(0)
            if (fileRef.current) fileRef.current.value = ""
        }
    }

    const remove = async (item: MediaItem) => {
        if (!confirm(`Delete this file from Cloudinary permanently?\n\n${item.publicId}`)) return
        try {
            const res = await fetch(
                `/api/admin/media?publicId=${encodeURIComponent(item.publicId)}&type=${item.resourceType}`,
                { method: "DELETE" }
            )
            if (!res.ok) throw new Error((await res.json()).error || "Delete failed")
            setItems((prev) => prev.filter((i) => i.publicId !== item.publicId))
        } catch (e) {
            setError(e instanceof Error ? e.message : "Delete failed")
        }
    }

    const copy = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url)
            setCopied(url)
            setTimeout(() => setCopied(null), 1500)
        } catch {
            setError("Could not copy to the clipboard")
        }
    }

    return (
        <div className="p-4 md:p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <HardDrive size={22} className="text-primary" />
                        Media library
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Everything stored on Cloudinary. Uploads here are served from the CDN.
                    </p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by file name"
                        className="w-full h-10 pl-9 pr-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                </div>

                <select
                    value={activeFolder}
                    onChange={(e) => setActiveFolder(e.target.value)}
                    className="h-10 px-3 text-sm border border-gray-300 rounded-lg bg-white"
                >
                    {folders.map((f) => (
                        <option key={f.path} value={f.path}>
                            {f.name}
                        </option>
                    ))}
                </select>

                <div className="inline-flex rounded-lg bg-gray-100 p-1">
                    {(["image", "video"] as const).map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setType(t)}
                            aria-pressed={type === t}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-colors ${type === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                                }`}
                        >
                            {t}s
                        </button>
                    ))}
                </div>

                <select
                    value={uploadFolder}
                    onChange={(e) => setUploadFolder(e.target.value)}
                    title="Folder new uploads go into"
                    className="h-10 px-3 text-sm border border-gray-300 rounded-lg bg-white"
                >
                    {UPLOAD_FOLDERS.map((f) => (
                        <option key={f.value} value={f.value}>
                            Upload to: {f.label}
                        </option>
                    ))}
                </select>

                <input
                    ref={fileRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => e.target.files && upload(e.target.files)}
                />
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading > 0}
                    className="inline-flex items-center gap-2 h-10 px-4 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                    {uploading > 0 ? (
                        <>
                            <Loader2 size={15} className="animate-spin" />
                            Uploading {uploading}
                        </>
                    ) : (
                        <>
                            <Upload size={15} />
                            Upload files
                        </>
                    )}
                </button>
            </div>

            {error && (
                <p className="mb-4 px-4 py-2.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                    {error}
                </p>
            )}

            {/* Grid */}
            {items.length === 0 && !loading ? (
                <p className="text-sm text-gray-500 text-center py-20 border border-dashed border-gray-200 rounded-xl">
                    No {type}s in this folder yet.
                </p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {items.map((item) => (
                        <div
                            key={item.publicId}
                            className="group relative rounded-xl overflow-hidden border border-gray-200 bg-white"
                        >
                            <div className="relative aspect-square bg-gray-100">
                                {item.resourceType === "video" ? (
                                    <video src={item.url} muted playsInline preload="metadata" className="w-full h-full object-cover" />
                                ) : (
                                    <Image
                                        src={thumbnailUrl(item.url)}
                                        alt={item.publicId}
                                        fill
                                        sizes="220px"
                                        unoptimized
                                        className="object-cover"
                                    />
                                )}

                                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        type="button"
                                        onClick={() => copy(item.url)}
                                        aria-label="Copy URL"
                                        className="p-1.5 rounded-lg bg-white/90 text-gray-700 hover:text-primary"
                                    >
                                        {copied === item.url ? <Check size={13} /> : <Copy size={13} />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => remove(item)}
                                        aria-label="Delete file"
                                        className="p-1.5 rounded-lg bg-white/90 text-red-600"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-2.5">
                                <p className="text-xs font-medium text-gray-900 truncate">
                                    {item.publicId.split("/").pop()}
                                </p>
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                    {item.width}×{item.height} · {Math.round(item.bytes / 1024)} KB
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {loading && (
                <p className="flex items-center justify-center gap-2 text-sm text-gray-500 py-8">
                    <Loader2 size={15} className="animate-spin" />
                    Loading
                </p>
            )}

            {cursor && !loading && (
                <div className="flex justify-center mt-6">
                    <button
                        type="button"
                        onClick={() => load({ cursor })}
                        className="px-5 py-2.5 text-sm font-semibold border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Load more
                    </button>
                </div>
            )}
        </div>
    )
}
