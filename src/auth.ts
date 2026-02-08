import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { z } from "zod"

import { User } from "@prisma/client"

async function getUser(username: string): Promise<any> {
    try {
        const user = await prisma.user.findUnique({
            where: { username },
        })
        return user
    } catch (error) {
        console.error("Failed to fetch user:", error)
        throw new Error("Failed to fetch user.")
    }
}

import { authConfig } from "./auth.config"

// ... existing code ...

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    trustHost: true,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ username: z.string(), password: z.string().min(4) })
                    .safeParse(credentials)

                if (parsedCredentials.success) {
                    const { username, password } = parsedCredentials.data
                    const user = await getUser(username)
                    if (!user) return null

                    // Check if user is approved
                    if (!user.approved) {
                        throw new Error("Your account is pending admin approval.")
                    }

                    if (!user.isActive) {
                        throw new Error("Your account is inactive.")
                    }

                    const passwordsMatch = await bcrypt.compare(password, user.password)
                    if (passwordsMatch) return user
                }

                return null
            },
        }),
    ],
    // pages config is inherited from authConfig
    callbacks: {
        ...authConfig.callbacks, // Include authorized callback
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.name = token.name as string
                session.user.username = token.name as string
                session.user.role = token.role as string
                session.user.id = token.sub as string
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.name = user.username
                token.role = user.role
            }
            return token
        }
    }
})
