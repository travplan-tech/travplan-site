import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { requireAuth } from "@/lib/auth-helpers"

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
    try {
        // Check admin authorization
        const { user, error, status } = await requireAuth()
        if (error || !user || user.role !== "ADMIN") {
            return NextResponse.json(
                { error: error || "Unauthorized - Admin access required" },
                { status: status || 403 }
            )
        }

        const body = await request.json()
        const { folder, timestamp, paramsToSign } = body

        // For manual uploads (new approach)
        if (folder && timestamp) {
            const params = {
                timestamp: timestamp,
                folder: folder,
            }

            const signature = cloudinary.utils.api_sign_request(
                params,
                process.env.CLOUDINARY_API_SECRET!
            )

            return NextResponse.json({
                signature,
                timestamp,
                cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                apiKey: process.env.CLOUDINARY_API_KEY,
            })
        }

        // For CldUploadWidget (legacy approach)
        if (paramsToSign) {
            const { signature: _, ...params } = paramsToSign || {}

            const signature = cloudinary.utils.api_sign_request(
                params,
                process.env.CLOUDINARY_API_SECRET!
            )

            return NextResponse.json({
                signature,
            })
        }

        return NextResponse.json(
            { error: "Missing required parameters" },
            { status: 400 }
        )
    } catch (error) {
        console.error("Error generating upload signature:", error)
        return NextResponse.json(
            { error: "Failed to generate upload signature" },
            { status: 500 }
        )
    }
}
