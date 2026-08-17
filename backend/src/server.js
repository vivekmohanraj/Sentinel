import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import { runMigrations } from "./db/migrate.js";
import userRoutes from "./routes/userRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import orgRoutes from "./routes/orgRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import commitRoutes from "./routes/commitRoutes.js";
import moduleMetricRoutes from "./routes/moduleMetricRoutes.js";
import predictionRoutes from "./routes/predictionRoutes.js";
import prScannerRoutes from "./routes/prScannerRoutes.js";
import knowledgeGraphRoutes from "./routes/knowledgeGraphRoutes.js";
import refactorGeneratorRoutes from "./routes/refactorGeneratorRoutes.js";
import busFactorRoutes from "./routes/busFactorRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"], // Vite Frontend Client
    credentials: true,
}));

// Better Auth endpoint routing
app.use("/api/auth", toNodeHandler(auth));

app.use(express.json());

// API Routes
app.use("/api/user", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/org", orgRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/commits", commitRoutes);
app.use("/api/metrics", moduleMetricRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/pr", prScannerRoutes);
app.use("/api/graph", knowledgeGraphRoutes);
app.use("/api/refactor", refactorGeneratorRoutes);
app.use("/api/bus-factor", busFactorRoutes);

app.get("/health", (req, res) => {
    res.status(200).json({ status: "Sentinel Backend & Database Operational", timestamp: new Date() });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
    console.error('[Server Error]:', err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
});

app.listen(PORT, async () => {
    console.log(`Sentinel backend running on port ${PORT}`);
    await runMigrations();
});