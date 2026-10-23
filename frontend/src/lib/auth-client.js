import { createAuthClient } from "better-auth/react";

const getBackendUrl = () => {
    if (import.meta.env.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL;
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
    return "http://localhost:5000";
};

// Global listener to capture tokens posted from Better-Auth OAuth popup completion
if (typeof window !== "undefined") {
    window.addEventListener("message", (event) => {
        if (event.data?.type === "better-auth:oauth-popup" && event.data?.token) {
            try {
                localStorage.setItem("sentinel_token", event.data.token);
                localStorage.setItem("better-auth.popup_token", event.data.token);
            } catch (e) {
                // Ignore localStorage errors
            }
        }
    });
}

export const authClient = createAuthClient({
    baseURL: getBackendUrl(),
    fetchOptions: {
        onRequest(context) {
            try {
                const token = typeof window !== "undefined"
                    ? (localStorage.getItem("sentinel_token") || localStorage.getItem("better-auth.popup_token"))
                    : null;
                if (token) {
                    const headers = new Headers(context.headers);
                    if (!headers.has("authorization")) {
                        headers.set("authorization", `Bearer ${token}`);
                    }
                    return { ...context, headers };
                }
            } catch (e) {
                // Ignore
            }
        },
        onResponse(context) {
            try {
                const token = context.response?.headers?.get("set-auth-token");
                if (token && typeof window !== "undefined") {
                    localStorage.setItem("sentinel_token", token);
                    localStorage.setItem("better-auth.popup_token", token);
                }
            } catch (e) {
                // Ignore
            }
        }
    }
});

const originalSignOut = authClient.signOut;
authClient.signOut = async (...args) => {
    try {
        if (typeof window !== "undefined") {
            localStorage.removeItem("sentinel_token");
            localStorage.removeItem("better-auth.popup_token");
        }
    } catch (e) {}
    return originalSignOut(...args);
};

export const { signIn, signUp, useSession } = authClient;