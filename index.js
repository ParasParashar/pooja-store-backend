import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import adminRoutes from "./routes/admin.route.js";
import imagesRoutes from "./routes/imageRoutes.js";
import storeRoutes from "./routes/store.route.js";
import passport from "./config/passport.js";
import cors from "cors";
import MongoStore from "connect-mongo";
import path from "path";
import { fileURLToPath } from "url";

import { isSeller, isAuthenticated } from "./middlewares/authenticated.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true })); // to handle the form data
app.use(
  cors({
    origin: ["http://localhost:3000", process.env.FRONTEND_URL],
    credentials: true,
  })
);
// Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DATABASE_URL,
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 48,
    },
  })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// sending staitc files

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.send("<a href='/auth/logout'>Logout</a>" + req.user.name);
  } else {
    res.send("<a href='/auth/google'>Login with google</a> <br>");
  }
});

// auth routes
app.use("/auth", authRoutes);
// admin  routes
app.use("/api/admin", isAuthenticated, adminRoutes);
app.use("/api/image", imagesRoutes);
// store routes
app.use("/api/store", storeRoutes);

app.listen(PORT, () => {
  console.log("Backend is running on port " + PORT);
});
