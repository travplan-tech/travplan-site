import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Fetch homepage settings (public endpoint)
export async function GET() {
    try {
        // Fetch specific homepage settings
        const settings = await prisma.siteSetting.findMany({
            where: {
                key: {
                    in: [
                        "heroBackgroundImage",
                        "heroTitle",
                        "heroSubtitle",
                        "bannerImage",
                    ],
                },
            },
        });

        // Convert to key-value object for easier consumption
        const settingsObj: Record<string, string> = {};
        settings.forEach((s: { key: string; value: string }) => {
            settingsObj[s.key] = s.value;
        });

        // Provide defaults if not set
        if (!settingsObj.heroBackgroundImage) {
            settingsObj.heroBackgroundImage = "https://images.unsplash.com/photo-1764276266750-4d6316e972e0?q=80&w=1173&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
        }

        return NextResponse.json(settingsObj);
    } catch (error) {
        console.error("Failed to fetch homepage settings:", error);
        return NextResponse.json(
            { error: "Failed to fetch homepage settings" },
            { status: 500 }
        );
    }
}
