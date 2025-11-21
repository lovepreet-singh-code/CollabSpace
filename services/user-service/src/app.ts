import express from "express";
import "express-async-errors";
import authRoutes from "./routes/auth.routes";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());
app.use("/api/auth", authRoutes);

app.get("/", (_, res) => res.json({ service: "user-service", ok: true }));

// basic error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: any) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Internal server error" });
});

export default app;
