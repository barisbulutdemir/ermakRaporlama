import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's id. */
            id: string
            /** The user's username. */
            username: string
            /** The user's role. */
            role: string
            /** Whether the user is active. */
            isActive: boolean
        } & DefaultSession["user"]
    }

    interface User {
        username: string
        role: string
        approved: boolean
        isActive: boolean
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        /** The user's username. */
        username: string
        /** The user's role. */
        role: string
        /** The user's id. */
        id: string
    }
}
