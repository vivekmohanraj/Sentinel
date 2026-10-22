import { createAuthClient } from "better-auth/react";

const getBackendUrl = () => {
    if (import.meta.env.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL;
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
    return "http://localhost:5000";
};

export const authClient = createAuthClient({
    baseURL: getBackendUrl(),
});

export const { signIn, signUp, useSession } = authClient;