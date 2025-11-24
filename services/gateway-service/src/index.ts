import express from "express";
import cors from "cors";
import helmet from "helmet";
import config from "./config";
import { requestLogger } from "./logger";
import { limiter } from "./rateLimiter";
import routes from "./routes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(requestLogger);
app.use(limiter);

app.use("/", routes);

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({ status: "UP" });
});

app.listen(config.port, () => {
    console.log(`Gateway Service running on port ${config.port}`);
});
