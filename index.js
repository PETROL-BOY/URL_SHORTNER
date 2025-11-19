import express from "express";
import userRouter from "./routes/user.route.js";
import urlRouter from "./routes/url.routes.js";
import { authenticationmiddleware } from "./middlewares/auth.middleware.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ?? 8000;

// Make sure body parser middleware comes before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Update CORS configuration
app.use(
  cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:8000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Type", "Authorization"],
  })
);

// Add request logging middleware
app.use((req, res, next) => {
  const { email, password } = req.body;
  console.log("Email: ", email);
  console.log("Password: ", password);
  next();
});

app.use(express.static(path.join(__dirname, "view")));

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// Serve HTML pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "view", "hero.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "view", "login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "view", "signup.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "view", "dashboard.html"));
});

app.use("/user", userRouter);
app.use(authenticationmiddleware);
app.use(urlRouter);

app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
