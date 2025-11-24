import express from "express";
import cors from "cors";
import helmet from "helmet";
import { requestLogger } from "./utils/logger";
import commentRoutes from "./routes/comment.routes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use("/api/comments", commentRoutes);

app.get("/health", (req, res) => {
    res.status(200).json({ status: "UP" });
});

export default app;
