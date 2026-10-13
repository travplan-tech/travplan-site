"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Check, Loader2, Search, Trash2, Upload, X } from "lucide-react"
import { ROOT_FOLDER, thumbnailUrl } from "@/lib/media-folders"

export interface MediaItem {
    publicId: string
    url: string
    format: string
    width: number
    height: number
    bytes: number
    createdAt: string
    resourceType: string
}

interface Folder {
    name: string
    path: string
}

/**
 * Cloudinary media picker.
 *
 * Browses what is already in the library, uploads new files, and returns the
 * chosen URLs. `multiple` is what the package gallery uses to pick several
 * images in one go.
 */
export default function MediaPicker({
    open,
    onClose,
    onSelect,
    multiple = false,
    type = "image",
    folder = `${ROOT_FOLDER}/site`,
}: {
    open: boolean
    onClose: () => void
    onSelect: (urls: string[]) => void
    multiple?: boolean
    type?: "image" | "video"
    /** Folder new uploads go into */
    folder?: string
}) {
    const [items, setItems] = useState<MediaItem[]>([])
    const [folders, setFolders] = useState<Folder[]>([])
    const [activeFolder, setActiveFolder] = useState("all")
    const [query, setQuery] = useState("")
    const [cursor, setCursor] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(0)
    const [selected, setSelected] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)

    const load = useCallback(
        async (opts: { reset?: boolean; cursor?: string | null } = {}) => {
            setLoading(true)
            setError(null)
            try {
                const params = new URLSearchParams({ folder: activeFolder, type })
                if (query.trim()) params.set("q", query.trim())
                if (opts.cursor) params.set("cursor", opts.cursor)

                const res = await fetch(`/api/admin/media?${params}`)
                if (!res.ok) throw new Error((await res.json()).error || "Failed to load media")
                const data = await res.json()

                setItems((prev) => (opts.reset ? data.resources : [...prev, ...data.resources]))
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
        if (!open) return
        setSelected([])
        load({ reset: true })
        fetch("/api/admin/media/folders")
            .then((r) => r.json())
            .then((d) => setFolders(d.folders || []))
            .catch(() => setFolders([{ name: "All media", path: "all" }]))
    }, [open, load])

    // Re-query when the folder or search term changes
    useEffect(() => {
        if (!open) return
        const t = setTimeout(() => load({ reset: true }), 300)
        return () => clearTimeout(t)
    }, [activeFolder, query, open, load])

    const upload = async (files: FileList) => {
        setError(null)
        setUploading(files.length)

        try {
            for (const file of Array.from(files)) {
                const timestamp = Math.round(Date.now() / 1000)
                const signRes = await fetch("/api/admin/upload-signature", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ folder, timestamp }),
                })
                if (!signRes.ok) throw new Error("Could not authorise the upload")
                const { signature, apiKey, cloudName } = await signRes.json()

                const form = new FormData()
                form.append("file", file)
                form.append("api_key", apiKey)
                form.append("timestamp", String(timestamp))
                form.append("signature", signature)
                form.append("folder", folder)

                const res = await fetch(
                    `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`,
                    { method: "POST", body: form }
                )
                if (!res.ok) throw new Error(`Upload failed for ${file.name}`)
                setUploading((n) => n - 1)
            }
            await load({ reset: true })
        } catch (e) {
            setError(e instanceof Error ? e.message : "Upload failed")
        } finally {
            setUploading(0)
            if (fileRef.current) fileRef.current.value = ""
        }
    }

    const toggle = (url: string) => {
        setSelected((prev) =>
            multiple
                ? prev.includes(url)
                    ? prev.filter((u) => u !== url)
                    : [...prev, url]
                : prev.includes(url)
                    ? []
                    : [url]
        )
    }

    const remove = async (item: MediaItem) => {
        if (!confirm(`Delete this file from Cloudinary permanently?\n\n${item.publicId}`)) return
        try {
            const res = await fetch(
                `/api/admin/media?publicId=${encodeURIComponent(item.publicId)}&type=${type}`,
                { method: "DELETE" }
            )
            if (!res.ok) throw new Error((await res.json()).error || "Delete failed")
            setItems((prev) => prev.filter((i) => i.publicId !== item.publicId))
            setSelected((prev) => prev.filter((u) => u !== item.url))
        } catch (e) {
            setError(e instanceof Error ? e.message : "Delete failed")
        }
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm">
            <div className="flex flex-col w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Media library</h2>
                        <p className="text-xs text-gray-500">
                            {multiple ? "Select one or more files" : "Select a file"} ·{" "}
                            {type === "video" ? "Videos" : "Images"}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-gray-200 bg-gray-50">
                    <div className="relative flex-1 min-w-[180px]">
                        <Search
                            size={15}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by file name"
                            className="w-full h-9 pl-9 pr-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>

                    <select
                        value={activeFolder}
                        onChange={(e) => setActiveFolder(e.target.value)}
                        className="h-9 px-3 text-sm border border-gray-300 rounded-lg bg-white"
                    >
                        {folders.map((f) => (
                            <option key={f.path} value={f.path}>
                                {f.name}
                            </option>
                        ))}
                    </select>

                    <input
                        ref={fileRef}
                        type="file"
                        multiple
                        accept={type === "video" ? "video/*" : "image/*"}
                        className="hidden"
                        onChange={(e) => e.target.files && upload(e.target.files)}
                    />
                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading > 0}
                        className="inline-flex items-center gap-2 h-9 px-4 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                        {uploading > 0 ? (
                            <>
                                <Loader2 size={15} className="animate-spin" />
                                Uploading {uploading}
                            </>
                        ) : (
                            <>
                                <Upload size={15} />
                                Upload
                            </>
                        )}
                    </button>
                </div>

                {error && (
                    <p className="px-5 py-2 text-sm text-red-700 bg-red-50 border-b border-red-100">
                        {error}
                    </p>
                )}

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-5">
                    {items.length === 0 && !loading ? (
                        <p className="text-sm text-gray-500 text-center py-16">
                            Nothing here yet. Upload a file to get started.
                        </p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {items.map((item) => {
                                const isSelected = selected.includes(item.url)
                                return (
                                    <div
                                        key={item.publicId}
                                        className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-colors ${isSelected ? "border-primary" : "border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => toggle(item.url)}
                                            className="absolute inset-0 w-full h-full"
                                            aria-pressed={isSelected}
                                        >
                                            {item.resourceType === "video" ? (
                                                <video
                                                    src={item.url}
                                                    muted
                                                    playsInline
                                                    preload="metadata"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Image
                                                    src={thumbnailUrl(item.url)}
                                                    alt={item.publicId}
                                                    fill
                                                    sizes="200px"
                                                    // Cloudinary already sized and encoded this, so
                                                    // re-optimising it just makes the grid slower.
                                                    unoptimized
                                                    className="object-cover"
                                                />
                                            )}
                                        </button>

                                        {isSelected && (
                                            <span className="absolute top-2 left-2 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow">
                                                <Check size={14} strokeWidth={3} />
                                            </span>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => remove(item)}
                                            aria-label="Delete file"
                                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={13} />
                                        </button>

                                        <span className="absolute inset-x-0 bottom-0 px-2 py-1 text-[10px] text-white bg-black/60 truncate">
                                            {item.publicId.split("/").pop()}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {loading && (
                        <p className="flex items-center justify-center gap-2 text-sm text-gray-500 py-6">
                            <Loader2 size={15} className="animate-spin" />
                            Loading
                        </p>
                    )}

                    {cursor && !loading && (
                        <div className="flex justify-center mt-5">
                            <button
                                type="button"
                                onClick={() => load({ cursor })}
                                className="px-4 py-2 text-sm font-semibold border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Load more
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-4 px-5 py-4 border-t border-gray-200 bg-gray-50">
                    <p className="text-sm text-gray-600">
                        {selected.length === 0
                            ? "Nothing selected"
                            : `${selected.length} selected`}
                    </p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-semibold border border-gray-300 rounded-lg hover:bg-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={selected.length === 0}
                            onClick={() => {
                                onSelect(selected)
                                onClose()
                            }}
                            className="px-5 py-2 text-sm font-semibold bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-lg transition-colors"
                        >
                            {multiple ? `Add ${selected.length || ""}`.trim() : "Select"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
