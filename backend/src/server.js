import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: "http://localhost:5173", // Vite Frontend Client
    credentials: true,
}));

// Better Auth Catch-All Handler (Must precede express.json())
app.all("/api/auth/*", toNodeHandler(auth));

app.use(express.json());

app.get("/health", (req, res) => {
    res.status(200).json({ status: "Sentinel Backend & Database Operational", timestamp: new Date() });
});

app.listen(PORT, () => {
    console.log(`Sentinel backend running on port ${PORT}`);
});