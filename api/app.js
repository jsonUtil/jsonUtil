import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("✅ Express API running on Vercel!");
});

// Instead of app.listen(), export app
export default app;
