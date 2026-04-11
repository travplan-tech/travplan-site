import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// For development only
if (process.env.NODE_ENV !== "production") {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const globalForPrisma = global as unknown as { prisma: PrismaClient; pool: Pool };

const connectionString = process.env.DATABASE_URL!;
const isServerless = process.env.NODE_ENV === "production" || !!process.env.VERCEL;

// Conservative Singleton Pattern
if (!globalForPrisma.pool) {
    globalForPrisma.pool = new Pool({
        connectionString,
        ssl: isServerless || connectionString.includes("sslmode=require")
            ? { rejectUnauthorized: false }
            : undefined,
        // Optimized pool settings for serverless environments
        max: isServerless ? 5 : 2, // Reduced to 2 for development to prevent connection issues
        min: 0, // Don't keep idle connections in development
        idleTimeoutMillis: 10000, // Shorter timeout in dev
        connectionTimeoutMillis: 10000, // 10s for cold starts
        query_timeout: 15000, // 15s max query time
    });
}

const pool = globalForPrisma.pool;

if (!globalForPrisma.prisma) {
    const adapter = new PrismaPg(pool);
    globalForPrisma.prisma = new PrismaClient({
        adapter,
        log: ["error"],
    });
}

export const prisma = globalForPrisma.prisma;
