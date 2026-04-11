import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        // Get all packages with their destination info
        const packages = await prisma.package.findMany({
            select: {
                price: true,
                destination: {
                    select: {
                        country: true,
                    }
                }
            }
        })

        // Define budget ranges for domestic and international
        const domesticBudgets = [10000, 20000, 30000, 50000]
        const internationalBudgets = [30000, 50000, 75000, 100000]

        // Separate packages by type (India = domestic, others = international)
        const domesticPackages = packages.filter(p => p.destination?.country?.toLowerCase() === "india")
        const internationalPackages = packages.filter(p => p.destination?.country?.toLowerCase() !== "india")

        // Count packages for each budget range
        const countByBudget = (pkgs: typeof packages, budgets: number[]) => {
            const counts: Record<number, number> = {}
            budgets.forEach(budget => {
                counts[budget] = pkgs.filter(p => p.price <= budget).length
            })
            return counts
        }

        const result = {
            domestic: {
                totalTours: domesticPackages.length,
                budgetCounts: countByBudget(domesticPackages, domesticBudgets)
            },
            international: {
                totalTours: internationalPackages.length,
                budgetCounts: countByBudget(internationalPackages, internationalBudgets)
            }
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error("Failed to fetch budget stats:", error)
        return NextResponse.json(
            { error: "Failed to fetch budget statistics" },
            { status: 500 }
        )
    }
}
