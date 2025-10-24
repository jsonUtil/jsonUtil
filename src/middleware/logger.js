import fs from "fs";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const LOG_FILE = "./logs/requests.log";
const SYSTEM_KEY = process.env.SYSTEM_KEY || "default-system-key";

// AES Helper
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    crypto.createHash("sha256").update(SYSTEM_KEY).digest(),
    iv
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(enc) {
  try {
    const [ivHex, data] = enc.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      crypto.createHash("sha256").update(SYSTEM_KEY).digest(),
      iv
    );
    let decrypted = decipher.update(data, "hex", "utf8");
    decrypted += decipher.final("utf8");
    // Return decrypted JSON string, not parsed object
    return decrypted;
  } catch (err) {
    // Return JSON string describing the error
    return JSON.stringify({ error: "Failed to decrypt log", raw: enc });
  }
}

// Middleware: log request
export function logRequest(req, res, next) {
  const entry = {
    time: new Date().toISOString(),
    headers: req.headers,
    method: req.method,
    url: req.originalUrl,
  };

  const encrypted = encrypt(JSON.stringify(entry));
  fs.appendFileSync(LOG_FILE, encrypted + "\n", "utf8");
  next();
}

// Helper: read & decrypt all logs as strings
export function readLogs() {
  if (!fs.existsSync(LOG_FILE)) return [];
  const lines = fs.readFileSync(LOG_FILE, "utf8").trim().split("\n");
  return lines.map(decrypt); // Returns array of decrypted JSON strings
}
