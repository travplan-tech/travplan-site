import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { requireAdmin } from "@/lib/auth-helpers"
import { BROWSE_FOLDERS } from "@/lib/media-folders"

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

/** Every app folder and its sub-folders, for the media library's filter. */
export async function GET() {
    const { user, error, status } = await requireAdmin()
        if (error || !user) {
            return NextResponse.json(
                { error: error || "Unauthorized - Admin access required" },
                { status: status || 403 }
            )
        }

    const folders: { name: string; path: string }[] = [{ name: "All media", path: "all" }]
    // Cloudinary's folder API ignores case, so "TravPlan" and the legacy
    // lowercase "Travplan" return the same sub-folders. Keep the first spelling
    // of each path so the filter does not list duplicates.
    const seen = new Set<string>()

    for (const root of BROWSE_FOLDERS) {
        if (!seen.has(root.toLowerCase())) {
            seen.add(root.toLowerCase())
            folders.push({ name: root, path: root })
        }
        try {
            const result = await cloudinary.api.sub_folders(root)
            for (const f of result.folders || []) {
                if (seen.has(f.path.toLowerCase())) continue
                seen.add(f.path.toLowerCase())
                folders.push({ name: `${root} / ${f.name}`, path: f.path })
            }
        } catch (error) {
            // A folder that does not exist yet is not an error worth failing on.
            console.error(`Could not list sub-folders of ${root}:`, error)
        }
    }

    return NextResponse.json({ folders })
}
