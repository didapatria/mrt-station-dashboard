import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { authRouter } from "./routes/auth.routes";
import { stationRouter } from "./routes/station.routes";
import { scheduleRouter } from "./routes/schedule.routes";
import { dashboardRouter } from "./routes/dashboard.routes";
import { exportRouter } from "./routes/export.routes";
import { userRouter } from "./routes/user.routes";
import { activityLogRouter } from "./routes/activity-log.routes";
import { feedbackRouter } from "./routes/feedback.routes";
import { permissionRouter } from "./routes/permission.routes";
import { publicRouter } from "./routes/public.routes";
import { sseService } from "./services/sse.service";
import { authMiddleware } from "./middlewares/auth.middleware";
import { errorHandler } from "./middlewares/error.middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== "production";

// Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
      : "http://localhost:5173",
    credentials: true,
  }),
);
app.use(morgan(isDev ? "dev" : "combined"));
app.use(express.json());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isDev ? 1000 : 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests, please try again later.",
  },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isDev ? 100 : 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many login attempts, please try again later.",
  },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api", apiLimiter);

// Swagger UI
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "MRT Jakarta API Documentation",
  }),
);

// Swagger JSON
app.get("/api/docs.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Routes
/**
 * @swagger
 * /health:
 *   get:
 *     tags: [System]
 *     summary: Health check
 *     responses:
 *       200:
 *         description: API is running
 */
app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "MRT Station API is running" });
});

app.get("/api/system/status", authMiddleware, (_req, res) => {
  res.json({
    success: true,
    data: {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      rateLimit: {
        api: { windowMs: 900000, limit: isDev ? 1000 : 100 },
        auth: { windowMs: 900000, limit: isDev ? 100 : 20 },
      },
      sseClients: sseService.getClientCount(),
    },
  });
});

app.use("/api/public", publicRouter);
app.use("/api/auth", authRouter);
app.use("/api/stations", stationRouter);
app.use("/api/schedules", scheduleRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/export", exportRouter);
app.use("/api/users", userRouter);
app.use("/api/activity-logs", activityLogRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/permissions", permissionRouter);

/**
 * @swagger
 * /events:
 *   get:
 *     tags: [Realtime]
 *     summary: SSE stream — realtime events (requires JWT via ?token query param)
 *     description: |
 *       Server-Sent Events stream. Pass the JWT token as a query parameter since
 *       the browser's native EventSource API does not support custom headers.
 *
 *       **Events emitted:**
 *       - `activity` — station/schedule/user CUD operations
 *       - `station.updated` — station create/update/delete
 *       - `schedule.updated` — schedule create/update
 *       - `ping` — heartbeat every 30s (for stale connection detection)
 *     security: []
 *     parameters:
 *       - name: token
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT token from /auth/login or /auth/register
 *         example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: SSE stream opened
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               example: "event: ping\ndata: {\"ts\":1716451200000}\n\n"
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
app.get("/api/events", (req, res) => {
  const token = req.query.token as string | undefined;
  if (!token) {
    res.status(401).json({ success: false, error: "Token required" });
    return;
  }
  try {
    jwt.verify(token, process.env.JWT_SECRET || "fallback-secret");
  } catch {
    res.status(401).json({ success: false, error: "Invalid or expired token" });
    return;
  }
  sseService.addClient(res);
});

// Redirect root to API docs
app.get("/", (_req, res) => {
  res.redirect("/api/docs");
});

// Error handler
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger UI: http://localhost:${PORT}/api/docs`);
  });
}

export default app;
