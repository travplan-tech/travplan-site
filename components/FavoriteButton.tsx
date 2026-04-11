"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Heart, Loader2 } from "lucide-react"
import { useCheckFavoriteQuery, useToggleFavoriteMutation } from "@/lib/api/userApi"
import { cn } from "@/lib/utils"

interface FavoriteButtonProps {
    packageId: number
    className?: string
    size?: "sm" | "md" | "lg"
    variant?: "icon" | "button"
}

export default function FavoriteButton({
    packageId,
    className,
    size = "md",
    variant = "icon",
}: FavoriteButtonProps) {
    const { data: session } = useSession()
    const router = useRouter()
    const [isAnimating, setIsAnimating] = useState(false)

    const { data: favoriteStatus } = useCheckFavoriteQuery(packageId, {
        skip: !session?.user,
    })

    const [toggleFavorite, { isLoading }] = useToggleFavoriteMutation()

    const isFavorited = favoriteStatus?.favorited ?? false

    const sizeClasses = {
        sm: "w-3.5 h-3.5",
        md: "w-5 h-5",
        lg: "w-6 h-6",
    }

    const buttonSizeClasses = {
        sm: "p-1.5",
        md: "p-2",
        lg: "p-2.5",
    }

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!session?.user) {
            router.push("/auth/signin")
            return
        }

        if (isLoading) return

        setIsAnimating(true)
        try {
            await toggleFavorite(packageId).unwrap()
        } catch (error) {
            console.error("Failed to toggle favorite:", error)
        } finally {
            setTimeout(() => setIsAnimating(false), 300)
        }
    }

    if (variant === "button") {
        return (
            <button
                onClick={handleToggle}
                disabled={isLoading}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200",
                    isFavorited
                        ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300",
                    className
                )}
            >
                {isLoading ? (
                    <Loader2 className={cn(sizeClasses[size], "animate-spin")} />
                ) : (
                    <Heart
                        className={cn(
                            sizeClasses[size],
                            "transition-all duration-200",
                            isFavorited && "fill-red-500 text-red-500",
                            isAnimating && "scale-125"
                        )}
                    />
                )}
                <span className="text-sm font-medium">
                    {isFavorited ? "Saved" : "Save"}
                </span>
            </button>
        )
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            className={cn(
                buttonSizeClasses[size],
                "bg-white rounded-full shadow-md hover:bg-gray-100 transition-all duration-200",
                className
            )}
            title={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
            {isLoading ? (
                <Loader2 className={cn(sizeClasses[size], "animate-spin text-gray-400")} />
            ) : (
                <Heart
                    className={cn(
                        sizeClasses[size],
                        "transition-all duration-200",
                        isFavorited
                            ? "fill-red-500 text-red-500"
                            : "text-gray-600",
                        isAnimating && "scale-125"
                    )}
                />
            )}
        </button>
    )
}
