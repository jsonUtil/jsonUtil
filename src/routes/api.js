import express from "express";
import { apiAuth } from "../middleware/auth.js";
import { logRequest, readLogs } from "../middleware/logger.js";
import { generateHTMLForm, generateJSONSchema } from "../services/formGenerator.js";
import { validateJSON } from "../services/validator.js";
import { handleCRUD } from "../services/crudHandler.js";
import bodyParser from "body-parser";
import serverless from "serverless-http";
import cors from "cors";

const app = express();

// ✅ Enable CORS for all origins (safe for dev; tighten later if needed)
// app.use(cors());

// Middleware to parse JSON bodies if needed
// app.use(express.json());

// Setup CORS
const corsOptions = {
  origin: [ "https://json-ui-eosin.vercel.app", "http://localhost:3000" ],
  methods: ["GET","POST","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json());

function parsePayload(req) {
  try {
    return JSON.parse(req.headers["x-json-payload"] || "{}");
  } catch {
    return {};
  }
}

 app.post("/forms", apiAuth, logRequest, (req, res) => {
  const operation = req.headers["x-operation"];
  const responseType = req.headers["x-response-type"];
  const cssFramework = req.headers["x-css-framework"] || "none";
  const payload = parsePayload(req);

  if (operation === "FORM") {
    return responseType === "html"
      ? res.send(generateHTMLForm(payload, "", cssFramework))
      : res.json(generateJSONSchema(payload));
  }

  if (operation === "VALIDATE") {
    const schema = generateJSONSchema(payload);
    return res.json(validateJSON(schema, payload));
  }

  return res.json(handleCRUD(operation, payload));
});

// Logs endpoint returns array of decrypted JSON strings
 app.get("/logs", apiAuth, (req, res) => {
  const logs = readLogs();
  res.json(logs); // Array of decrypted JSON strings
});

 app.get("/", (req, res) => {
  res.json({ status: "ok", service: "JSON EHR Utils API" });
});

// ✅ Handle preflight automatically
export const handler = serverless(app);
export default app;
