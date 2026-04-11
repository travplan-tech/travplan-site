import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json({ valid: false });
        }

        // Find the token
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (!resetToken) {
            return NextResponse.json({ valid: false });
        }

        // Check if token is expired
        if (resetToken.expiresAt < new Date()) {
            // Delete expired token
            await prisma.passwordResetToken.delete({
                where: { token },
            });
            return NextResponse.json({ valid: false });
        }

        return NextResponse.json({ valid: true });
    } catch (error) {
        console.error("Validate reset token error:", error);
        return NextResponse.json({ valid: false });
    }
}
