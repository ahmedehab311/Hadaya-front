import express, { type Express } from "express";
import cors from "cors";
import session from "express-session";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET env var is required");
}

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  }),
);

// API key guard — only active when API_KEY env var is set.
// Every request to /api must carry the matching `api-key` header.
if (process.env.API_KEY) {
  const expectedKey = process.env.API_KEY;
  app.use("/api", (req, res, next) => {
    const provided = req.headers["api-key"];
    if (provided !== expectedKey) {
      res.status(401).json({ error: "Invalid or missing api-key header" });
      return;
    }
    next();
  });
}

app.use("/api", router);

export default app;
