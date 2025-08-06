import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import nodemailer from "nodemailer";

// ✅ Load environment variables from .env
dotenv.config();

const app = express();

// ✅ CORS Configuration — allow frontend on port 5173 and 5174
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:5174"
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed for this origin"));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: true
}));

// ✅ Middleware to parse JSON requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5174");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});
// ✅ Test route
app.get("/", (req, res) => {
  res.send("✅ Backend is running");
});

// ✅ GET fallback for /api/generate
app.get("/api/generate", (req, res) => {
  res.send("❗ This endpoint expects a POST request with a 'prompt' field.");
});

// ✅ POST: Generate AI email using Groq API
app.post("/api/generate", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'prompt'" });
  }

  console.log("📥 Prompt received:", prompt);

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-70b-8192", // ✅ Replace deprecated model
        messages: [
          { role: "system", content: "You are a helpful assistant that writes professional emails." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const email = response.data?.choices?.[0]?.message?.content;

    if (!email) {
      throw new Error("No email content returned from Groq.");
    }

    console.log("✅ Email generated:\n", email);
    res.json({ email });

  } catch (err) {
    console.error("❌ Error from Groq API:", err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to generate email",
      details: err.response?.data || err.message
    });
  }
});

// ✅ POST: Send email using Nodemailer
app.post("/api/send", async (req, res) => {
  const { recipients, subject, content } = req.body;

  if (!recipients || !content) {
    return res.status(400).json({ error: "Recipients and content are required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipients,
      subject: subject || "AI Generated Email",
      text: content
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "✅ Email sent successfully!" });

  } catch (err) {
    console.error("❌ Error sending email:", err.message);
    res.status(500).json({ error: "Failed to send email", details: err.message });
  }
});

// ✅ Start the backend server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// ✅ Catch unhandled errors
process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("🔥 Unhandled Rejection:", reason);
});
