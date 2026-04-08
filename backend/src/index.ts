import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth.routes";
import { stationRouter } from "./routes/station.routes";
import { scheduleRouter } from "./routes/schedule.routes";
import { errorHandler } from "./middlewares/error.middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "MRT Station API is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/stations", stationRouter);
app.use("/api/schedules", scheduleRouter);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
