require("dotenv").config();

const express    = require("express");
const cors       = require("cors");
const connectDB  = require("./config/db");
const bcrypt     = require("bcryptjs"); // ✅ use bcryptjs (safe on Render)
const User       = require("./models/User");

const http       = require("http");
const WebSocket  = require("ws");

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/",        (req, res) => res.status(200).send("VANET CMS Backend Running"));
app.get("/api/test",(req, res) => res.json({ message: "API working" }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",      require("./routes/auth_routes"));
app.use("/api/accidents", require("./routes/accident_routes"));
app.use("/api/rsu",       require("./routes/rsu_routes"));
app.use("/api/alerts",    require("./routes/alerts_routes"));
app.use("/api/admin",     require("./routes/admin_routes"));
app.use("/api/notifications", require("./routes/notifications_routes"));
app.use("/api/notifications", require("./routes/extra_routes")); 

// ── Default Admin Creator ─────────────────────────────────────────────────────
const createDefaultAdmin = async () => {
  try {
    const existing = await User.findOne({ username: "admin" });

    if (!existing) {
      const hashedPassword = await bcrypt.hash("admin123", 10);

      await User.create({
        username: "admin",
        password: hashedPassword,
        role: "admin"
      });

      console.log("✅ Default admin created (admin / admin123)");
    } else {
      console.log("ℹ️ Admin already exists");
    }
  } catch (err) {
    console.error("❌ Error creating admin:", err.message);
  }
};

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[CMS] Unhandled error:", err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// ── Create HTTP + WebSocket Server ────────────────────────────────────────────
const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

let clients = [];

wss.on("connection", (ws) => {
  console.log("🔌 WebSocket client connected");

  clients.push(ws);

  ws.on("close", () => {
    console.log("❌ WebSocket client disconnected");
    clients = clients.filter(c => c !== ws);
  });
});

// Global broadcast function
global.broadcast = (data) => {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await createDefaultAdmin();

    server.listen(PORT, () => {
      console.log(`[CMS] Server running on port ${PORT}`);
      console.log(`[CMS] WebSocket ready`);
    });

  } catch (err) {
    console.error("❌ Server startup failed:", err);
    process.exit(1);
  }
};

startServer();
