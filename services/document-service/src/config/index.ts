import dotenv from "dotenv";
dotenv.config();

export default {
  port: Number(process.env.PORT ?? 4002),
  mongoUri: process.env.MONGO_URI ?? "mongodb://localhost:27017/collabspace_documents",
  jwtSecret: process.env.JWT_SECRET ?? "change_this_secret",
  shareTokenSecret: process.env.SHARE_TOKEN_SECRET ?? "share_secret",
  shareExpiresIn: process.env.SHARE_LINK_EXPIRES_IN ?? "7d",
  userServiceUrl: process.env.USER_SERVICE_URL ?? "http://localhost:4001"
};
