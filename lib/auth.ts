import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import type { NextAuthOptions } from "next-auth"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"
import { withDbRetry } from "./db-retry"
import { resolveRole } from "./admin-allowlist"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            email?: string | null
            name?: string | null
            image?: string | null
            role?: string | null
        }
    }

    interface User {
        id: string
        role?: string | null
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role?: string | null
    }
}



export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials")
                }

                // Retried: the database's connection limit is routinely reached,
                // and signing in is the one thing that must not fail because of
                // it. A failure here is also reported distinctly — telling
                // someone with the right password that their credentials are
                // invalid would send them off resetting a working password.
                let user
                try {
                    user = await withDbRetry(
                        () => prisma.user.findUnique({ where: { email: credentials.email } }),
                        { label: "signin" }
                    )
                } catch (error) {
                    console.error("Sign-in failed: could not reach the database", error)
                    throw new Error("Service temporarily unavailable. Please try again in a moment.")
                }

                if (!user || !user.password) {
                    throw new Error("Invalid credentials")
                }

                const passwordMatch = await bcrypt.compare(credentials.password, user.password)
                if (!passwordMatch) {
                    throw new Error("Invalid credentials")
                }

                return {
                    id: user.id.toString(),
                    email: user.email,
                    name: user.name,
                    // Not user.role directly: an ADMIN row whose address is not
                    // on the allowlist signs in as an ordinary customer.
                    role: resolveRole(user.email, user.role),
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.email = user.email
                token.role = user.role
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as string
            }
            return session
        },
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    secret: process.env.NEXTAUTH_SECRET,
}
