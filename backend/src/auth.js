import dotenv from "dotenv";
dotenv.config();

import { betterAuth } from "better-auth";
import dbPool from './config/db.js';

const isProduction = process.env.NODE_ENV === "production" || process.env.BETTER_AUTH_URL?.startsWith("https://");
const frontendUrl = (process.env.FRONTEND_URL || "https://sentinel-xi-vert.vercel.app").replace(/\/+$/, '');

export const auth = betterAuth({
    database: dbPool,
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",
    onAPIError: {
        errorURL: frontendUrl,
    },
    trustedOrigins: [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://sentinel-xi-vert.vercel.app",
        "https://*.vercel.app",
        "*.vercel.app",
        frontendUrl,
    ].filter(Boolean),
    emailAndPassword: { enabled: true },
    socialProviders: {
        google: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET },
        github: { clientId: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET },
    },
    user: { modelName: "tbl_user" },
    session: { modelName: "tbl_session" },
    account: {
        modelName: "tbl_account",
        storeStateStrategy: "database",
        skipStateCookieCheck: true,
    },
    verification: { modelName: "tbl_verification" },
    advanced: {
        useSecureCookies: isProduction,
        defaultCookieAttributes: {
            sameSite: isProduction ? "none" : "lax",
            secure: isProduction,
            partitioned: isProduction,
        },
    },
});