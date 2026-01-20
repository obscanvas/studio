import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config dosya yolu
const CONFIG_FILE = path.resolve(__dirname, "..", "config.json");

async function startServer() {
  const app = express();
  const server = createServer(app);

  // JSON body parser
  app.use(express.json({ limit: "10mb" }));

  // CORS headers - tüm cihazlardan erişim için
  app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
  });

  // API Endpoints

  // GET /api/config - Config'i oku
  app.get("/api/config", async (_req, res) => {
    try {
      const data = await fs.readFile(CONFIG_FILE, "utf-8");
      const config = JSON.parse(data);
      res.json(config);
    } catch (error: any) {
      // Dosya yoksa default config dön
      if (error.code === "ENOENT") {
        res.json(null);
      } else {
        console.error("Config okuma hatası:", error);
        res.status(500).json({ error: "Config okunamadı" });
      }
    }
  });

  // POST /api/config - Config'i kaydet
  app.post("/api/config", async (req, res) => {
    try {
      const config = req.body;
      await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
      res.json({ success: true, message: "Config kaydedildi" });
    } catch (error) {
      console.error("Config kaydetme hatası:", error);
      res.status(500).json({ error: "Config kaydedilemedi" });
    }
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}/`);
    console.log(`📁 Config file: ${CONFIG_FILE}`);
  });
}

startServer().catch(console.error);

