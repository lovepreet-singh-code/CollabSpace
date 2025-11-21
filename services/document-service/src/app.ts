import express from "express";
import "express-async-errors";
import bodyParser from "body-parser";
import docRoutes from "./routes/document.routes";

const app = express();
app.use(bodyParser.json());

app.use("/api/documents", docRoutes);

app.get("/", (_req, res) => res.json({ service: "document-service", ok: true }));

app.use((err: any, _req: express.Request, res: express.Response, _next: any) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Internal server error" });
});

export default app;
