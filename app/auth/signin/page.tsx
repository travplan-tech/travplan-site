"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"

export default function SignIn() {
    const router = useRouter()
    const { data: session, status } = useSession()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    // Redirect if already authenticated
    useEffect(() => {
        if (status === "authenticated") {
            // Redirect admins to admin panel, others to home
            if (session?.user?.role === "ADMIN") {
                router.push("/admin")
            } else {
                router.push("/")
            }
        }
    }, [status, session, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError(result.error)
            } else if (result?.ok) {
                // Fetch session to check user role and redirect accordingly
                router.refresh()
                // The useEffect will handle the redirect based on role
            }
        } catch (err) {
            setError("An error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    // Show loading while checking authentication
    if (status === "loading") {
        return (
            <main className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading...</p>
                </div>
            </main>
        )
    }

    // Don't render the form if already authenticated
    if (status === "authenticated") {
        return null
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex w-12 h-12 bg-primary rounded-full items-center justify-center mb-4">
                        <span className="text-white text-xl">🌍</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Travplan</h1>
                    <p className="text-muted-foreground">Sign in to your account</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-card rounded-lg shadow-lg p-8 space-y-6">
                    {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-12 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <div className="text-right mt-1">
                            <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" disabled={isLoading} className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                        {isLoading ? "Signing in..." : "Sign In"}
                    </button>

                    {/* Sign Up Link */}
                    <div className="text-center text-sm">
                        <span className="text-muted-foreground">Don&apos;t have an account? </span>
                        <Link href="/auth/signup" className="text-primary font-semibold hover:underline">
                            Sign up
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    )
}
