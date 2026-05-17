import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
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
import { sseService } from "./services/sse.service";
import { authMiddleware } from "./middlewares/auth.middleware";
import { errorHandler } from "./middlewares/error.middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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
app.use(morgan("dev"));
app.use(express.json());

// Rate limiting
const isDev = process.env.NODE_ENV !== "production";
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

app.use("/api/auth", authRouter);
app.use("/api/stations", stationRouter);
app.use("/api/schedules", scheduleRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/export", exportRouter);
app.use("/api/users", userRouter);
app.use("/api/activity-logs", activityLogRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/permissions", permissionRouter);

// SSE endpoint for real-time notifications
app.get("/api/events", (_req, res) => {
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
