import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Fetch site settings (public for sale button)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const key = searchParams.get("key");

        if (key) {
            // Fetch single setting
            const setting = await prisma.siteSetting.findUnique({
                where: { key },
            });
            return NextResponse.json(setting);
        }

        // Fetch all settings
        const settings = await prisma.siteSetting.findMany();

        // Convert to key-value object for easier consumption
        const settingsObj: Record<string, string> = {};
        settings.forEach((s: { key: string; value: string }) => {
            settingsObj[s.key] = s.value;
        });

        return NextResponse.json(settingsObj);
    } catch (error) {
        console.error("Failed to fetch settings:", error);
        return NextResponse.json(
            { error: "Failed to fetch settings" },
            { status: 500 }
        );
    }
}

// POST - Update/Create site setting (admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { key, value } = await request.json();

        if (!key) {
            return NextResponse.json(
                { error: "Key is required" },
                { status: 400 }
            );
        }

        // Upsert the setting
        const setting = await prisma.siteSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        });

        return NextResponse.json(setting);
    } catch (error) {
        console.error("Failed to update setting:", error);
        return NextResponse.json(
            { error: "Failed to update setting" },
            { status: 500 }
        );
    }
}
