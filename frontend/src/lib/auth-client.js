import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: "http://localhost:5000", // Points directly to your Express backend
});

export const { signIn, signUp, useSession } = authClient;