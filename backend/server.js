import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import http from "http";
import { WebSocketServer } from "ws";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());

const DB_DIR = path.join(__dirname, "db");
const DB_PATH = path.join(DB_DIR, "messages.json");
const UPLOAD_DIR = path.join(__dirname, "uploads");

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, "[]");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({ dest: UPLOAD_DIR });

let messages = JSON.parse(fs.readFileSync(DB_PATH));
let onlineUsers = new Map();

function saveMessages() {
  fs.writeFileSync(DB_PATH, JSON.stringify(messages, null, 2));
}

function broadcast(type, data) {
  const payload = JSON.stringify({ type, data });
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(payload);
  }
}

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "history", data: messages.slice(-100) }));

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (msg.type === "join") {
      ws.sessionId = msg.sessionId;
      onlineUsers.set(msg.sessionId, msg.username);
      broadcast("user_list", Array.from(onlineUsers.values()));
      return;
    }

    if (msg.type === "message") {
      const entry = {
        username: msg.username,
        text: msg.text,
        timestamp: Date.now(),
      };
      messages.push(entry);
      if (messages.length > 10000) messages = messages.slice(-10000);
      saveMessages();
      broadcast("message", entry);
    }
  });

  ws.on("close", () => {
    if (ws.sessionId) {
      onlineUsers.delete(ws.sessionId);
      broadcast("user_list", Array.from(onlineUsers.values()));
    }
  });
});

app.get("/api/files", (req, res) => {
  const files = fs.readdirSync(UPLOAD_DIR).map((f) => {
    const stat = fs.statSync(path.join(UPLOAD_DIR, f));
    const parts = f.split("__");
    return {
      filename: f,
      originalName: parts.slice(2).join("__"),
      username: parts[0],
      timestamp: stat.mtimeMs,
      size: stat.size,
    };
  });
  res.json(files);
});

app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });

  const username = req.body.username || "anon";
  const original = req.file.originalname.replace(/[/\\]/g, "_");
  const newName = `${username}__${Date.now()}__${original}`;

  fs.renameSync(
    path.join(UPLOAD_DIR, req.file.filename),
    path.join(UPLOAD_DIR, newName)
  );

  res.json({ ok: true });
});

app.get("/api/download/:filename", (req, res) => {
  const safe = req.params.filename.replace(/[/\\]/g, "");
  const filePath = path.join(UPLOAD_DIR, safe);
  if (!fs.existsSync(filePath)) return res.status(404).send("Not found");
  res.download(filePath);
});

server.listen(3000, () =>
  console.log("Backend running on port 3000 (no encryption)")
);
