import express from "express";
import dotenv from "dotenv";
import cookieparser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import adminRoutes from "./routes/admin.route.js";
import imagesRoutes from "./routes/imageRoutes.js";
import storeRoutes from "./routes/store.route.js";
import userRoutes from "./routes/user.route.js";
import passport from "./config/passport.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { authenticateJWT, isSeller } from "./middlewares/authenticated.js";
import { razorpayWebhookHandler } from "./controllers/payment.controller.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = ["http://localhost:3000", process.env.FRONTEND_URL];

console.log(allowedOrigins);

app.use(cookieparser());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "50mb" }));

// Passport Middleware
app.use(passport.initialize());

// Sending static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.get("/", (req, res) => {
  res.send("<a href='/auth/google/callback'>Login with google</a> <br>");
});

app.use("/auth", authRoutes);
app.use("/auth/user", authenticateJWT, userRoutes);
app.use("/api/admin", authenticateJWT, isSeller, adminRoutes);
app.use("/api/image", authenticateJWT, isSeller, imagesRoutes);
app.use("/api/store", storeRoutes);
app.post("/verification", razorpayWebhookHandler);

app.listen(PORT, () => {
  console.log("Backend is running on port " + PORT);
});
