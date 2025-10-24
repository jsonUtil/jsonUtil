import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes/apiRoutes.js";

dotenv.config();
const app = express();
// const PORT = process.env.PORT || 4000;
const PORT = process.env.PORT || 3000; // important for Railway

// ✅ Enable CORS for all origins (safe for dev; tighten later if needed)
// Setup CORS
const corsOptions = {
  origin: [ "https://json-ui-eosin.vercel.app", "http://localhost:3000" ],
  methods: ["GET","POST","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// app.use(cors());

// Middleware to parse JSON bodies if needed
app.use(express.json());

// Routes
app.use("/v1", apiRoutes);

app.get("/", (req, res) => {
  res.send("Hello from jsonUtil!");
});

app.listen(PORT, () => {
  console.log(`🚀 JSON EHR Utils running on port ${PORT}`);
});
