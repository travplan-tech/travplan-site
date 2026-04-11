"use server"

import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { signupSchema, SignupInput } from "@/lib/validations/auth"

export async function registerUser(data: SignupInput) {
    const validatedFields = signupSchema.safeParse(data)

    if (!validatedFields.success) {
        return { error: "Invalid fields" }
    }

    const { name, email, password } = validatedFields.data

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return { error: "Email already in use" }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        })

        return { success: "User created successfully" }
    } catch (error) {
        console.error("Registration error:", error)
        return { error: "Something went wrong" }
    }
}
