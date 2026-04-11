"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react"
import { registerUser } from "@/app/actions/auth"
import { toast } from "sonner"

export default function SignupPage() {
    const router = useRouter()
    const { data: session, status } = useSession()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Redirect if already authenticated
    useEffect(() => {
        if (status === "authenticated") {
            router.push("/")
        }
    }, [status, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await registerUser({ name, email, password })
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Account created successfully!")
                router.push("/auth/signin")
            }
        } catch (err) {
            toast.error("Something went wrong")
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
                    <p className="text-muted-foreground">Create your account</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-card rounded-lg shadow-lg p-8 space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                    </div>

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
                                required
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
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" disabled={isLoading} className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                        {isLoading ? "Creating account..." : "Sign Up"}
                    </button>

                    {/* Sign In Link */}
                    <div className="text-center text-sm">
                        <span className="text-muted-foreground">Already have an account? </span>
                        <Link href="/auth/signin" className="text-primary font-semibold hover:underline">
                            Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    )
}
